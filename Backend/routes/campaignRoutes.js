import express from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addCampaignUpdate,
  getCampaignStats
} from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createCampaign)
  .get(getCampaigns);

router.route('/:id')
  .get(getCampaignById)
  .put(protect, updateCampaign)
  .delete(protect, deleteCampaign);

router.route('/:id/updates')
  .post(protect, addCampaignUpdate);

router.route('/:id/stats')
  .get(protect, getCampaignStats);

export default router; 