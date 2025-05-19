import NGO from '../models/NGO.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Register a new NGO
// @route   POST /api/ngos
// @access  Private
export const registerNGO = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    description,
    location,
    services,
    contact,
    documents
  } = req.body;

  const ngoExists = await NGO.findOne({ email });
  if (ngoExists) {
    res.status(400);
    throw new Error('NGO already exists');
  }

  const ngo = await NGO.create({
    name,
    email,
    description,
    location,
    services,
    contact,
    documents,
    userId: req.user._id
  });

  // Update user's ngoProfile
  await User.findByIdAndUpdate(req.user._id, {
    'ngoProfile.ngoId': ngo._id
  });

  if (ngo) {
    res.status(201).json(ngo);
  } else {
    res.status(400);
    throw new Error('Invalid NGO data');
  }
});

// @desc    Get all NGOs
// @route   GET /api/ngos
// @access  Public
export const getNGOs = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};

  const count = await NGO.countDocuments({ ...keyword });
  const ngos = await NGO.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    ngos,
    page,
    pages: Math.ceil(count / pageSize)
  });
});

// @desc    Get NGO by ID
// @route   GET /api/ngos/:id
// @access  Public
export const getNGOById = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);
  if (ngo) {
    res.json(ngo);
  } else {
    res.status(404);
    throw new Error('NGO not found');
  }
});

// @desc    Update NGO profile
// @route   PUT /api/ngos/:id
// @access  Private
export const updateNGO = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  // Check if user is authorized to update this NGO
  if (ngo.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to update this NGO');
  }

  const updatedNGO = await NGO.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );

  res.json(updatedNGO);
});

// @desc    Delete NGO
// @route   DELETE /api/ngos/:id
// @access  Private
export const deleteNGO = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  // Check if user is authorized to delete this NGO
  if (ngo.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this NGO');
  }

  await ngo.remove();
  res.json({ message: 'NGO removed' });
});

// @desc    Verify NGO
// @route   PUT /api/ngos/:id/verify
// @access  Private/Admin
export const verifyNGO = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  ngo.isVerified = true;
  const updatedNGO = await ngo.save();

  res.json(updatedNGO);
});

// @desc    Get NGO statistics
// @route   GET /api/ngos/:id/stats
// @access  Private
export const getNGOStats = asyncHandler(async (req, res) => {
  const ngo = await NGO.findById(req.params.id);

  if (!ngo) {
    res.status(404);
    throw new Error('NGO not found');
  }

  // You would typically aggregate data from donations, campaigns, etc.
  // This is a placeholder for the actual implementation
  const stats = {
    totalDonations: ngo.totalDonations,
    peopleHelped: ngo.peopleHelped,
    rating: ngo.rating,
    // Add more statistics as needed
  };

  res.json(stats);
}); 