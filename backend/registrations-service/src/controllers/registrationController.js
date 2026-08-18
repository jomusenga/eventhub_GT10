import { registrationModel } from '../models/registrationModel.js';
import { getEventDetails } from '../services/eventsClient.js';
import { getParticipantDetails } from '../services/participantsClient.js';

export const registerParticipant = async (req, res, next) => {
  try {
    const { event_id, participant_id } = req.body;

    if (!event_id || !participant_id) {
      return res.status(400).json({
        success: false,
        message: 'Les champs event_id et participant_id sont obligatoires'
      });
    }

    // 1. Check if participant exists in participants-service
    const participant = await getParticipantDetails(participant_id);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: `Participant avec l'ID ${participant_id} non trouvé`
      });
    }

    // 2. Check if event exists in events-service
    const event = await getEventDetails(event_id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Événement avec l'ID ${event_id} non trouvé`
      });
    }

    if (event.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de s\'inscrire : cet événement est annulé'
      });
    }

    // 3. Check duplicate registration
    const existing = await registrationModel.findByEventAndParticipant(event_id, participant_id);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Le participant est déjà inscrit à cet événement'
      });
    }

    // 4. Check capacity availability
    const currentCount = await registrationModel.countByEventId(event_id);
    if (currentCount >= event.max_capacity) {
      return res.status(400).json({
        success: false,
        message: `Événement complet ! Capacité maximale (${event.max_capacity}) atteinte.`
      });
    }

    // 5. Create registration
    const registration = await registrationModel.create({ event_id, participant_id });

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        ...registration,
        eventTitle: event.title,
        participantName: participant.name,
        remainingSeats: event.max_capacity - (currentCount + 1)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await registrationModel.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Inscription introuvable avec l'ID ${id}` });
    }
    res.json({ success: true, message: 'Inscription annulée avec succès', data: deleted });
  } catch (error) {
    next(error);
  }
};

export const getRegistrationsByEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const registrations = await registrationModel.findByEvent(eventId);
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    next(error);
  }
};

export const getRegistrationsByParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;
    const registrations = await registrationModel.findByParticipant(participantId);
    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    next(error);
  }
};

export const getEventRegistrationCount = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const count = await registrationModel.countByEventId(eventId);
    res.json({ success: true, eventId: parseInt(eventId, 10), count });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await registrationModel.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
