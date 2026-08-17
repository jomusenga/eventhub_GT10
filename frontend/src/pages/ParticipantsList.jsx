import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participantsApi, eventsApi, registrationsApi } from '../services/api';

const MOCK_PARTICIPANTS = [
  { id: 1, nom: 'Awa Ndiaye', email: 'awa.ndiaye@dit.sn', telephone: '77 000 00 00', type: 'etudiant', evenements: ['Conférence IA'] },
  { id: 2, nom: 'Cheikh Fall', email: 'cheikh.fall@dit.sn', telephone: '77 111 11 11', type: 'professeur', evenements: ['Atelier Docker'] },
  { id: 3, nom: 'Fatou Sarr', email: 'fatou.sarr@externe.com', telephone: '77 222 22 22', type: 'externe', evenements: [] }
];

export default function ParticipantsList() {
  const [participants, setParticipants] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const enrichWithEvents = async (list) => {
    const events = await eventsApi.getAll().catch(() => []);
    return Promise.all(
      list.map(async (p) => {
        try {
          const regs = await registrationsApi.getByParticipant(p.id);
          const evenements = regs.map((reg) => {
            const ev = events.find((item) => String(item.id) === String(reg.eventId));
            return ev?.titre || `Événement #${reg.eventId}`;
          });
          return { ...p, evenements };
        } catch {
          return { ...p, evenements: [] };
        }
      })
    );
  };

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await participantsApi.getAll();
      const withEvents = await enrichWithEvents(data);
      setParticipants(withEvents);
    } catch {
      setError('Impossible de contacter les microservices, affichage de données de démo.');
      setParticipants(MOCK_PARTICIPANTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return loadAll();
    setLoading(true);
    try {
      const results = await participantsApi.search(query);
      const withEvents = await enrichWithEvents(results);
      setParticipants(withEvents);
    } catch {
      setParticipants((prev) =>
        prev.filter((p) =>
          String(p.nom || '').toLowerCase().includes(query.toLowerCase()) ||
          String(p.email || '').toLowerCase().includes(query.toLowerCase())
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (participantId) => {
    if (!window.confirm('Supprimer ce participant ?')) return;
    try {
      await participantsApi.remove(participantId);
      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } catch (err) {
      setError(err.message || 'Impossible de supprimer ce participant.');
    }
  };

  const typeLabel = { etudiant: 'Étudiant', professeur: 'Professeur', externe: 'Externe' };

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Participants</h1>
          <p>
            Un participant est une personne inscrite à au moins un événement.
            Ici tu peux l’inscrire (création + événement), corriger son profil, ou le supprimer.
          </p>
        </div>
        <Link to="/participants/new" className="btn btn-primary">+ Inscrire un participant</Link>
      </div>

      <form onSubmit={handleSearch} className="filters-row">
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <input
            placeholder="Rechercher par nom ou email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit">Rechercher</button>
      </form>

      {error && <p className="state-message">{error}</p>}

      {loading ? (
        <p className="state-message">Chargement…</p>
      ) : participants.length === 0 ? (
        <p className="state-message">Aucun participant trouvé.</p>
      ) : (
        participants.map((p) => (
          <div key={p.id} className="event-card">
            <h3>{p.nom || p.name}</h3>
            <div className="event-meta">
              <span><i className="fa-solid fa-envelope meta-icon" aria-hidden="true"></i>{p.email}</span>
              {(p.telephone || p.phone) && (
                <span><i className="fa-solid fa-phone meta-icon" aria-hidden="true"></i>{p.telephone || p.phone}</span>
              )}
              <span className="badge">{typeLabel[p.type] || p.type}</span>
            </div>
            <div className="event-meta">
              <span><i className="fa-solid fa-calendar-check meta-icon" aria-hidden="true"></i>Événements :</span>
              {p.evenements?.length ? (
                p.evenements.map((label) => <span key={label} className="badge">{label}</span>)
              ) : (
                <span className="badge full">Non inscrit</span>
              )}
            </div>
            <div className="actions-row" style={{ marginTop: '1rem' }}>
              <Link to={`/participants/${p.id}/edit`} className="btn btn-secondary">Modifier</Link>
              <button className="btn btn-secondary" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(p.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
