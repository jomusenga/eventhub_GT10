import express from 'express';
import {
  getAllParticipants,
  getParticipantById,
  createParticipant,
  updateParticipant,
  deleteParticipant
} from '../controllers/participantController.js';

const router = express.Router();

router.get('/', getAllParticipants);
router.post('/', createParticipant);
router.get('/:id', getParticipantById);
router.put('/:id', updateParticipant);
router.delete('/:id', deleteParticipant);

export default router;
