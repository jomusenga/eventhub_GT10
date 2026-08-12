import React, { useState } from 'react';
import { Ticket, Plus, Calendar, User, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export const RegistrationsTab = ({ events, participants, onOpenRegister, onDeleteRegistration }) => {
  const [selectedEventId, setSelectedEventId] = useState('');

  const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId));

  return (
    <div>
      <div className="header-section">
        <div className="header-text">
          <h2>Gestion des Inscriptions</h2>
          <p>Inscrivez les participants aux événements avec vérification automatique de la capacité max.</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenRegister}>
          <Plus className="icon-md" />
          Nouvelle Inscription
        </button>
      </div>

      {/* Select Event Filter */}
      <div className="card-panel">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label style={{ fontSize: '1.15rem' }}>Sélectionner un événement pour afficher ses inscrits :</label>
          <select
            className="input-field"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            style={{ fontSize: '1.15rem', padding: '14px 18px' }}
          >
            <option value="">-- Choisir un événement --</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} (Capacité max : {evt.max_capacity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content depending on selection */}
      {selectedEvent ? (
        <div className="card-panel">
          <div className="panel-header">
            <div>
              <h3>{selectedEvent.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                📍 {selectedEvent.location} | 📅 {new Date(selectedEvent.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-etudiant" style={{ fontSize: '1.05rem', padding: '8px 16px' }}>
                Capacité Max : {selectedEvent.max_capacity} places
              </span>
            </div>
          </div>

          <div style={{ padding: '2rem', textAlign: 'center', background: '#1a2336', borderRadius: '12px' }}>
            <CheckCircle className="icon-xl" style={{ color: 'var(--success)', margin: '0 auto 10px' }} />
            <h4>Service d'inscription actif</h4>
            <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
              Utilisez le bouton "Nouvelle Inscription" ci-dessus pour ajouter un participant à cet événement.
            </p>
          </div>
        </div>
      ) : (
        <div className="card-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <Ticket className="icon-xl" style={{ margin: '0 auto 1rem', color: 'var(--text-dim)' }} />
          <h3>Sélectionnez un événement pour gérer ses inscriptions</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            Choisissez un événement dans la liste déroulante ci-dessus ou lancez une nouvelle inscription.
          </p>
        </div>
      )}
    </div>
  );
};
