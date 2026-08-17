import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getRole, ROLES } from '../utils/role';

export default function AdminOnly({ children }) {
  const [role, setRoleState] = useState(getRole());

  useEffect(() => {
    const sync = () => setRoleState(getRole());
    window.addEventListener('eventhub-role-change', sync);
    return () => window.removeEventListener('eventhub-role-change', sync);
  }, []);

  if (role !== ROLES.ADMIN) {
    return <Navigate to="/" replace />;
  }

  return children;
}
