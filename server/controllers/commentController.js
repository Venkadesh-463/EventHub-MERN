const Comment = require('../models/Comment');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/responseHandler');

// @desc    Get all comments for an event
// @route   GET /api/comments/:eventId
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ event: req.params.eventId })
    .populate('user', 'name role')
    .sort('-createdAt');

  sendResponse(res, 200, 'Comments fetched', comments);
});

// @desc    Post a comment
// @route   POST /api/comments
// @access  Private
const postComment = asyncHandler(async (req, res) => {
  const { eventId, text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const comment = await Comment.create({
    event: eventId,
    user: req.user._id,
    text,
  });

  const populatedComment = await Comment.findById(comment._id).populate('user', 'name role');

  sendResponse(res, 201, 'Comment posted', populatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user is the owner or an admin
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this comment');
  }

  await comment.deleteOne();
  sendResponse(res, 200, 'Comment removed');
});

module.exports = {
  getComments,
  postComment,
  deleteComment,
};
