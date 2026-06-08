const Registration = require('../models/Registration');
const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/responseHandler');
const { sendAttendanceEmail, sendRegistrationEmail } = require('../services/mailService');
const crypto = require('crypto');

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private (Student)
const registerForEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  // Check if already registered
  const alreadyRegistered = await Registration.findOne({
    event: eventId,
    student: req.user._id,
  });

  if (alreadyRegistered) {
    res.status(400);
    throw new Error('You are already registered for this event');
  }

  // Check capacity
  if (event.capacity > 0) {
    const registrationCount = await Registration.countDocuments({ event: eventId });
    if (registrationCount >= event.capacity) {
      res.status(400);
      throw new Error('Event is full');
    }
  }

  // Generate unique 8-character QR Registration ID (e.g., EH-A1B2C3)
  let qrCodeData;
  let isUnique = false;
  while (!isUnique) {
    const shortId = crypto.randomBytes(3).toString('hex').toUpperCase();
    qrCodeData = `EH-${shortId}`;
    const existing = await Registration.findOne({ qrCodeData });
    if (!existing) isUnique = true;
  }

  let paymentProof = '';
  if (req.file) {
    paymentProof = `/uploads/payments/${req.file.filename}`;
  }

  const registration = await Registration.create({
    event: eventId,
    student: req.user._id,
    qrCodeData,
    paymentStatus: event.isFree ? 'n/a' : 'pending',
    paymentProof: event.isFree ? '' : paymentProof,
  });

  // Notify student (Async)
  sendRegistrationEmail(req.user, event, qrCodeData);

  sendResponse(res, 201, 'Successfully registered for event', registration);
});

// @desc    Get student registrations
// @route   GET /api/registrations/my
// @access  Private (Student)
const getMyRegistrations = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ student: req.user._id })
    .populate('event')
    .sort('-createdAt');

  sendResponse(res, 200, 'Registrations fetched', registrations);
});

// @desc    Check-in a student via QR code
// @route   POST /api/registrations/checkin
// @access  Private (College)
const checkIn = asyncHandler(async (req, res) => {
  const { qrCodeData } = req.body;

  const registration = await Registration.findOne({ qrCodeData })
    .populate('student', 'name email')
    .populate('event', 'title organizer');

  if (!registration) {
    res.status(404);
    throw new Error('Invalid QR code – registration not found');
  }

  // Handle Scan 1: Initial Check-in
  if (registration.status === 'registered') {
    registration.status = 'checked-in';
    registration.checkInTime = new Date();
    await registration.save();
    
    return sendResponse(res, 200, `👋 ${registration.student.name} checked in at ${registration.checkInTime.toLocaleTimeString()}. Final scan required at event end.`, {
      registration,
      step: 1
    });
  }

  // Handle Scan 2: Finalize Attendance
  if (registration.status === 'checked-in') {
    const now = new Date();
    const startTime = new Date(registration.checkInTime);
    const diffMinutes = Math.floor((now - startTime) / (1000 * 60));

    // Minimum duration check (e.g., 30 minutes. Setting to 1 for quick testing)
    const minDuration = 1; 

    if (diffMinutes < minDuration) {
      res.status(400);
      throw new Error(`Insufficient duration. Student has only been present for ${diffMinutes} minutes. Min required: ${minDuration}m`);
    }

    registration.status = 'attended';
    registration.checkOutTime = now;
    await registration.save();

    // Notify student (Async)
    sendAttendanceEmail(registration.student, registration.event, diffMinutes);

    return sendResponse(res, 200, `✅ Attendance Verified for ${registration.student.name}! Total time: ${diffMinutes} mins. Certificate unlocked.`, {
      registration,
      step: 2
    });
  }

  if (registration.status === 'attended') {
    res.status(400);
    throw new Error(`${registration.student.name} has already completed attendance for this event.`);
  }
});

// @desc    Get all registrations for an event (College Admin)
// @route   GET /api/registrations/event/:eventId
// @access  Private (College)
const getEventAttendees = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ event: req.params.eventId })
    .populate('student', 'name email')
    .sort('-createdAt');

  sendResponse(res, 200, 'Attendees fetched', registrations);
});

// @desc    Verify payment for a registration
// @route   PUT /api/registrations/:id/verify-payment
// @access  Private (College)
const verifyPayment = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'verified' or 'rejected'
  
  if (!['verified', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status');
  }

  const registration = await Registration.findById(req.params.id);

  if (!registration) {
    res.status(404);
    throw new Error('Registration not found');
  }

  registration.paymentStatus = status;
  await registration.save();

  sendResponse(res, 200, `Payment ${status} successfully`, registration);
});

module.exports = {
  registerForEvent,
  getMyRegistrations,
  checkIn,
  getEventAttendees,
  verifyPayment,
};
