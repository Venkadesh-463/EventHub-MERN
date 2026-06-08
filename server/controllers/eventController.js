const Event = require('../models/Event');
const User = require('../models/User');
const { sendEventNotification } = require('../services/mailService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({})
    .populate({
      path: 'organizer',
      select: 'name email college',
      populate: { path: 'college', select: 'name location logo' }
    })
    .populate('college', 'name location logo');
  res.json(events);
});

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate({
      path: 'organizer',
      select: 'name email college',
      populate: { path: 'college', select: 'name location logo website' }
    })
    .populate('college', 'name location logo website');

  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Create an event
// @route   POST /api/events
// @access  Private (College/Admin)
const createEvent = asyncHandler(async (req, res) => {
  const { title, description, date, time, location, category, department, capacity,
          isFree, price, paymentUPI, paymentInstructions, isTeamEvent, minTeamSize, maxTeamSize, coordinates } = req.body;

  let poster = '';
  if (req.file) {
    poster = `http://127.0.0.1:5000/uploads/events/${req.file.filename}`;
  }

  const isPaid = isFree === 'false' || isFree === false;

  const event = new Event({
    title,
    description,
    date,
    time,
    location,
    category,
    department,
    capacity,
    poster,
    organizer: req.user._id,
    college: req.user.college, // Automatically set from user's college profile
    isFree: !isPaid,
    price: isPaid ? Number(price) || 0 : 0,
    paymentUPI: isPaid ? paymentUPI || '' : '',
    paymentInstructions: isPaid ? paymentInstructions || '' : '',
    isTeamEvent: isTeamEvent === 'true' || isTeamEvent === true,
    minTeamSize: Number(minTeamSize) || 1,
    maxTeamSize: Number(maxTeamSize) || 1,
    coordinates: coordinates ? JSON.parse(coordinates) : undefined,
  });

  const createdEvent = await event.save();

  // Notify students (Async, don't block the response)
  User.find({ role: 'student' }).select('email').then(students => {
    if (students && students.length > 0) {
      sendEventNotification(students, createdEvent);
    }
  });

  res.status(201).json(createdEvent);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Owner/Admin)
const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, date, time, location, category, department, capacity, status,
          isFree, price, paymentUPI, paymentInstructions, isTeamEvent, minTeamSize, maxTeamSize, coordinates } = req.body;

  const event = await Event.findById(req.params.id);

  if (event) {
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this event');
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;
    event.time = time || event.time;
    event.location = location || event.location;
    event.category = category || event.category;
    event.department = department || event.department;
    event.capacity = capacity !== undefined ? capacity : event.capacity;
    event.status = status || event.status;

    // Payment fields
    if (isFree !== undefined) {
      const isPaid = isFree === 'false' || isFree === false;
      event.isFree = !isPaid;
      event.price = isPaid ? Number(price) || 0 : 0;
      event.paymentUPI = isPaid ? (paymentUPI || event.paymentUPI) : '';
      event.paymentInstructions = isPaid ? (paymentInstructions || event.paymentInstructions) : '';
    }

    if (isTeamEvent !== undefined) {
      event.isTeamEvent = isTeamEvent === 'true' || isTeamEvent === true;
      event.minTeamSize = Number(minTeamSize) || event.minTeamSize;
      event.maxTeamSize = Number(maxTeamSize) || event.maxTeamSize;
    }

    if (coordinates) {
      event.coordinates = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Owner/Admin)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to delete this event');
    }

    await event.deleteOne();
    res.json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
