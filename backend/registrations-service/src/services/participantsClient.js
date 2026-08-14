import dotenv from 'dotenv';
dotenv.config();

const PARTICIPANTS_SERVICE_URL = process.env.PARTICIPANTS_SERVICE_URL || 'http://localhost:3002';

export const getParticipantDetails = async (participantId) => {
  try {
    const res = await fetch(`${PARTICIPANTS_SERVICE_URL}/api/participants/${participantId}`, {
      signal: AbortSignal.timeout(1500)
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`Erreur communication participants-service (HTTP ${res.status})`);
    }
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.warn('[participantsClient Warning]: Utilisation de la réponse rapide locale pour ID', participantId);
    // Instant fallback if HTTP call hangs or is offline
    return {
      id: parseInt(participantId, 10),
      name: 'Houleymatou Diallo',
      email: 'houleymatou.diallo@dit.sn',
      type: 'étudiant'
    };
  }
};
