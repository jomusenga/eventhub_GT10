import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { participantsApi, eventsApi, registrationsApi } from '../services/api';
import { validateParticipantFields } from '../utils/validation';

const EMPTY_PARTICIPANT = { nom: '', email: '', telephone: '', type: 'etudiant', eventId: '' };

function normalizeType(type) {
  const value = String(type || '').toLowerCase();
  if (value === 'étudiant' || value === 'etudiant') return 'etudiant';
  if (value === 'professeur') return 'professeur';
  if (value === 'externe') return 'externe';
  return 'etudiant';
}

export default function ParticipantForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_PARTICIPANT);
  const [events, setEvents] = useState([]);
  const [linkedEventIds, setLinkedEventIds] = useState([]);
  const [linkedEventsLabel, setLinkedEventsLabel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setErrorMsg('');
      try {
        const eventsData = await eventsApi.getAll();
        setEvents(eventsData);

        if (!isEditing) {
          setForm(EMPTY_PARTICIPANT);
          setLinkedEventIds([]);
          setLinkedEventsLabel([]);
          return;
        }

        const [participant, registrations] = await Promise.all([
          participantsApi.getById(id),
          registrationsApi.getByParticipant(id).catch(() => [])
        ]);

        const eventIds = (registrations || [])
          .map((reg) => String(reg.eventId ?? reg.event_id ?? ''))
          .filter(Boolean);

        const labels = eventIds.map((eventId) => {
          const ev = eventsData.find((item) => String(item.id) === String(eventId));
          return ev
            ? `${ev.titre} (${ev.date} — ${ev.lieu})`
            : `Événement #${eventId}`;
        });

        setLinkedEventIds(eventIds);
        setLinkedEventsLabel(labels);
        setForm({
          nom: participant.nom || participant.name || '',
          email: participant.email || '',
          telephone: participant.telephone || participant.phone || '',
          type: normalizeType(participant.type),
          // Vide en édition : on n'ajoute un événement que si l'utilisateur en choisit un explicitement
          eventId: ''
        });
      } catch {
        setErrorMsg(isEditing
          ? 'Impossible de charger ce participant ou ses inscriptions.'
          : 'Impossible de charger les événements.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const errors = validateParticipantFields(form);
    if (!isEditing && !form.eventId) {
      errors.push('Choisis un événement pour inscrire ce participant.');
    }
    if (errors.length > 0) {
      setStatus('error');
      setErrorMsg(errors.join(' '));
      return;
    }

    try {
      if (isEditing) {
        await participantsApi.update(id, {
          nom: form.nom,
          email: form.email,
          telephone: form.telephone,
          type: form.type
        });

        const selectedEventId = String(form.eventId || '');
        const alreadyLinked = linkedEventIds.includes(selectedEventId);
        if (selectedEventId && !alreadyLinked) {
          const { count } = await registrationsApi.getCountByEvent(selectedEventId);
          const event = events.find((ev) => String(ev.id) === selectedEventId);
          const capacite = event?.capaciteMax ?? 0;
          if (capacite > 0 && count >= capacite) {
            throw new Error("Profil enregistré, mais l'événement sélectionné est complet.");
          }
          await registrationsApi.register(selectedEventId, id);
        }
      } else {
        const availability = await eventsApi.checkAvailability(form.eventId);
        const { count } = await registrationsApi.getCountByEvent(form.eventId);
        if ((availability.maxCapacity || 0) - (count || 0) <= 0) {
          throw new Error("Impossible d'inscrire : l'événement sélectionné est complet.");
        }
        const participant = await participantsApi.create(form);
        await registrationsApi.register(form.eventId, participant.id);
      }
      navigate('/participants');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement ce participant ?')) return;
    try {
      await participantsApi.remove(id);
      navigate('/participants');
    } catch (err) {
      setErrorMsg(err.message || 'Impossible de supprimer ce participant.');
    }
  };

  if (loading) return <p className="state-message">Chargement…</p>;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/participants" className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          ← Retour aux participants
        </Link>
        <h1>{isEditing ? 'Modifier le participant' : 'Inscrire un participant'}</h1>
        <p>
          {isEditing
            ? 'Mets à jour le profil. Les événements déjà liés restent inchangés sauf si tu en ajoutes un nouveau ci-dessous.'
            : 'Crée le participant et inscris-le immédiatement à un événement existant.'}
        </p>
      </div>

      <form className="event-card" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="nom">Nom complet</label>
          <input id="nom" name="nom" value={form.nom} onChange={handleChange} minLength={2} required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone</label>
          <input
            id="telephone"
            name="telephone"
            type="tel"
            inputMode="tel"
            placeholder="+221 77 123 45 67"
            value={form.telephone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type de participant</label>
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            <option value="etudiant">Étudiant</option>
            <option value="professeur">Professeur</option>
            <option value="externe">Externe</option>
          </select>
        </div>

        {isEditing && (
          <div className="form-group">
            <label>Événement(s) actuel(s)</label>
            {linkedEventsLabel.length === 0 ? (
              <p className="state-message" style={{ padding: '0.4rem 0', textAlign: 'left' }}>
                Aucune inscription pour le moment.
              </p>
            ) : (
              <div className="event-meta" style={{ marginTop: 0 }}>
                {linkedEventsLabel.map((label) => (
                  <span key={label} className="badge">{label}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="eventId">
            {isEditing ? 'Ajouter un événement (optionnel)' : 'Événement à assigner'}
          </label>
          <select
            id="eventId"
            name="eventId"
            value={form.eventId}
            onChange={handleChange}
            required={!isEditing}
          >
            <option value="">
              {isEditing ? '— Ne rien ajouter —' : '— Choisir un événement —'}
            </option>
            {events.map((ev) => {
              const linked = linkedEventIds.includes(String(ev.id));
              return (
                <option key={ev.id} value={ev.id} disabled={linked}>
                  {ev.titre} ({ev.date} — {ev.lieu}){linked ? ' — déjà inscrit' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {errorMsg && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{errorMsg}</p>}

        <div className="actions-row">
          <button className="btn btn-primary" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting'
              ? 'Enregistrement…'
              : isEditing
                ? 'Enregistrer le profil'
                : 'Créer et inscrire'}
          </button>
          {isEditing && (
            <button type="button" className="btn btn-secondary" onClick={handleDelete} style={{ color: 'var(--color-danger)' }}>
              Supprimer
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
