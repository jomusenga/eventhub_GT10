import express from 'express';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
  restoreEvent,
  checkAvailability
} from '../controllers/eventController.js';

const router = express.Router();

router.get('/', getAllEvents);
router.post('/', createEvent);
router.get('/:id/availability', checkAvailability);
router.post('/:id/restore', restoreEvent);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
// DELETE = soft cancel (conserve id + inscriptions)
router.delete('/:id', cancelEvent);

export default router;
