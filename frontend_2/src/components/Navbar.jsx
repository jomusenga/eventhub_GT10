import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">EH</div>
        <div>
          <div className="navbar-brand-text">EventHub</div>
          <span className="navbar-brand-sub">Dakar Institute of Technology</span>
        </div>
      </Link>
      <div className="navbar-links">
        <Link to="/">Événements</Link>
        <Link to="/dashboard">Tableau de bord</Link>
        <Link to="/events/new">Nouvel événement</Link>
        <Link to="/participants">Participants</Link>
      </div>
    </nav>
  );
}
