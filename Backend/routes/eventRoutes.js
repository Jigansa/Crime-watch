import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  updateVolunteerStatus
} from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createEvent)
  .get(getEvents);

router.route('/:id')
  .get(getEventById)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.route('/:id/register')
  .post(protect, registerForEvent);

router.route('/:id/volunteers/:userId')
  .put(protect, updateVolunteerStatus);

export default router; 