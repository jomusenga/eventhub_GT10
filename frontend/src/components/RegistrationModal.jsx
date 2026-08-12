import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export const RegistrationModal = ({ isOpen, onClose, onSubmit, events, participants }) => {
  const [eventId, setEventId] = useState('');
  const [participantId, setParticipantId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventId || !participantId) return;
    onSubmit({ event_id: parseInt(eventId, 10), participant_id: parseInt(participantId, 10) });
  };

  const selectedEvent = events.find((e) => String(e.id) === String(eventId));

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Inscrire un Participant</h3>
          <button className="close-btn" onClick={onClose}>
            <X className="icon-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Choisir un Événement *</label>
            <select
              className="input-field"
              required
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
            >
              <option value="">-- Sélectionner l'événement --</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.location} - Max: {evt.max_capacity})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Choisir le Participant *</label>
            <select
              className="input-field"
              required
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
            >
              <option value="">-- Sélectionner le participant --</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email} - {p.type})
                </option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <div style={{ background: '#1a2336', padding: '14px', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.98rem', border: '1px solid var(--border-color)' }}>
              <p>📍 <strong>Lieu:</strong> {selectedEvent.location}</p>
              <p>👥 <strong>Capacité Max:</strong> {selectedEvent.max_capacity} places</p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <Check className="icon-md" />
              Valider l'Inscription
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
