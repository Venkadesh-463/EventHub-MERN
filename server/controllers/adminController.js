const User = require('../models/User');
const Event = require('../models/Event');
const College = require('../models/College');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/responseHandler');
const { sendCollegeOnboardingEmail } = require('../services/mailService');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).populate('college', 'name location').select('-password');
  sendResponse(res, 200, 'All users fetched', users);
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    await user.deleteOne();
    sendResponse(res, 200, 'User removed');
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Create a College Admin
// @route   POST /api/admin/create-college
// @access  Private/Admin
const createCollegeAdmin = asyncHandler(async (req, res) => {
  const { adminName, email, password, collegeName, collegeLocation } = req.body;

  if (!adminName || !email || !password || !collegeName) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create College profile first
  const college = await College.create({
    name: collegeName,
    location: collegeLocation || 'Main Campus',
    adminEmail: email,
  });

  // Create User and link to college
  const user = await User.create({
    name: adminName,
    email,
    password,
    role: 'college',
    college: college._id,
  });

  if (user) {
    // Send automated onboarding email to the new admin
    sendCollegeOnboardingEmail(adminName, email, password, collegeName);

    sendResponse(res, 201, 'College Admin created successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Admin forceful password reset
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
const adminResetPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const user = await User.findById(req.params.id);

  if (user) {
    user.password = newPassword;
    await user.save();
    sendResponse(res, 200, 'User password updated successfully');
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Assign College to Admin
// @route   PUT /api/admin/users/:id/assign-college
// @access  Private/Admin
const assignCollegeToAdmin = asyncHandler(async (req, res) => {
  const { collegeName, collegeLocation, adminEmail } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role !== 'college') {
    res.status(400);
    throw new Error('User is not a college admin');
  }

  let college = await College.findOne({ name: collegeName });
  if (!college) {
    college = await College.create({
      name: collegeName,
      location: collegeLocation || 'Main Campus',
      adminEmail: adminEmail || user.email,
    });
  }

  user.college = college._id;
  await user.save();

  sendResponse(res, 200, 'College assigned successfully');
});

module.exports = {
  getAllUsers,
  deleteUser,
  createCollegeAdmin,
  adminResetPassword,
  assignCollegeToAdmin,
};
