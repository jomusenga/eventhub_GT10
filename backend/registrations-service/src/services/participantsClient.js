import dotenv from 'dotenv';
dotenv.config();

const PARTICIPANTS_SERVICE_URL = process.env.PARTICIPANTS_SERVICE_URL || 'http://localhost:3002';

export const getParticipantDetails = async (participantId) => {
  try {
    const res = await fetch(`${PARTICIPANTS_SERVICE_URL}/api/participants/${participantId}`);
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Erreur lors de la communication avec participants-service (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('[participantsClient Error]:', error.message);
    throw error;
  }
};
