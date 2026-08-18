import { useState, useEffect } from 'react';
import { eventsApi, enrichEventsWithInscrits } from '../services/api';
import EventCard from '../components/EventCard';

const MOCK_EVENTS = [
  { id: 1, titre: 'Conférence Intelligence Artificielle', description: "Panorama des usages de l'IA en 2026.", date: '2026-08-20', lieu: 'Amphi A', capaciteMax: 100, inscrits: 62 },
  { id: 2, titre: 'Atelier Docker & CI/CD', description: 'Mise en pratique des pipelines DevOps.', date: '2026-08-22', lieu: 'Salle B', capaciteMax: 30, inscrits: 30 },
  { id: 3, titre: 'Séminaire Cybersécurité', description: 'Bonnes pratiques de sécurisation des APIs.', date: '2026-08-25', lieu: 'Amphi C', capaciteMax: 80, inscrits: 15 }
];

export default function EventsList({ adminMode = false }) {
  const [allEvents, setAllEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterLieu, setFilterLieu] = useState('');

  const loadEvents = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const query = { ...filters };
      if (adminMode) query.status = 'ALL';
      const data = await eventsApi.getAll(query);
      const withCounts = await enrichEventsWithInscrits(data);
      setEvents(withCounts);
      if (!filters.date && !filters.lieu) setAllEvents(withCounts);
    } catch {
      setError('Impossible de contacter events-service, affichage de données de démo.');
      setEvents(MOCK_EVENTS);
      setAllEvents(MOCK_EVENTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, [adminMode]);

  const handleFilter = async (e) => {
    e.preventDefault();
    const filters = {};
    if (filterDate) filters.date = filterDate;
    if (filterLieu) filters.lieu = filterLieu;

    if (Object.keys(filters).length === 0) {
      setEvents(allEvents);
      return;
    }

    setLoading(true);
    try {
      const query = { ...filters };
      if (adminMode) query.status = 'ALL';
      const data = await eventsApi.getAll(query);
      const withCounts = await enrichEventsWithInscrits(data);
      setEvents(withCounts);
    } catch {
      const filtered = allEvents.filter((ev) => {
        const eventDate = String(ev.date || '').slice(0, 10);
        const matchDate = filterDate ? eventDate === filterDate : true;
        const matchLieu = filterLieu
          ? String(ev.lieu || '').toLowerCase().includes(filterLieu.toLowerCase())
          : true;
        return matchDate && matchLieu;
      });
      setEvents(filtered);
    } finally {
      setLoading(false);
    }
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
        <h1>{adminMode ? 'Gestion des événements' : 'Événements à venir'}</h1>
        <p>
          {adminMode
            ? 'Crée, modifie et suis les inscriptions des événements DIT.'
            : 'Consulte les événements et inscris-toi en tant que participant.'}
        </p>
      </div>

      <form onSubmit={handleFilter} className="filters-row">
        <div className="form-group" style={{ marginBottom: 0, flex: '1 1 140px' }}>
          <label htmlFor="filterDate">Date</label>
          <input id="filterDate" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
        </div>
        <div className="form-group" style={{ marginBottom: 0, flex: '2 1 160px' }}>
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
