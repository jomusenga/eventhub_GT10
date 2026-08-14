// ---------------------------------------------------------------------------
// Centralise tous les appels HTTP vers les 3 microservices.
// Change juste les URLs ci-dessous quand Lory/Houleymatou te donneront
// les vraies adresses (ports Docker, etc.)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Centralise tous les appels HTTP vers les 3 microservices.
// Version avec mapping aller + retour (compatible backend EventHub)
// ---------------------------------------------------------------------------

const EVENTS_API_URL = import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3001';
const PARTICIPANTS_API_URL = import.meta.env.VITE_PARTICIPANTS_API_URL || 'http://localhost:3002';
const REGISTRATIONS_API_URL = import.meta.env.VITE_REGISTRATIONS_API_URL || 'http://localhost:3003';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`Erreur ${res.status} : ${message}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------------------------------------------------------------------------
// Helpers de mapping
// ---------------------------------------------------------------------------

/** Backend → Frontend (événement) */
function mapEventFromBackend(event) {
  if (!event) return event;
  return {
    ...event,
    titre: event.title ?? event.titre,
    lieu: event.location ?? event.lieu,
    capaciteMax: event.max_capacity ?? event.capaciteMax,
    // on garde aussi les noms backend au cas où
    title: event.title,
    location: event.location,
    max_capacity: event.max_capacity
  };
}

/** Backend → Frontend (participant) */
function mapParticipantFromBackend(participant) {
  if (!participant) return participant;
  return {
    ...participant,
    nom: participant.name ?? participant.nom,
    telephone: participant.phone ?? participant.telephone,
    name: participant.name,
    phone: participant.phone
  };
}

/** Backend → Frontend (inscription) */
function mapRegistrationFromBackend(reg) {
  if (!reg) return reg;
  return {
    ...reg,
    eventId: reg.event_id ?? reg.eventId,
    participantId: reg.participant_id ?? reg.participantId,
    event_id: reg.event_id,
    participant_id: reg.participant_id
  };
}

/** Normalise une réponse qui peut être un objet { data: ... } ou un tableau */
function normalizeList(response, mapper) {
  if (!response) return [];
  const list = Array.isArray(response) ? response : (response.data || response);
  return Array.isArray(list) ? list.map(mapper) : [];
}

function normalizeOne(response, mapper) {
  if (!response) return null;
  const item = response.data ?? response;
  return mapper(item);
}

// --- events-service ---------------------------------------------------
export const eventsApi = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.location || filters.lieu) {
      params.append('location', filters.location || filters.lieu);
    }
    const query = params.toString();
    const res = await request(`${EVENTS_API_URL}/api/events${query ? `?${query}` : ''}`);
    return normalizeList(res, mapEventFromBackend);
  },

  getById: async (id) => {
    const res = await request(`${EVENTS_API_URL}/api/events/${id}`);
    return normalizeOne(res, mapEventFromBackend);
  },

  create: async (data) => {
    const payload = {
      title: data.title || data.titre,
      description: data.description,
      date: data.date,
      location: data.location || data.lieu,
      max_capacity: data.max_capacity ?? data.capaciteMax
    };
    const res = await request(`${EVENTS_API_URL}/api/events`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return normalizeOne(res, mapEventFromBackend);
  },

  update: async (id, data) => {
    const payload = {
      title: data.title || data.titre,
      description: data.description,
      date: data.date,
      location: data.location || data.lieu,
      max_capacity: data.max_capacity ?? data.capaciteMax
    };
    const res = await request(`${EVENTS_API_URL}/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return normalizeOne(res, mapEventFromBackend);
  },

  remove: (id) =>
    request(`${EVENTS_API_URL}/api/events/${id}`, { method: 'DELETE' }),

  checkAvailability: async (id) => {
    const res = await request(`${EVENTS_API_URL}/api/events/${id}/availability`);
    // L’endpoint backend renvoie maxCapacity, on uniformise
    const data = res?.data ?? res;
    return {
      ...data,
      maxCapacity: data.maxCapacity ?? data.max_capacity,
      eventId: data.eventId ?? data.id
    };
  }
};

// --- participants-service ----------------------------------------------
export const participantsApi = {
  getAll: async (search = '') => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await request(`${PARTICIPANTS_API_URL}/api/participants${query}`);
    return normalizeList(res, mapParticipantFromBackend);
  },

  getById: async (id) => {
    const res = await request(`${PARTICIPANTS_API_URL}/api/participants/${id}`);
    return normalizeOne(res, mapParticipantFromBackend);
  },

  search: (query) => participantsApi.getAll(query),

  create: async (data) => {
    const payload = {
      name: data.name || data.nom,
      email: data.email,
      phone: data.phone || data.telephone,
      type: data.type
    };
    const res = await request(`${PARTICIPANTS_API_URL}/api/participants`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return normalizeOne(res, mapParticipantFromBackend);
  },

  update: async (id, data) => {
    const payload = {
      name: data.name || data.nom,
      email: data.email,
      phone: data.phone || data.telephone,
      type: data.type
    };
    const res = await request(`${PARTICIPANTS_API_URL}/api/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return normalizeOne(res, mapParticipantFromBackend);
  },

  remove: (id) =>
    request(`${PARTICIPANTS_API_URL}/api/participants/${id}`, {
      method: 'DELETE'
    })
};

// --- registrations-service ----------------------------------------------
export const registrationsApi = {
  register: async (eventId, participantId) => {
    const res = await request(`${REGISTRATIONS_API_URL}/api/registrations`, {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        participant_id: participantId
      })
    });
    return normalizeOne(res, mapRegistrationFromBackend);
  },

  cancel: (registrationId) =>
    request(`${REGISTRATIONS_API_URL}/api/registrations/${registrationId}`, {
      method: 'DELETE'
    }),

  getByEvent: async (eventId) => {
    const res = await request(
      `${REGISTRATIONS_API_URL}/api/registrations/event/${eventId}`
    );
    return normalizeList(res, mapRegistrationFromBackend);
  },

  getByParticipant: async (participantId) => {
    const res = await request(
      `${REGISTRATIONS_API_URL}/api/registrations/participant/${participantId}`
    );
    return normalizeList(res, mapRegistrationFromBackend);
  },

  getStats: () =>
    request(`${REGISTRATIONS_API_URL}/api/registrations/stats`),

  getCountByEvent: async (eventId) => {
    const res = await request(
      `${REGISTRATIONS_API_URL}/api/registrations/event/${eventId}/count`
    );
    // Normalise le format de réponse
    return {
      count: res?.count ?? res?.data?.count ?? 0,
      eventId: res?.eventId ?? eventId
    };
  }
};