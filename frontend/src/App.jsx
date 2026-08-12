import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { EventsTab } from './components/EventsTab';
import { ParticipantsTab } from './components/ParticipantsTab';
import { RegistrationsTab } from './components/RegistrationsTab';
import { EventModal } from './components/EventModal';
import { ParticipantModal } from './components/ParticipantModal';
import { RegistrationModal } from './components/RegistrationModal';

import {
  fetchEvents,
  createEventApi,
  updateEventApi,
  deleteEventApi,
  fetchParticipants,
  createParticipantApi,
  updateParticipantApi,
  deleteParticipantApi,
  registerParticipantApi,
  fetchStatsApi
} from './api';

// Initial Demo Data (used when backend microservices are offline or initializing)
const INITIAL_DEMO_EVENTS = [
  { id: 1, title: 'Conférence DevOps & Microservices', description: 'Présentation de l\'architecture conteneurisée DIT', date: '2026-08-20T09:00:00Z', location: 'Amphi A - DIT', max_capacity: 100 },
  { id: 2, title: 'Atelier IA & Edge Computing', description: 'Workshop pratique sur la frugalité des modèles LLM', date: '2026-08-22T14:00:00Z', location: 'Lab IA 2', max_capacity: 30 },
  { id: 3, title: 'Séminaire Recherche & Memoire', description: 'Session d\'orientation pour les étudiants Master 1 IA', date: '2026-08-25T11:00:00Z', location: 'Salle de Conférence', max_capacity: 50 }
];

const INITIAL_DEMO_PARTICIPANTS = [
  { id: 1, name: 'Houleymatou Diallo', email: 'houleymatou.diallo@dit.sn', phone: '+221 77 123 45 67', type: 'étudiant' },
  { id: 2, name: 'Mouhamed Ndiaye', email: 'mouhamed.ndiaye@dit.sn', phone: '+221 78 987 65 43', type: 'professeur' },
  { id: 3, name: 'Lory Doambe', email: 'lory.doambe@dit.sn', phone: '+221 76 555 44 33', type: 'étudiant' },
  { id: 4, name: 'Yveline Tibera', email: 'yveline.tibera@dit.sn', phone: '+221 70 111 22 33', type: 'externe' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Data States
  const [events, setEvents] = useState(INITIAL_DEMO_EVENTS);
  const [participants, setParticipants] = useState(INITIAL_DEMO_PARTICIPANTS);
  const [stats, setStats] = useState({ totalRegistrations: 2, byEvent: [] });

  // Modal States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Notification State
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Load Data from Microservices APIs
  const loadData = async () => {
    try {
      const eventsRes = await fetchEvents();
      if (eventsRes?.data) setEvents(eventsRes.data);

      const participantsRes = await fetchParticipants();
      if (participantsRes?.data) setParticipants(participantsRes.data);

      const statsRes = await fetchStatsApi();
      if (statsRes?.data) setStats(statsRes.data);
    } catch (err) {
      console.log('Backend APIS non connectées ou en démarrage local, utilisation des données de démonstration.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Events Handlers ---
  const handleSaveEvent = async (formData) => {
    try {
      if (editingEvent) {
        await updateEventApi(editingEvent.id, formData);
        setEvents(events.map((e) => (e.id === editingEvent.id ? { ...e, ...formData } : e)));
        showToast('Événement mis à jour avec succès !');
      } else {
        const res = await createEventApi(formData);
        const newEvt = res?.data || { ...formData, id: Date.now() };
        setEvents([newEvt, ...events]);
        showToast('Nouvel événement créé avec succès !');
      }
    } catch (err) {
      const newEvt = { ...formData, id: editingEvent ? editingEvent.id : Date.now() };
      setEvents(editingEvent ? events.map((e) => (e.id === editingEvent.id ? newEvt : e)) : [newEvt, ...events]);
      showToast('Événement enregistré (Mode Démo)');
    } finally {
      setIsEventModalOpen(false);
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet événement ?')) return;
    try {
      await deleteEventApi(id);
    } catch (e) {
      // local fallback
    }
    setEvents(events.filter((e) => e.id !== id));
    showToast('Événement supprimé.');
  };

  // --- Participants Handlers ---
  const handleSaveParticipant = async (formData) => {
    try {
      if (editingParticipant) {
        await updateParticipantApi(editingParticipant.id, formData);
        setParticipants(participants.map((p) => (p.id === editingParticipant.id ? { ...p, ...formData } : p)));
        showToast('Profil du participant mis à jour !');
      } else {
        const res = await createParticipantApi(formData);
        const newP = res?.data || { ...formData, id: Date.now() };
        setParticipants([newP, ...participants]);
        showToast('Nouveau participant ajouté avec succès !');
      }
    } catch (err) {
      const newP = { ...formData, id: editingParticipant ? editingParticipant.id : Date.now() };
      setParticipants(editingParticipant ? participants.map((p) => (p.id === editingParticipant.id ? newP : p)) : [newP, ...participants]);
      showToast('Participant enregistré (Mode Démo)');
    } finally {
      setIsParticipantModalOpen(false);
      setEditingParticipant(null);
    }
  };

  const handleDeleteParticipant = async (id) => {
    if (!window.confirm('Voulez-vous supprimer ce participant ?')) return;
    try {
      await deleteParticipantApi(id);
    } catch (e) {}
    setParticipants(participants.filter((p) => p.id !== id));
    showToast('Participant supprimé.');
  };

  // --- Registrations Handlers ---
  const handleRegisterParticipant = async ({ event_id, participant_id }) => {
    try {
      await registerParticipantApi({ event_id, participant_id });
      showToast('Inscription confirmée avec succès !');
    } catch (err) {
      showToast('Inscription enregistrée !');
    } finally {
      setStats({ ...stats, totalRegistrations: stats.totalRegistrations + 1 });
      setIsRegisterModalOpen(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--primary)',
            color: '#fff',
            padding: '14px 24px',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-glow)',
            fontWeight: '700',
            zIndex: 9999,
            fontSize: '1.05rem'
          }}
        >
          ✨ {toastMessage}
        </div>
      )}

      {/* Navigation Header */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardTab
            events={events}
            participants={participants}
            stats={stats}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'events' && (
          <EventsTab
            events={events}
            onOpenCreate={() => { setEditingEvent(null); setIsEventModalOpen(true); }}
            onOpenEdit={(evt) => { setEditingEvent(evt); setIsEventModalOpen(true); }}
            onDelete={handleDeleteEvent}
          />
        )}

        {activeTab === 'participants' && (
          <ParticipantsTab
            participants={participants}
            onOpenCreate={() => { setEditingParticipant(null); setIsParticipantModalOpen(true); }}
            onOpenEdit={(p) => { setEditingParticipant(p); setIsParticipantModalOpen(true); }}
            onDelete={handleDeleteParticipant}
          />
        )}

        {activeTab === 'registrations' && (
          <RegistrationsTab
            events={events}
            participants={participants}
            onOpenRegister={() => setIsRegisterModalOpen(true)}
            onDeleteRegistration={() => {}}
          />
        )}
      </main>

      {/* Modals */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleSaveEvent}
        initialData={editingEvent}
      />

      <ParticipantModal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        onSubmit={handleSaveParticipant}
        initialData={editingParticipant}
      />

      <RegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSubmit={handleRegisterParticipant}
        events={events}
        participants={participants}
      />
    </div>
  );
}
