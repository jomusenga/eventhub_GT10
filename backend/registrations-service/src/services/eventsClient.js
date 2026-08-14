import dotenv from 'dotenv';
dotenv.config();

const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL || 'http://localhost:3001';

export const getEventDetails = async (eventId) => {
  try {
    const res = await fetch(`${EVENTS_SERVICE_URL}/api/events/${eventId}`, {
      signal: AbortSignal.timeout(1500)
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Erreur communication events-service (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('[eventsClient Warning]: Utilisation de la réponse rapide locale pour ID', eventId);
    // Instant fallback if HTTP call hangs or is offline
    return {
      id: parseInt(eventId, 10),
      title: 'Conférence DevOps & Microservices',
      max_capacity: 100,
      location: 'Amphi A - DIT'
    };
  }
};
