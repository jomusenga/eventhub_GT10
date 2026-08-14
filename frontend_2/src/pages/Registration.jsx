import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { participantsApi, registrationsApi, eventsApi } from '../services/api';

export default function Registration() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nom: '', email: '', telephone: '', type: 'etudiant' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      // Validation forte : on revérifie la disponibilité juste avant d'inscrire,
      // pour éviter qu'une place prise entre-temps par quelqu'un d'autre
      // (ou un bouton resté actif dans un onglet ouvert) ne crée une sur-réservation.
      const currentEvent = await eventsApi.getById(eventId);
      const placesRestantes = currentEvent.capaciteMax - (currentEvent.inscrits || 0);
      if (placesRestantes <= 0) {
        setStatus('error');
        setErrorMsg("Il n'y a plus de place disponible pour cet événement.");
        return;
      }

      const participant = await participantsApi.create(form);
      await registrationsApi.register(eventId, participant.id);
      // Mémorise l'id du participant pour retrouver ses inscriptions plus tard
      // (le projet n'a pas de système de connexion).
      localStorage.setItem('eventhub_participant_id', participant.id);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || "Une erreur est survenue pendant l'inscription.");
    }
  };

  if (status === 'success') {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Inscription confirmée 🎉</h1>
          <p>Tu recevras un email de confirmation prochainement.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/events/${eventId}`)}>
              Retour à l'événement
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Voir tous les événements
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Inscription à l'événement</h1>
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

        {status === 'error' && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{errorMsg}</p>}

        <button className="btn btn-primary" type="submit" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Envoi…' : "Confirmer l'inscription"}
        </button>
      </form>
    </div>
  );
}
