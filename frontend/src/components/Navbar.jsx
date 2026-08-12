import React from 'react';
import { Calendar, Users, Ticket, LayoutDashboard, Sparkles } from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <header className="navbar">
      <div className="logo-brand">
        <div className="logo-icon-bg">
          <Sparkles className="icon-lg" />
        </div>
        <div>
          <h1 className="brand-title">EventHub</h1>
          <span className="brand-subtitle">Dakar Institute of Technology</span>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard className="icon-md" />
          Tableau de Bord
        </button>
        <button
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <Calendar className="icon-md" />
          Événements
        </button>
        <button
          className={`tab-btn ${activeTab === 'participants' ? 'active' : ''}`}
          onClick={() => setActiveTab('participants')}
        >
          <Users className="icon-md" />
          Participants
        </button>
        <button
          className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveTab('registrations')}
        >
          <Ticket className="icon-md" />
          Inscriptions
        </button>
      </nav>
    </header>
  );
};
