import dotenv from 'dotenv';
dotenv.config();

const EVENTS_SERVICE_URL = process.env.EVENTS_SERVICE_URL || 'http://localhost:3001';

export const getEventDetails = async (eventId) => {
  try {
    const res = await fetch(`${EVENTS_SERVICE_URL}/api/events/${eventId}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Erreur lors de la communication avec events-service (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('[eventsClient Error]:', error.message);
    throw error;
  }
};
