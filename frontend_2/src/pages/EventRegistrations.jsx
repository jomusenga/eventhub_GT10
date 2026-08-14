import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsApi, registrationsApi, participantsApi } from '../services/api';

export default function EventRegistrations() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const eventData = await eventsApi.getById(id);
        setEvent(eventData);

        const regs = await registrationsApi.getByEvent(id);
        // On enrichit chaque inscription avec les infos du participant
        const withParticipant = await Promise.all(
          regs.map(async (reg) => {
            try {
              const participant = await participantsApi.getById(reg.participantId);
              return { ...reg, participant };
            } catch {
              return { ...reg, participant: null };
            }
          })
        );
        setRegistrations(withParticipant);
      } catch {
        setError("Impossible de récupérer les inscriptions de cet événement pour le moment.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p className="state-message">Chargement…</p>;

  return (
    <div className="container">
      <div className="page-header">
        <Link to={`/events/${id}`} className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
          ← Retour à l'événement
        </Link>
        <h1>Inscrits {event ? `— ${event.titre}` : ''}</h1>
        <p>{registrations.length} inscription{registrations.length > 1 ? 's' : ''} au total.</p>
      </div>

      {error && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {registrations.length === 0 ? (
        <p className="state-message">Aucune inscription pour cet événement pour le moment.</p>
      ) : (
        registrations.map((reg) => (
          <div key={reg.id} className="event-card">
            <h3>{reg.participant ? reg.participant.nom : `Participant #${reg.participantId}`}</h3>
            {reg.participant && (
              <div className="event-meta">
                <span>✉️ {reg.participant.email}</span>
                {reg.participant.telephone && <span>📞 {reg.participant.telephone}</span>}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
