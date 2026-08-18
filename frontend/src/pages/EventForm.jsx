import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../services/api';
import { validateEventFields } from '../utils/validation';

const EMPTY_EVENT = { titre: '', description: '', date: '', lieu: '', capaciteMax: 50 };

export default function EventForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_EVENT);
  const [eventStatus, setEventStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(isEditing);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    eventsApi.getById(id)
      .then((data) => {
        setForm({
          titre: data.titre || '',
          description: data.description || '',
          date: data.date ? String(data.date).slice(0, 10) : '',
          lieu: data.lieu || '',
          capaciteMax: data.capaciteMax ?? 50
        });
        setEventStatus(data.status || 'ACTIVE');
      })
      .catch(() => setErrorMsg("Impossible de charger l'événement."))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'capaciteMax' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const errors = validateEventFields(form);
    if (errors.length > 0) {
      setStatus('error');
      setErrorMsg(errors.join(' '));
      return;
    }

    try {
      if (isEditing) {
        await eventsApi.update(id, form);
        navigate(`/events/${id}`);
      } else {
        const created = await eventsApi.create(form);
        navigate(created?.id ? `/events/${created.id}` : '/admin/events');
      }
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleCancelEvent = async () => {
    if (!window.confirm(
      "Annuler cet événement ?\n\nLes inscriptions sont conservées. Tu pourras le restaurer ensuite."
    )) return;
    try {
      await eventsApi.cancel(id);
      navigate('/admin/events');
    } catch (err) {
      setErrorMsg(err.message || "Impossible d'annuler l'événement.");
    }
  };

  const handleRestoreEvent = async () => {
    if (!window.confirm('Restaurer cet événement avec ses inscriptions ?')) return;
    try {
      await eventsApi.restore(id);
      setEventStatus('ACTIVE');
      navigate(`/events/${id}`);
    } catch (err) {
      setErrorMsg(err.message || "Impossible de restaurer l'événement.");
    }
  };

  if (loading) return <p className="state-message">Chargement…</p>;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/admin/events" className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          ← Retour aux événements
        </Link>
        <h1>{isEditing ? "Modifier l'événement" : 'Créer un événement'}</h1>
        {isEditing && eventStatus === 'CANCELLED' && (
          <p style={{ color: 'var(--color-danger)' }}>Événement actuellement annulé — les inscrits sont conservés.</p>
        )}
      </div>

      <form className="event-card" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="titre">Titre</label>
          <input id="titre" name="titre" value={form.titre} onChange={handleChange} minLength={3} required />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input id="description" name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input id="date" name="date" type="date" value={form.date} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="lieu">Lieu</label>
          <input id="lieu" name="lieu" value={form.lieu} onChange={handleChange} minLength={2} required />
        </div>

        <div className="form-group">
          <label htmlFor="capaciteMax">Capacité maximale</label>
          <input id="capaciteMax" name="capaciteMax" type="number" min="1" max="10000" value={form.capaciteMax} onChange={handleChange} required />
        </div>

        {errorMsg && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{errorMsg}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Enregistrement…' : isEditing ? 'Enregistrer les modifications' : "Créer l'événement"}
          </button>
          {isEditing && eventStatus !== 'CANCELLED' && (
            <button type="button" className="btn btn-secondary" onClick={handleCancelEvent} style={{ color: 'var(--color-danger)' }}>
              Annuler l&apos;événement
            </button>
          )}
          {isEditing && eventStatus === 'CANCELLED' && (
            <button type="button" className="btn btn-primary" onClick={handleRestoreEvent}>
              Restaurer l&apos;événement
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
