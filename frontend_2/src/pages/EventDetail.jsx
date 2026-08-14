import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsApi, registrationsApi } from '../services/api';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRegistration, setMyRegistration] = useState(null); // null = pas inscrit·e
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  const participantId = localStorage.getItem('eventhub_participant_id');

  useEffect(() => {
    eventsApi.getById(id)
      .then(setEvent)
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Vérifie si le participant courant (mémorisé lors d'une inscription précédente)
  // a déjà une inscription active sur CET événement.
  useEffect(() => {
    if (!participantId) return;
    registrationsApi.getByParticipant(participantId)
      .then((regs) => {
        const found = regs.find((r) => String(r.eventId) === String(id));
        setMyRegistration(found || null);
      })
      .catch(() => setMyRegistration(null));
  }, [id, participantId]);

  const handleCancel = async () => {
    if (!myRegistration) return;
    if (!window.confirm("Annuler ton inscription à cet événement ?")) return;
    setCancelling(true);
    setError(null);
    try {
      await registrationsApi.cancel(myRegistration.id);
      setMyRegistration(null);
      // Libère une place localement en attendant le prochain fetch
      setEvent((prev) => (prev ? { ...prev, inscrits: Math.max(0, (prev.inscrits || 0) - 1) } : prev));
    } catch (err) {
      setError(err.message || "Impossible d'annuler l'inscription.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <p className="state-message">Chargement…</p>;
  if (!event) return <p className="state-message">Événement introuvable.</p>;

  const placesRestantes = event.capaciteMax - (event.inscrits || 0);

  return (
    <div className="container">
      <div className="page-header">
        <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          ← Retour aux événements
        </Link>
        <h1>{event.titre}</h1>
      </div>

      <div className="event-card">
        <p>{event.description}</p>
        <div className="event-meta">
          <span>📅 {event.date}</span>
          <span>📍 {event.lieu}</span>
          <span>👥 {placesRestantes} places restantes sur {event.capaciteMax}</span>
          {myRegistration && <span className="badge">Tu es inscrit·e</span>}
        </div>

        {error && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          {myRegistration ? (
            <button
              className="btn btn-secondary"
              style={{ color: 'var(--color-danger)' }}
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Annulation…' : "Annuler mon inscription"}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              disabled={placesRestantes <= 0}
              onClick={() => navigate(`/events/${id}/inscription`)}
            >
              {placesRestantes <= 0 ? 'Complet' : "S'inscrire"}
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate(`/events/${id}/edit`)}>
            Modifier
          </button>
          <button className="btn btn-secondary" onClick={() => navigate(`/events/${id}/inscrits`)}>
            Voir les inscrits
          </button>
        </div>
      </div>
    </div>
  );
}
