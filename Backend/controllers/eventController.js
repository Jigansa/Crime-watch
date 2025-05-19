import Event from '../models/Event.js';
import NGO from '../models/NGO.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/NGO
export const createEvent = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    date,
    duration,
    location,
    category,
    requiredSkills,
    maxVolunteers,
    images
  } = req.body;

  // Verify that the user is associated with an NGO
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo) {
    res.status(401);
    throw new Error('User not authorized to create events');
  }

  const event = await Event.create({
    name,
    description,
    ngoId: ngo._id,
    date,
    duration,
    location,
    category,
    requiredSkills,
    maxVolunteers,
    images
  });

  if (event) {
    res.status(201).json(event);
  } else {
    res.status(400);
    throw new Error('Invalid event data');
  }
});

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.page) || 1;
  
  const filters = {};
  
  // Add filters based on query parameters
  if (req.query.category) filters.category = req.query.category;
  if (req.query.ngoId) filters.ngoId = req.query.ngoId;
  if (req.query.status) filters.status = req.query.status;

  // Date filters
  if (req.query.fromDate) {
    filters.date = { $gte: new Date(req.query.fromDate) };
  }
  if (req.query.toDate) {
    filters.date = { ...filters.date, $lte: new Date(req.query.toDate) };
  }

  // Location-based search
  if (req.query.latitude && req.query.longitude && req.query.distance) {
    filters['location.coordinates'] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [Number(req.query.longitude), Number(req.query.latitude)]
        },
        $maxDistance: Number(req.query.distance) * 1000 // Convert km to meters
      }
    };
  }

  // Search functionality
  if (req.query.keyword) {
    filters.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }

  const count = await Event.countDocuments(filters);
  const events = await Event.find(filters)
    .populate('ngoId', 'name isVerified')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ date: 1 });

  res.json({
    events,
    page,
    pages: Math.ceil(count / pageSize)
  });
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('ngoId', 'name description isVerified')
    .populate('volunteers.userId', 'name');

  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/NGO
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Verify that the user is associated with the NGO that created the event
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || ngo._id.toString() !== event.ngoId.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this event');
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    { new: true }
  );

  res.json(updatedEvent);
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/NGO
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Verify that the user is associated with the NGO that created the event
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || ngo._id.toString() !== event.ngoId.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this event');
  }

  await event.remove();
  res.json({ message: 'Event removed' });
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check if event is full
  if (event.volunteers.length >= event.maxVolunteers) {
    res.status(400);
    throw new Error('Event is already full');
  }

  // Check if user is already registered
  if (event.volunteers.find(v => v.userId.toString() === req.user._id.toString())) {
    res.status(400);
    throw new Error('Already registered for this event');
  }

  event.volunteers.push({
    userId: req.user._id,
    status: 'pending'
  });

  const updatedEvent = await event.save();

  // Update user's volunteer profile
  await User.findByIdAndUpdate(req.user._id, {
    $push: { 'volunteerProfile.eventsAttended': event._id }
  });

  res.json(updatedEvent);
});

// @desc    Update volunteer status
// @route   PUT /api/events/:id/volunteers/:userId
// @access  Private/NGO
export const updateVolunteerStatus = asyncHandler(async (req, res) => {
  const { status, hoursLogged, feedback } = req.body;
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Verify that the user is associated with the NGO that created the event
  const ngo = await NGO.findOne({ userId: req.user._id });
  if (!ngo || ngo._id.toString() !== event.ngoId.toString()) {
    res.status(401);
    throw new Error('Not authorized to update volunteer status');
  }

  const volunteerIndex = event.volunteers.findIndex(
    v => v.userId.toString() === req.params.userId
  );

  if (volunteerIndex === -1) {
    res.status(404);
    throw new Error('Volunteer not found in event');
  }

  event.volunteers[volunteerIndex].status = status;
  if (hoursLogged) event.volunteers[volunteerIndex].hoursLogged = hoursLogged;
  if (feedback) event.volunteers[volunteerIndex].feedback = feedback;

  const updatedEvent = await event.save();

  // Update user's volunteer hours if status is 'attended'
  if (status === 'attended' && hoursLogged) {
    await User.findByIdAndUpdate(req.params.userId, {
      $inc: { 'volunteerProfile.totalHours': hoursLogged }
    });
  }

  res.json(updatedEvent);
}); 