import { useState, useEffect } from 'react';
import { eventsApi, participantsApi, registrationsApi } from '../services/api';

const MOCK_EVENTS = [
  { id: 1, titre: 'Conférence Intelligence Artificielle', date: '2026-08-20', lieu: 'Amphi A', capaciteMax: 100, inscrits: 62 },
  { id: 2, titre: 'Atelier Docker & CI/CD', date: '2026-08-22', lieu: 'Salle B', capaciteMax: 30, inscrits: 30 },
  { id: 3, titre: 'Séminaire Cybersécurité', date: '2026-08-25', lieu: 'Amphi C', capaciteMax: 80, inscrits: 15 }
];

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [participantsCount, setParticipantsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const [eventsData, participantsData] = await Promise.all([
          eventsApi.getAll(),
          participantsApi.getAll()
        ]);

        // Pour chaque événement, on récupère ses stats d'inscription
        const eventsWithStats = await Promise.all(
          eventsData.map(async (event) => {
            try {
              const stats = await registrationsApi.getStats(event.id);
              return { ...event, inscrits: stats.total ?? 0 };
            } catch {
              return { ...event, inscrits: event.inscrits ?? 0 };
            }
          })
        );

        setEvents(eventsWithStats);
        setParticipantsCount(participantsData.length);
      } catch {
        setError('Impossible de contacter les microservices, affichage de données de démo.');
        setEvents(MOCK_EVENTS);
        setParticipantsCount(48);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) return <p className="state-message">Chargement des statistiques…</p>;

  const totalEvents = events.length;
  const totalInscriptions = events.reduce((sum, e) => sum + (e.inscrits || 0), 0);
  const totalCapacite = events.reduce((sum, e) => sum + (e.capaciteMax || 0), 0);
  const tauxRemplissage = totalCapacite > 0 ? Math.round((totalInscriptions / totalCapacite) * 100) : 0;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble des événements, participants et inscriptions.</p>
      </div>

      {error && <p className="state-message">{error}</p>}

      {/* --- KPIs globaux --- */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">{totalEvents}</span>
          <span className="stat-label">Événements</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{participantsCount}</span>
          <span className="stat-label">Participants</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{totalInscriptions}</span>
          <span className="stat-label">Inscriptions totales</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{tauxRemplissage}%</span>
          <span className="stat-label">Taux de remplissage moyen</span>
        </div>
      </div>

      {/* --- Détail par événement --- */}
      <h2 style={{ marginTop: '2.5rem', marginBottom: '1rem' }}>Par événement</h2>

      {events.length === 0 ? (
        <p className="state-message">Aucun événement à afficher.</p>
      ) : (
        events.map((event) => {
          const taux = event.capaciteMax > 0 ? Math.min(100, Math.round((event.inscrits / event.capaciteMax) * 100)) : 0;
          return (
            <div key={event.id} className="event-card">
              <h3>{event.titre}</h3>
              <div className="event-meta">
                <span>📅 {event.date}</span>
                <span>📍 {event.lieu}</span>
              </div>
              <div className="progress-row">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${taux}%`, background: taux >= 100 ? 'var(--color-danger)' : 'var(--color-accent)' }}
                  />
                </div>
                <span className="progress-label">{event.inscrits} / {event.capaciteMax} ({taux}%)</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
