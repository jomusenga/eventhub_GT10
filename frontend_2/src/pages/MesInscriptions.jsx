import { useState, useEffect } from 'react';
import { registrationsApi, eventsApi } from '../services/api';

// Simplification pour le projet : sans système de connexion, on retrouve
// le participant via l'id stocké au moment de son inscription (voir Registration.jsx).
export default function MesInscriptions() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const participantId = localStorage.getItem('eventhub_participant_id');

  useEffect(() => {
    if (!participantId) {
      setLoading(false);
      return;
    }

    registrationsApi.getByParticipant(participantId)
      .then(async (regs) => {
        // On récupère le titre de chaque événement pour un affichage lisible
        const withEventDetails = await Promise.all(
          regs.map(async (reg) => {
            try {
              const event = await eventsApi.getById(reg.eventId);
              return { ...reg, event };
            } catch {
              return { ...reg, event: null };
            }
          })
        );
        setRegistrations(withEventDetails);
      })
      .catch(() => setError('Impossible de récupérer tes inscriptions pour le moment.'))
      .finally(() => setLoading(false));
  }, [participantId]);

  const handleCancel = async (registrationId) => {
    if (!window.confirm('Annuler cette inscription ?')) return;
    setCancellingId(registrationId);
    try {
      await registrationsApi.cancel(registrationId);
      setRegistrations((prev) => prev.filter((r) => r.id !== registrationId));
    } catch (err) {
      setError(err.message || "Impossible d'annuler cette inscription.");
    } finally {
      setCancellingId(null);
    }
  };

  if (!participantId) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Mes inscriptions</h1>
        </div>
        <p className="state-message">
          Tu n'as pas encore d'inscription enregistrée sur cet appareil. Inscris-toi à un événement pour la voir apparaître ici.
        </p>
      </div>
    );
  }

  if (loading) return <p className="state-message">Chargement…</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Mes inscriptions</h1>
      </div>

      {error && <p className="state-message" style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {registrations.length === 0 ? (
        <p className="state-message">Aucune inscription active.</p>
      ) : (
        registrations.map((reg) => (
          <div key={reg.id} className="event-card">
            <h3>{reg.event ? reg.event.titre : `Événement #${reg.eventId}`}</h3>
            {reg.event && (
              <div className="event-meta">
                <span>📅 {reg.event.date}</span>
                <span>📍 {reg.event.lieu}</span>
              </div>
            )}
            <button
              className="btn btn-secondary"
              style={{ marginTop: '1rem', color: 'var(--color-danger)' }}
              onClick={() => handleCancel(reg.id)}
              disabled={cancellingId === reg.id}
            >
              {cancellingId === reg.id ? 'Annulation…' : "Annuler l'inscription"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
