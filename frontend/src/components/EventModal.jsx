import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export const EventModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    max_capacity: 50
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        date: initialData.date ? new Date(initialData.date).toISOString().slice(0, 16) : '',
        location: initialData.location || '',
        max_capacity: initialData.max_capacity || 50
      });
    } else {
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        max_capacity: 50
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{initialData ? 'Modifier l\'Événement' : 'Créer un Événement'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X className="icon-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Titre de l'Événement *</label>
            <input
              type="text"
              className="input-field"
              placeholder="ex: Conférence IA & DevOps"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Description détaillée de l'événement..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Date & Heure *</label>
              <input
                type="datetime-local"
                className="input-field"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Lieu *</label>
              <input
                type="text"
                className="input-field"
                placeholder="ex: Amphi A DIT"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Capacité Maximale (Nombre de places) *</label>
            <input
              type="number"
              min="1"
              className="input-field"
              required
              value={formData.max_capacity}
              onChange={(e) => setFormData({ ...formData, max_capacity: e.target.value })}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <Save className="icon-md" />
              {initialData ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
