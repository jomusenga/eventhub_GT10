import React, { useState } from 'react';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';

export const EventsTab = ({ events, onOpenCreate, onOpenEdit, onDelete }) => {
  const [searchLocation, setSearchLocation] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const filteredEvents = events.filter((evt) => {
    const matchesLoc = evt.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
                       evt.title.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesDate = !filterDate || evt.date.startsWith(filterDate);
    return matchesLoc && matchesDate;
  });

  return (
    <div>
      <div className="header-section">
        <div className="header-text">
          <h2>Gestion des Événements</h2>
          <p>Créez, éditez et organisez les conférences, ateliers et séminaires du DIT.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenCreate}>
          <Plus className="icon-md" />
          Nouvel Événement
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search className="icon-md" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Rechercher par titre ou lieu (ex: Amphi A)..."
            style={{ paddingLeft: '46px', width: '100%' }}
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter className="icon-md" style={{ color: 'var(--text-muted)' }} />
          <input
            type="date"
            className="input-field"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button className="btn btn-secondary" onClick={() => setFilterDate('')}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <Calendar className="icon-xl" style={{ margin: '0 auto 1rem', color: 'var(--text-dim)' }} />
          <h3>Aucun événement trouvé</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Ajustez vos filtres ou créez votre premier événement académique dès maintenant.
          </p>
        </div>
      ) : (
        <div className="events-cards-grid">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="event-item-card">
              <div>
                <h3 className="event-card-title">{evt.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '1rem' }}>
                  {evt.description || 'Aucune description disponible.'}
                </p>

                <div className="event-meta-list">
                  <div className="event-meta-item">
                    <Calendar className="icon-md" style={{ color: 'var(--primary)' }} />
                    <span>{new Date(evt.date).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</span>
                  </div>
                  <div className="event-meta-item">
                    <MapPin className="icon-md" style={{ color: 'var(--warning)' }} />
                    <span>{evt.location}</span>
                  </div>
                  <div className="event-meta-item">
                    <Users className="icon-md" style={{ color: 'var(--success)' }} />
                    <span>Capacité max : <strong>{evt.max_capacity} places</strong></span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button className="btn btn-secondary" onClick={() => onOpenEdit(evt)} title="Modifier">
                  <Edit2 className="icon-md" />
                  Éditer
                </button>
                <button className="btn btn-danger" onClick={() => onDelete(evt.id)} title="Supprimer">
                  <Trash2 className="icon-md" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
