import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participantsApi } from '../services/api';

const MOCK_PARTICIPANTS = [
  { id: 1, nom: 'Awa Ndiaye', email: 'awa.ndiaye@dit.sn', telephone: '77 000 00 00', type: 'etudiant' },
  { id: 2, nom: 'Cheikh Fall', email: 'cheikh.fall@dit.sn', telephone: '77 111 11 11', type: 'professeur' },
  { id: 3, nom: 'Fatou Sarr', email: 'fatou.sarr@externe.com', telephone: '77 222 22 22', type: 'externe' }
];

export default function ParticipantsList() {
  const [participants, setParticipants] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = () => {
    setLoading(true);
    participantsApi.getAll()
      .then(setParticipants)
      .catch(() => {
        setError('Impossible de contacter participants-service, affichage de données de démo.');
        setParticipants(MOCK_PARTICIPANTS);
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return loadAll();
    setLoading(true);
    try {
      const results = await participantsApi.search(query);
      setParticipants(results);
    } catch {
      setParticipants((prev) =>
        prev.filter((p) =>
          p.nom.toLowerCase().includes(query.toLowerCase()) ||
          p.email.toLowerCase().includes(query.toLowerCase())
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce participant ?')) return;
    try {
      await participantsApi.remove(id);
      setParticipants((prev) => prev.filter((p) => p.id !== id));
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
          <p>Recherche et gestion des participants inscrits.</p>
        </div>
        <Link to="/participants/new" className="btn btn-primary">+ Nouveau participant</Link>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
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
            <h3>{p.nom}</h3>
            <div className="event-meta">
              <span>✉️ {p.email}</span>
              {p.telephone && <span>📞 {p.telephone}</span>}
              <span className="badge">{typeLabel[p.type] || p.type}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
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
