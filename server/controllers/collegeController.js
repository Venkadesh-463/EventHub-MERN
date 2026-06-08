const Event = require('../models/Event');
const College = require('../models/College');
const Registration = require('../models/Registration');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/responseHandler');

// @desc    Get all colleges (public)
// @route   GET /api/colleges
// @access  Public
const getAllColleges = asyncHandler(async (req, res) => {
  const colleges = await College.find({}).select('name location logo website');
  res.json(colleges);
});

// @desc    Get single college by ID (public)
// @route   GET /api/colleges/:id
// @access  Public
const getCollegeById = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id);
  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }
  res.json(college);
});

// @desc    Get stats for college events
// @route   GET /api/college/stats
// @access  Private/College
const getCollegeStats = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  const eventIds = events.map(e => e._id);
  
  const totalRegistrations = await Registration.countDocuments({
    event: { $in: eventIds }
  });

  sendResponse(res, 200, 'College stats fetched', {
    totalEvents: events.length,
    totalRegistrations,
  });
});

// @desc    Upload college logo
// @route   PUT /api/colleges/:id/logo
// @access  Private
const uploadCollegeLogo = asyncHandler(async (req, res) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }

  // Ensure user is admin of this college or a super admin
  if (req.user.role !== 'admin' && req.user.college?.toString() !== college._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this college');
  }

  if (req.file) {
    // Construct the file URL (assuming the server is running on the same host or proxy is setup)
    const logoUrl = `/uploads/profiles/${req.file.filename}`;
    college.logo = logoUrl;
    await college.save();
    sendResponse(res, 200, 'Logo uploaded successfully', { logoUrl });
  } else {
    res.status(400);
    throw new Error('No file uploaded');
  }
});

module.exports = {
  getAllColleges,
  getCollegeById,
  getCollegeStats,
  uploadCollegeLogo,
};
