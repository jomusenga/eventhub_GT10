import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export const ParticipantModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'étudiant'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        type: initialData.type || 'étudiant'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'étudiant'
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
          <h3>{initialData ? 'Modifier le Participant' : 'Nouveau Participant'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X className="icon-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nom & Prénom *</label>
            <input
              type="text"
              className="input-field"
              placeholder="ex: Houleymatou Diallo"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Adresse Email *</label>
            <input
              type="email"
              className="input-field"
              placeholder="ex: houleymatou.diallo@dit.sn"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              type="tel"
              className="input-field"
              placeholder="ex: +221 77 000 00 00"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Catégorie / Type *</label>
            <select
              className="input-field"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="étudiant">Étudiant</option>
              <option value="professeur">Professeur</option>
              <option value="externe">Externe</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              <Save className="icon-md" />
              {initialData ? 'Mettre à jour' : 'Créer Participant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
