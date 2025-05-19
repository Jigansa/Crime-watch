// backend/controllers/donationController.js
import Donation from '../models/Donation.js';
import Campaign from '../models/Campaign.js';
import NGO from '../models/NGO.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private
export const createDonation = asyncHandler(async (req, res) => {
  const {
    ngoId,
    campaignId,
    amount,
    paymentMethod,
    category,
    isAnonymous,
    message
  } = req.body;

  // Verify NGO exists
  const ngo = await NGO.findById(ngoId);
  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  // Create donation
  const donation = await Donation.create({
    donorId: req.user._id,
    ngoId,
    campaignId,
    amount,
    paymentMethod,
    category,
    isAnonymous,
    message,
    paymentStatus: 'pending' // Will be updated after payment processing
  });

  if (donation) {
    // Update campaign if donation is for a specific campaign
    if (campaignId) {
      await Campaign.findByIdAndUpdate(campaignId, {
        $inc: { raised: amount },
        $push: { donors: { userId: req.user._id, amount, date: new Date() } }
      });
    }

    // Update NGO statistics
    await NGO.findByIdAndUpdate(ngoId, {
      $inc: { totalDonations: amount }
    });

    // Update donor's statistics
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'donorProfile.totalDonations': amount },
      $push: { 'donorProfile.donationHistory': donation._id }
    });

    res.status(201).json(donation);
  } else {
    res.status(400);
    throw new Error('Invalid donation data');
  }
});

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private/Admin
export const getDonations = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;

  const filters = {};
  
  // Add filters based on query parameters
  if (req.query.ngoId) filters.ngoId = req.query.ngoId;
  if (req.query.campaignId) filters.campaignId = req.query.campaignId;
  if (req.query.category) filters.category = req.query.category;
  if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;

  // For non-admin users, only show their own donations
  if (req.user.role !== 'admin') {
    filters.donorId = req.user._id;
  }

  const count = await Donation.countDocuments(filters);
  const donations = await Donation.find(filters)
    .populate('ngoId', 'name')
    .populate('campaignId', 'name')
    .populate('donorId', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    donations,
    page,
    pages: Math.ceil(count / pageSize)
  });
});

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private
export const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate('ngoId', 'name')
    .populate('campaignId', 'name')
    .populate('donorId', 'name');

  if (donation) {
    // Check if user is authorized to view this donation
    if (
      donation.donorId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(401);
      throw new Error('Not authorized to view this donation');
    }
    res.json(donation);
  } else {
    res.status(404);
    throw new Error('Donation not found');
  }
});

// @desc    Update donation payment status
// @route   PUT /api/donations/:id/payment
// @access  Private/Admin
export const updateDonationPayment = asyncHandler(async (req, res) => {
  const { paymentStatus, transactionId } = req.body;
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  donation.paymentStatus = paymentStatus;
  donation.transactionId = transactionId;

  if (paymentStatus === 'completed') {
    // Generate receipt number if payment is completed
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    donation.receiptNumber = `DON${year}${month}${random}`;
  }

  const updatedDonation = await donation.save();
  res.json(updatedDonation);
});

// @desc    Get donation statistics
// @route   GET /api/donations/stats
// @access  Private
export const getDonationStats = asyncHandler(async (req, res) => {
  const filters = {};
  
  // For non-admin users, only show their own donation stats
  if (req.user.role !== 'admin') {
    filters.donorId = req.user._id;
  }

  // Aggregate donation statistics
  const stats = await Donation.aggregate([
    { $match: { ...filters, paymentStatus: 'completed' } },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $project: {
        _id: 0,
        totalAmount: 1,
        count: 1,
        avgAmount: 1
      }
    }
  ]);

  // Get category-wise distribution
  const categoryStats = await Donation.aggregate([
    { $match: { ...filters, paymentStatus: 'completed' } },
    {
      $group: {
        _id: '$category',
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    overall: stats[0] || { totalAmount: 0, count: 0, avgAmount: 0 },
    byCategory: categoryStats
  });
});

// @desc    Get my donations
// @route   GET /api/donations/my
// @access  Private
export const getMyDonations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const myDonations = await Donation.find({ donorId: userId })
      .populate('ngoId', 'name')
      .populate('campaignId', 'name');
    res.status(200).json(myDonations);
  } catch (error) {
    console.error('❌ Failed to fetch user donations:', error.message);
    res.status(500).json({ message: 'Failed to fetch user donations', error: error.message });
  }
});

// @desc    Update donation status
// @route   PATCH /api/donations/:id/status
// @access  Private/Admin
export const updateDonationStatus = asyncHandler(async (req, res) => {
  const { status, userId, notes } = req.body;
  const donation = await Donation.findById(req.params.id);

  if (!donation) {
    res.status(404);
    throw new Error('Donation not found');
  }

  donation.status = status;

  if (status === 'accepted') {
    donation.acceptedBy = userId;
    donation.acceptanceNotes = notes;
    donation.acceptedAt = new Date();
  }

  if (status === 'picked') {
    donation.pickedUpBy = userId;
    donation.pickupNotes = notes;
    donation.pickedUpAt = new Date();
  }

  if (status === 'delivered') {
    donation.deliveredBy = userId;
    donation.deliveryNotes = notes;
    donation.deliveredAt = new Date();
  }

  await donation.save();
  res.status(200).json(donation);
});

// @desc    Get all donations (admin only)
// @route   GET /api/donations/all
// @access  Private/Admin
export const getAllDonations = asyncHandler(async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('ngoId', 'name')
      .populate('campaignId', 'name')
      .populate('donorId', 'name');
    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch donations', error: error.message });
  }
});

// @desc    Update a donation by ID
// @route   PUT /api/donations/:id
// @access  Private/Admin
export const updateDonation = asyncHandler(async (req, res) => {
  try {
    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(200).json(updatedDonation);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update donation', error: error.message });
  }
});

// @desc    Delete a donation by ID
// @route   DELETE /api/donations/:id
// @access  Private/Admin
export const deleteDonation = asyncHandler(async (req, res) => {
  try {
    const deletedDonation = await Donation.findByIdAndDelete(req.params.id);
    if (!deletedDonation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete donation', error: error.message });
  }
});
  
  