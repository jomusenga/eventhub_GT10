import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { participantsApi } from '../services/api';

const EMPTY_PARTICIPANT = { nom: '', email: '', telephone: '', type: 'etudiant' };

export default function ParticipantForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_PARTICIPANT);
  const [loading, setLoading] = useState(isEditing);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    participantsApi.getById(id)
      .then(setForm)
      .catch(() => setErrorMsg('Impossible de charger ce participant.'))
      .finally(() => setLoading(false));
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      if (isEditing) {
        await participantsApi.update(id, form);
      } else {
        await participantsApi.create(form);
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
        <h1>{isEditing ? 'Modifier le participant' : 'Nouveau participant'}</h1>
      </div>

      <form className="event-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nom">Nom complet</label>
          <input id="nom" name="nom" value={form.nom} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="telephone">Téléphone</label>
          <input id="telephone" name="telephone" value={form.telephone} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="type">Type de participant</label>
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            <option value="etudiant">Étudiant</option>
            <option value="professeur">Professeur</option>
            <option value="externe">Externe</option>
          </select>
        </div>

        {errorMsg && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{errorMsg}</p>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Enregistrement…' : isEditing ? 'Enregistrer' : 'Créer le participant'}
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
