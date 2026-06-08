const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/responseHandler');
const Team = require('../models/Team');
const Event = require('../models/Event');
const crypto = require('crypto');

// @desc    Create a new team for an event
// @route   POST /api/teams/create
// @access  Private (Student)
const createTeam = asyncHandler(async (req, res) => {
  const { name, eventId } = req.body;

  if (!name || !eventId) {
    return res.status(400).json({ success: false, message: 'Team name and event ID are required' });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (!event.isTeamEvent) {
    return res.status(400).json({ success: false, message: 'This event does not support teams' });
  }

  // Generate unique invite code
  const inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();

  const team = await Team.create({
    name,
    event: eventId,
    leader: req.user._id,
    members: [req.user._id],
    inviteCode,
    status: 'pending'
  });

  sendResponse(res, 201, 'Team created successfully', team);
});

// @desc    Join a team using an invite code
// @route   POST /api/teams/join/:code
// @access  Private (Student)
const joinTeam = asyncHandler(async (req, res) => {
  const { code } = req.params;

  const team = await Team.findOne({ inviteCode: code.toUpperCase() }).populate('event');
  if (!team) {
    return res.status(404).json({ success: false, message: 'Invalid invite code' });
  }

  // Check if user is already a member
  if (team.members.includes(req.user._id)) {
    return res.status(400).json({ success: false, message: 'You are already in this team' });
  }

  // Check team size
  if (team.members.length >= team.event.maxTeamSize) {
    return res.status(400).json({ success: false, message: 'Team is already full' });
  }

  team.members.push(req.user._id);
  
  // If team reaches min size, update status
  if (team.members.length >= team.event.minTeamSize) {
    team.status = 'confirmed';
  }

  await team.save();

  sendResponse(res, 200, 'Joined team successfully', team);
});

// @desc    Get team details
// @route   GET /api/teams/:id
// @access  Private
const getTeamDetails = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('members', 'name email profileImage')
    .populate('leader', 'name email')
    .populate('event', 'title date location');

  if (!team) {
    return res.status(404).json({ success: false, message: 'Team not found' });
  }

  sendResponse(res, 200, 'Team details fetched', team);
});

module.exports = { createTeam, joinTeam, getTeamDetails };
