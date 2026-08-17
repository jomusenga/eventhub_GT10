const ROLE_KEY = 'eventhub_role';

export const ROLES = {
  ETUDIANT: 'etudiant',
  ADMIN: 'admin'
};

export function getRole() {
  return localStorage.getItem(ROLE_KEY) || ROLES.ETUDIANT;
}

export function setRole(role) {
  localStorage.setItem(ROLE_KEY, role);
  window.dispatchEvent(new Event('eventhub-role-change'));
}

export function isAdmin() {
  return getRole() === ROLES.ADMIN;
}

export function isEtudiant() {
  return getRole() === ROLES.ETUDIANT;
}
