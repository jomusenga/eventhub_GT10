import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminOnly from './components/AdminOnly';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import EventForm from './pages/EventForm';
import EventRegistrations from './pages/EventRegistrations';
import Registration from './pages/Registration';
import MesInscriptions from './pages/MesInscriptions';
import ParticipantsList from './pages/ParticipantsList';
import ParticipantForm from './pages/ParticipantForm';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Parcours étudiant */}
        <Route path="/" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:id/inscription" element={<Registration />} />
        <Route path="/mes-inscriptions" element={<MesInscriptions />} />

        {/* Parcours admin */}
        <Route path="/dashboard" element={<AdminOnly><Dashboard /></AdminOnly>} />
        <Route path="/admin/events" element={<AdminOnly><EventsList adminMode /></AdminOnly>} />
        <Route path="/events/new" element={<AdminOnly><EventForm /></AdminOnly>} />
        <Route path="/events/:id/edit" element={<AdminOnly><EventForm /></AdminOnly>} />
        <Route path="/events/:id/inscrits" element={<AdminOnly><EventRegistrations /></AdminOnly>} />
        <Route path="/participants" element={<AdminOnly><ParticipantsList /></AdminOnly>} />
        <Route path="/participants/new" element={<AdminOnly><ParticipantForm /></AdminOnly>} />
        <Route path="/participants/:id/edit" element={<AdminOnly><ParticipantForm /></AdminOnly>} />
      </Routes>
    </>
  );
}
