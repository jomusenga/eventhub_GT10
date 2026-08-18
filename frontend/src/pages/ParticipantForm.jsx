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
  const [linkedRegistrations, setLinkedRegistrations] = useState([]);
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
          setLinkedRegistrations([]);
          setLinkedEventsLabel([]);
          return;
        }

        const [participant, registrations] = await Promise.all([
          participantsApi.getById(id),
          registrationsApi.getByParticipant(id).catch(() => [])
        ]);

        const regs = (registrations || []).filter(
          (reg) => reg.eventId ?? reg.event_id
        );

        const labels = regs.map((reg) => {
          const eventId = String(reg.eventId ?? reg.event_id);
          const ev = eventsData.find((item) => String(item.id) === eventId);
          return ev
            ? `${ev.titre} (${ev.date} — ${ev.lieu})`
            : `Événement #${eventId}`;
        });

        // Préremplit avec l'événement actuel pour pouvoir défiler et en choisir un autre
        const currentEventId = regs[0]
          ? String(regs[0].eventId ?? regs[0].event_id)
          : '';

        setLinkedRegistrations(regs);
        setLinkedEventsLabel(labels);
        setForm({
          nom: participant.nom || participant.name || '',
          email: participant.email || '',
          telephone: participant.telephone || participant.phone || '',
          type: normalizeType(participant.type),
          eventId: currentEventId
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

  /** Remplace les inscriptions existantes par un seul événement cible (pas d'ajout cumulatif). */
  async function replaceRegistration(participantId, targetEventId) {
    const selected = String(targetEventId || '');

    const toCancel = linkedRegistrations.filter((reg) => {
      const eventId = String(reg.eventId ?? reg.event_id ?? '');
      return eventId !== selected;
    });

    for (const reg of toCancel) {
      if (reg.id != null) {
        await registrationsApi.cancel(reg.id);
      }
    }

    if (!selected) return;

    const alreadyOnTarget = linkedRegistrations.some(
      (reg) => String(reg.eventId ?? reg.event_id) === selected
    );
    if (alreadyOnTarget) return;

    const { count } = await registrationsApi.getCountByEvent(selected);
    const event = events.find((ev) => String(ev.id) === selected);
    const capacite = event?.capaciteMax ?? 0;
    if (capacite > 0 && count >= capacite) {
      throw new Error("Profil enregistré, mais l'événement sélectionné est complet.");
    }
    await registrationsApi.register(selected, participantId);
  }

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

        // Vide = « Ne rien changer » → profil seul. Sinon → remplace l'inscription.
        if (form.eventId) {
          await replaceRegistration(id, form.eventId);
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
            ? 'Le champ événement est prérempli avec l’inscription actuelle. Choisis-en un autre pour la remplacer (sans cumuler).'
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
            {isEditing ? 'Modifier / choisir l’événement' : 'Événement à assigner'}
          </label>
          <select
            id="eventId"
            name="eventId"
            value={form.eventId}
            onChange={handleChange}
            required={!isEditing}
          >
            <option value="">
              {isEditing ? '— Ne rien changer —' : '— Choisir un événement —'}
            </option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.titre} ({ev.date} — {ev.lieu})
              </option>
            ))}
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
