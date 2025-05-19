import express from 'express';
import {
  registerNGO,
  getNGOs,
  getNGOById,
  updateNGO,
  deleteNGO,
  verifyNGO,
  getNGOStats
} from '../controllers/ngoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, registerNGO)
  .get(getNGOs);

router.route('/:id')
  .get(getNGOById)
  .put(protect, updateNGO)
  .delete(protect, deleteNGO);

router.route('/:id/verify')
  .put(protect, admin, verifyNGO);

router.route('/:id/stats')
  .get(protect, getNGOStats);

export default router; 