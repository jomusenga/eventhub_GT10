const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
// Autorise +, espaces, tirets ; exige au moins 8 chiffres (ex: +221 77 123 45 67)
const PHONE_REGEX = /^\+?[\d\s.-]{8,20}$/;

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone, { required = false } = {}) {
  const value = (phone ?? '').toString().trim();
  if (!value) return !required;
  if (!PHONE_REGEX.test(value)) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15;
}

export function validateParticipantFields({ nom, name, email, telephone, phone }) {
  const errors = [];
  const fullName = (nom ?? name ?? '').toString().trim();
  const mail = (email ?? '').toString().trim();
  const tel = (telephone ?? phone ?? '').toString().trim();

  if (fullName.length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères.');
  }
  if (!isValidEmail(mail)) {
    errors.push('Adresse email invalide.');
  }
  if (tel && !isValidPhone(tel)) {
    errors.push('Numéro de téléphone invalide (ex: +221771234567 ou 77 123 45 67).');
  }

  return errors;
}

export function validateEventFields({ titre, title, description, date, lieu, location, capaciteMax, max_capacity }) {
  const errors = [];
  const eventTitle = (titre ?? title ?? '').toString().trim();
  const eventLocation = (lieu ?? location ?? '').toString().trim();
  const eventDate = (date ?? '').toString().trim();
  const capacity = Number(capaciteMax ?? max_capacity);
  const desc = (description ?? '').toString().trim();

  if (eventTitle.length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères.');
  }
  if (desc && desc.length < 5) {
    errors.push('La description doit contenir au moins 5 caractères si elle est renseignée.');
  }
  if (!eventDate || Number.isNaN(Date.parse(eventDate))) {
    errors.push('La date de l\'événement est invalide.');
  }
  if (eventLocation.length < 2) {
    errors.push('Le lieu doit contenir au moins 2 caractères.');
  }
  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.push('La capacité maximale doit être un entier supérieur ou égal à 1.');
  }
  if (capacity > 10000) {
    errors.push('La capacité maximale ne peut pas dépasser 10000.');
  }

  return errors;
}
