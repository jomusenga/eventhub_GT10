import React from 'react';
import { Calendar, Users, Ticket, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export const DashboardTab = ({ events, participants, stats, onNavigate }) => {
  const totalEvents = events.length;
  const totalParticipants = participants.length;
  const totalRegistrations = stats?.totalRegistrations || 0;
  
  // Calculate average fill rate
  const totalCapacity = events.reduce((acc, curr) => acc + (curr.max_capacity || 0), 0);
  const fillRate = totalCapacity > 0 ? Math.min(100, Math.round((totalRegistrations / totalCapacity) * 100)) : 0;

  return (
    <div>
      <div className="header-section">
        <div className="header-text">
          <h2>Tableau de Bord & Vue d'Ensemble</h2>
          <p>Supervision en temps réel des événements, inscrits et capacités globales du DIT.</p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Calendar className="icon-xl" />
          </div>
          <div className="stat-info">
            <h3>{totalEvents}</h3>
            <p>Événements Programmés</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Users className="icon-xl" />
          </div>
          <div className="stat-info">
            <h3>{totalParticipants}</h3>
            <p>Participants Enregistrés</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Ticket className="icon-xl" />
          </div>
          <div className="stat-info">
            <h3>{totalRegistrations}</h3>
            <p>Inscriptions Confirmées</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <TrendingUp className="icon-xl" />
          </div>
          <div className="stat-info">
            <h3>{fillRate}%</h3>
            <p>Taux de Remplissage Global</p>
          </div>
        </div>
      </div>

      {/* Panels Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
        {/* Événements Récents */}
        <div className="card-panel">
          <div className="panel-header">
            <h3>Événements à Venir</h3>
            <button className="btn btn-secondary" onClick={() => onNavigate('events')}>
              Voir Tous
            </button>
          </div>
          {events.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <AlertCircle className="icon-lg" style={{ marginBottom: '8px' }} />
              <p>Aucun événement créé pour le moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {events.slice(0, 4).map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    background: '#1a2336',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.15rem' }}>{evt.title}</h4>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                      📍 {evt.location} | 📅 {new Date(evt.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className="badge badge-etudiant" style={{ fontSize: '1rem', padding: '6px 12px' }}>
                    Capacité: {evt.max_capacity}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Répartition des Participants */}
        <div className="card-panel">
          <div className="panel-header">
            <h3>Participants par Catégorie</h3>
            <button className="btn btn-secondary" onClick={() => onNavigate('participants')}>
              Gérer
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['étudiant', 'professeur', 'externe'].map((cat) => {
              const count = participants.filter((p) => p.type === cat).length;
              const pct = totalParticipants > 0 ? Math.round((count / totalParticipants) * 100) : 0;
              return (
                <div key={cat} style={{ background: '#1a2336', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '1.05rem', fontWeight: 600 }}>
                    <span style={{ textTransform: 'capitalize' }}>{cat}s</span>
                    <span>{count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill progress-green"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
