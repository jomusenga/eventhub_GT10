const VALID_TYPES = ['étudiant', 'etudiant', 'professeur', 'externe'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const PHONE_REGEX = /^\+?[\d\s.-]{8,20}$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}

function isValidPhone(phone) {
  if (phone === undefined || phone === null || String(phone).trim() === '') return true;
  const value = String(phone).trim();
  if (!PHONE_REGEX.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

function normalizeType(type) {
  const value = String(type || '').trim().toLowerCase();
  if (value === 'etudiant' || value === 'étudiant') return 'étudiant';
  if (value === 'professeur') return 'professeur';
  if (value === 'externe') return 'externe';
  return value;
}

function validateParticipantPayload({ name, email, phone, type }, { partial = false } = {}) {
  const errors = [];

  if (!partial || name !== undefined) {
    if (!name || String(name).trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }
  }

  if (!partial || email !== undefined) {
    if (!email || !isValidEmail(email)) {
      errors.push('Adresse email invalide');
    }
  }

  if (phone !== undefined && phone !== null && String(phone).trim() !== '' && !isValidPhone(phone)) {
    errors.push('Numéro de téléphone invalide (ex: +221771234567)');
  }

  if (!partial || type !== undefined) {
    const normalized = normalizeType(type);
    if (!type || !['étudiant', 'professeur', 'externe'].includes(normalized)) {
      errors.push('Le type doit être l\'un des suivants: étudiant, professeur, externe');
    }
  }

  return errors;
}

export { VALID_TYPES, validateParticipantPayload, isValidEmail, isValidPhone, normalizeType };
