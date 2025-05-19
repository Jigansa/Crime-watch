//backend/routes/donationRoutes.js

import express from 'express';
import {
  createDonation,
  getDonations,
  getDonationById,
  updateDonationPayment,
  getDonationStats,
  getMyDonations,
  updateDonationStatus,
  getAllDonations,
  updateDonation,
  deleteDonation
} from '../controllers/donationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.route('/stats')
  .get(protect, getDonationStats);

// Protected routes
router.route('/')
  .post(protect, createDonation)
  .get(protect, getDonations);

router.route('/my')
  .get(protect, getMyDonations);

router.route('/all')
  .get(protect, admin, getAllDonations);

router.route('/:id')
  .get(protect, getDonationById)
  .put(protect, admin, updateDonation)
  .delete(protect, admin, deleteDonation);

router.route('/:id/payment')
  .put(protect, admin, updateDonationPayment);

router.route('/:id/status')
  .patch(protect, admin, updateDonationStatus);

export default router;