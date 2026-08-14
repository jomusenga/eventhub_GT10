import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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
        <Route path="/" element={<EventsList />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events/new" element={<EventForm />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/events/:id/edit" element={<EventForm />} />
        <Route path="/events/:id/inscrits" element={<EventRegistrations />} />
        <Route path="/events/:id/inscription" element={<Registration />} />
        <Route path="/mes-inscriptions" element={<MesInscriptions />} />
        <Route path="/participants" element={<ParticipantsList />} />
        <Route path="/participants/new" element={<ParticipantForm />} />
        <Route path="/participants/:id/edit" element={<ParticipantForm />} />
      </Routes>
    </>
  );
}
