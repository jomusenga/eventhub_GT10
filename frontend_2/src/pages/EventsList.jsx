import { useState, useEffect } from 'react';
import { eventsApi } from '../services/api';
import EventCard from '../components/EventCard';

const MOCK_EVENTS = [
  { id: 1, titre: 'Conférence Intelligence Artificielle', description: "Panorama des usages de l'IA en 2026.", date: '2026-08-20', lieu: 'Amphi A', capaciteMax: 100, inscrits: 62 },
  { id: 2, titre: 'Atelier Docker & CI/CD', description: 'Mise en pratique des pipelines DevOps.', date: '2026-08-22', lieu: 'Salle B', capaciteMax: 30, inscrits: 30 },
  { id: 3, titre: 'Séminaire Cybersécurité', description: 'Bonnes pratiques de sécurisation des APIs.', date: '2026-08-25', lieu: 'Amphi C', capaciteMax: 80, inscrits: 15 }
];

export default function EventsList() {
  const [allEvents, setAllEvents] = useState([]); // copie complète, pour le filtre local de secours
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterLieu, setFilterLieu] = useState('');

  const loadEvents = (filters = {}) => {
    setLoading(true);
    eventsApi.getAll(filters)
      .then((data) => {
        setEvents(data);
        if (!filters.date && !filters.lieu) setAllEvents(data);
      })
      .catch(() => {
        setError('Impossible de contacter events-service, affichage de données de démo.');
        setEvents(MOCK_EVENTS);
        setAllEvents(MOCK_EVENTS);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEvents(); }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    const filters = {};
    if (filterDate) filters.date = filterDate;
    if (filterLieu) filters.lieu = filterLieu;

    if (Object.keys(filters).length === 0) {
      setEvents(allEvents);
      return;
    }

    // Essaie d'abord le filtre côté serveur (events-service), sinon filtre localement
    eventsApi.getAll(filters)
      .then(setEvents)
      .catch(() => {
        setEvents(
          allEvents.filter((ev) => {
            const matchDate = filterDate ? ev.date === filterDate : true;
            const matchLieu = filterLieu ? ev.lieu.toLowerCase().includes(filterLieu.toLowerCase()) : true;
            return matchDate && matchLieu;
          })
        );
      });
  };

  const handleReset = () => {
    setFilterDate('');
    setFilterLieu('');
    setEvents(allEvents);
  };

  if (loading) return <p className="state-message">Chargement des événements…</p>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Événements à venir</h1>
        <p>Découvre et inscris-toi aux prochains événements du DIT.</p>
      </div>

      <form onSubmit={handleFilter} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="filterDate">Date</label>
          <input id="filterDate" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: '160px' }}>
          <label htmlFor="filterLieu">Lieu</label>
          <input id="filterLieu" placeholder="Ex : Amphi A" value={filterLieu} onChange={(e) => setFilterLieu(e.target.value)} />
        </div>
        <button className="btn btn-primary" type="submit">Filtrer</button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>Réinitialiser</button>
      </form>

      {error && <p className="state-message">{error}</p>}

      {events.length === 0 ? (
        <p className="state-message">Aucun événement ne correspond à ces critères.</p>
      ) : (
        events.map((event) => <EventCard key={event.id} event={event} />)
      )}
    </div>
  );
}
