import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { eventsApi } from '../services/api';

const EMPTY_EVENT = { titre: '', description: '', date: '', lieu: '', capaciteMax: 50 };

export default function EventForm() {
  const { id } = useParams(); // absent = création, présent = modification
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_EVENT);
  const [loading, setLoading] = useState(isEditing);
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    eventsApi.getById(id)
      .then((data) => setForm(data))
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

    try {
      if (isEditing) {
        await eventsApi.update(id, form);
      } else {
        await eventsApi.create(form);
      }
      navigate('/');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || "Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer définitivement cet événement ?')) return;
    try {
      await eventsApi.remove(id);
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message || 'Impossible de supprimer cet événement.');
    }
  };

  if (loading) return <p className="state-message">Chargement…</p>;

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          ← Retour aux événements
        </Link>
        <h1>{isEditing ? "Modifier l'événement" : 'Créer un événement'}</h1>
      </div>

      <form className="event-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="titre">Titre</label>
          <input id="titre" name="titre" value={form.titre} onChange={handleChange} required />
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
          <input id="lieu" name="lieu" value={form.lieu} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="capaciteMax">Capacité maximale</label>
          <input id="capaciteMax" name="capaciteMax" type="number" min="1" value={form.capaciteMax} onChange={handleChange} required />
        </div>

        {errorMsg && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{errorMsg}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <button className="btn btn-primary" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Enregistrement…' : isEditing ? 'Enregistrer les modifications' : "Créer l'événement"}
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
