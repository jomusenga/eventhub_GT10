import React, { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Mail, Phone, UserCheck } from 'lucide-react';

export const ParticipantsTab = ({ participants, onOpenCreate, onOpenEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getBadgeClass = (type) => {
    switch (type) {
      case 'étudiant': return 'badge-etudiant';
      case 'professeur': return 'badge-professeur';
      case 'externe': return 'badge-externe';
      default: return 'badge-etudiant';
    }
  };

  return (
    <div>
      <div className="header-section">
        <div className="header-text">
          <h2>Gestion des Participants</h2>
          <p>Inscrivez et gérez la communauté DIT (Étudiants, Professeurs, Externes).</p>
        </div>
        <button className="btn btn-primary" onClick={onOpenCreate}>
          <Plus className="icon-md" />
          Nouveau Participant
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search className="icon-md" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Rechercher par nom ou email..."
            style={{ paddingLeft: '46px', width: '100%' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ minWidth: '180px' }}
        >
          <option value="">Tous les types</option>
          <option value="étudiant">Étudiant</option>
          <option value="professeur">Professeur</option>
          <option value="externe">Externe</option>
        </select>
      </div>

      {/* Participants Table */}
      <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredParticipants.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users className="icon-xl" style={{ margin: '0 auto 1rem', color: 'var(--text-dim)' }} />
            <h3>Aucun participant trouvé</h3>
            <p style={{ marginTop: '8px' }}>Créez un nouveau profil participant pour démarrer.</p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Catégorie</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700'
                        }}
                      >
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: '600' }}>{p.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Mail className="icon-md" />
                      <span>{p.email}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                      <Phone className="icon-md" />
                      <span>{p.phone || 'Non renseigné'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(p.type)}`}>
                      <UserCheck className="icon-md" />
                      {p.type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button className="btn btn-secondary" onClick={() => onOpenEdit(p)} style={{ padding: '8px 14px' }}>
                        <Edit2 className="icon-md" />
                      </button>
                      <button className="btn btn-danger" onClick={() => onDelete(p.id)} style={{ padding: '8px 14px' }}>
                        <Trash2 className="icon-md" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
