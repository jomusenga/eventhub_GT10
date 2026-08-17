function validateEventPayload({ title, description, date, location, max_capacity }) {
  const errors = [];
  const eventTitle = (title ?? '').toString().trim();
  const eventLocation = (location ?? '').toString().trim();
  const eventDate = (date ?? '').toString().trim();
  const capacity = Number(max_capacity);
  const desc = description === undefined || description === null ? '' : String(description).trim();

  if (eventTitle.length < 3) {
    errors.push('Le titre doit contenir au moins 3 caractères');
  }
  if (desc && desc.length < 5) {
    errors.push('La description doit contenir au moins 5 caractères si elle est renseignée');
  }
  if (!eventDate || Number.isNaN(Date.parse(eventDate))) {
    errors.push('La date de l\'événement est invalide');
  }
  if (eventLocation.length < 2) {
    errors.push('Le lieu doit contenir au moins 2 caractères');
  }
  if (!Number.isInteger(capacity) || capacity < 1) {
    errors.push('max_capacity doit être un entier strictement positif');
  }
  if (capacity > 10000) {
    errors.push('max_capacity ne peut pas dépasser 10000');
  }

  return errors;
}

export { validateEventPayload };
