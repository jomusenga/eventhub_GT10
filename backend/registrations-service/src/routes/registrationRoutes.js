import express from 'express';
import {
  registerParticipant,
  cancelRegistration,
  getRegistrationsByEvent,
  getRegistrationsByParticipant,
  getEventRegistrationCount,
  getStats
} from '../controllers/registrationController.js';

const router = express.Router();

router.post('/', registerParticipant);
router.delete('/:id', cancelRegistration);
router.get('/event/:eventId', getRegistrationsByEvent);
router.get('/participant/:participantId', getRegistrationsByParticipant);
router.get('/event/:eventId/count', getEventRegistrationCount);
router.get('/stats', getStats);

export default router;
