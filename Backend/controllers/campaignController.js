import Campaign from '../models/Campaign.js';
import NGO from '../models/NGO.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new campaign
// @route   POST /api/campaigns
// @access  Private/NGO
export const createCampaign = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    goal,
    startDate,
    endDate,
    category,
    images
  } = req.body;

  // Verify that the user is associated with an NGO
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) {
    res.status(401);
    throw new Error('User not authorized to create campaigns');
  }

  const campaign = await Campaign.create({
    name,
    description,
    ngoId: ngo._id,
    goal,
    startDate,
    endDate,
    category,
    images
  });

  if (campaign) {
    res.status(201).json(campaign);
  } else {
    res.status(400);
    throw new Error('Invalid campaign data');
  }
});

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
export const getCampaigns = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  
  const filters = {};
  
  // Add filters based on query parameters
  if (req.query.category) filters.category = req.query.category;
  if (req.query.ngoId) filters.ngoId = req.query.ngoId;
  if (req.query.status) filters.status = req.query.status;
  if (req.query.isUrgent) filters.isUrgent = req.query.isUrgent === 'true';

  // Search functionality
  if (req.query.keyword) {
    filters.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }

  const count = await Campaign.countDocuments(filters);
  const campaigns = await Campaign.find(filters)
    .populate('ngoId', 'name isVerified')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    campaigns,
    page,
    pages: Math.ceil(count / pageSize)
  });
});

// @desc    Get campaign by ID
// @route   GET /api/campaigns/:id
// @access  Public
export const getCampaignById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id)
    .populate('ngoId', 'name description isVerified')
    .populate('donors.userId', 'name');

  if (campaign) {
    res.json(campaign);
  } else {
    res.status(404);
    throw new Error('Campaign not found');
  }
});

// @desc    Update campaign
// @route   PUT /api/campaigns/:id
// @access  Private/NGO
export const updateCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  // Verify that the user is associated with the NGO that created the campaign
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || ngo._id.toString() !== campaign.ngoId.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this campaign');
  }

  const updatedCampaign = await Campaign.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );

  res.json(updatedCampaign);
});

// @desc    Delete campaign
// @route   DELETE /api/campaigns/:id
// @access  Private/NGO
export const deleteCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  // Verify that the user is associated with the NGO that created the campaign
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || ngo._id.toString() !== campaign.ngoId.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this campaign');
  }

  await campaign.remove();
  res.json({ message: 'Campaign removed' });
});

// @desc    Add campaign update
// @route   POST /api/campaigns/:id/updates
// @access  Private/NGO
export const addCampaignUpdate = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  // Verify that the user is associated with the NGO that created the campaign
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || ngo._id.toString() !== campaign.ngoId.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this campaign');
  }

  campaign.updates.push({ title, content });
  await campaign.save();

  res.status(201).json(campaign);
});

// @desc    Get campaign statistics
// @route   GET /api/campaigns/:id/stats
// @access  Private/NGO
export const getCampaignStats = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign) {
    res.status(404);
    throw new Error('Campaign not found');
  }

  const stats = {
    totalRaised: campaign.raised,
    goalAmount: campaign.goal,
    percentageAchieved: (campaign.raised / campaign.goal) * 100,
    totalDonors: campaign.donors.length,
    daysLeft: Math.ceil((new Date(campaign.endDate) - new Date()) / (1000 * 60 * 60 * 24)),
    status: campaign.status
  };

  res.json(stats);
}); 