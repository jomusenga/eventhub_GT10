import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getRole, setRole, ROLES } from '../utils/role';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRoleState] = useState(getRole());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const sync = () => setRoleState(getRole());
    window.addEventListener('eventhub-role-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('eventhub-role-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, role]);

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setRoleState(nextRole);
    setMenuOpen(false);
    navigate(nextRole === ROLES.ADMIN ? '/dashboard' : '/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-top">
        <Link to={role === ROLES.ADMIN ? '/dashboard' : '/'} className="navbar-brand">
          <div className="navbar-logo">EH</div>
          <div>
            <div className="navbar-brand-text">EventHub</div>
            <span className="navbar-brand-sub">
              {role === ROLES.ADMIN ? 'Espace administrateur' : 'Espace étudiant'}
            </span>
          </div>
        </Link>

        <button
          type="button"
          className={`navbar-toggle ${menuOpen ? 'open' : ''}`}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </div>

      <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {role === ROLES.ETUDIANT ? (
          <>
            <Link to="/" className={isActive('/') ? 'active' : ''}>Événements</Link>
            <Link to="/mes-inscriptions" className={isActive('/mes-inscriptions') ? 'active' : ''}>
              Mes inscriptions
            </Link>
          </>
        ) : (
          <>
            <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}>Tableau de bord</Link>
            <Link to="/admin/events" className={isActive('/admin/events') ? 'active' : ''}>Événements</Link>
            <Link to="/events/new" className={isActive('/events/new') ? 'active' : ''}>Nouvel événement</Link>
            <Link to="/participants" className={isActive('/participants') ? 'active' : ''}>Participants</Link>
          </>
        )}

        <div className="role-switch" role="group" aria-label="Choisir l'espace">
          <button
            type="button"
            className={`role-btn ${role === ROLES.ETUDIANT ? 'active' : ''}`}
            onClick={() => switchRole(ROLES.ETUDIANT)}
          >
            Étudiant
          </button>
          <button
            type="button"
            className={`role-btn ${role === ROLES.ADMIN ? 'active' : ''}`}
            onClick={() => switchRole(ROLES.ADMIN)}
          >
            Admin
          </button>
        </div>
      </div>
    </nav>
  );
}
