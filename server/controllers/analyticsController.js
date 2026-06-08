const Registration = require('../models/Registration');
const Event = require('../models/Event');
const asyncHandler = require('../utils/asyncHandler');
const { sendResponse } = require('../utils/responseHandler');

// @desc    Get analytics for college admin
// @route   GET /api/analytics/college
// @access  Private (College)
const getCollegeAnalytics = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  const eventIds = events.map(e => e._id);

  const totalRegistrations = await Registration.countDocuments({ event: { $in: eventIds } });
  const totalAttended = await Registration.countDocuments({ event: { $in: eventIds }, status: 'attended' });

  // Category breakdown
  const categoryData = {};
  events.forEach(ev => {
    categoryData[ev.category] = (categoryData[ev.category] || 0) + 1;
  });
  const categoryChart = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  // Department breakdown
  const deptData = {};
  events.forEach(ev => {
    deptData[ev.department] = (deptData[ev.department] || 0) + 1;
  });
  const departmentChart = Object.entries(deptData).map(([name, value]) => ({ name, value }));

  // Registrations per event
  const eventStats = await Promise.all(events.map(async (ev) => {
    const registered = await Registration.countDocuments({ event: ev._id });
    const attended = await Registration.countDocuments({ event: ev._id, status: 'attended' });
    return { name: ev.title.length > 20 ? ev.title.substring(0, 20) + '...' : ev.title, registered, attended };
  }));

  sendResponse(res, 200, 'Analytics fetched', {
    totalEvents: events.length,
    totalRegistrations,
    totalAttended,
    attendanceRate: totalRegistrations > 0 ? Math.round((totalAttended / totalRegistrations) * 100) : 0,
    categoryChart,
    departmentChart,
    eventStats,
  });
});

// @desc    Get analytics for main admin
// @route   GET /api/analytics/admin
// @access  Private (Admin)
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const totalEvents = await Event.countDocuments();
  const totalRegistrations = await Registration.countDocuments();
  const totalAttended = await Registration.countDocuments({ status: 'attended' });

  // Monthly event trend
  const monthlyData = await Event.aggregate([
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 6 }
  ]);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trendChart = monthlyData.map(d => ({
    name: months[d._id.month - 1],
    events: d.count
  }));

  sendResponse(res, 200, 'Admin analytics fetched', {
    totalEvents,
    totalRegistrations,
    totalAttended,
    trendChart,
  });
});

// @desc    Get analytics for student
// @route   GET /api/analytics/student
// @access  Private (Student)
const getStudentAnalytics = asyncHandler(async (req, res) => {
  const registrations = await Registration.find({ student: req.user._id }).populate('event');
  const totalRegistrations = registrations.length;
  const totalAttended = registrations.filter(r => r.status === 'attended').length;
  
  // Category breakdown for student
  const categoryData = {};
  registrations.forEach(reg => {
    const cat = reg.event.category;
    categoryData[cat] = (categoryData[cat] || 0) + 1;
  });
  const categoryChart = Object.entries(categoryData).map(([name, value]) => ({ name, value }));

  sendResponse(res, 200, 'Student analytics fetched', {
    totalEvents: totalRegistrations,
    totalRegistrations,
    totalAttended,
    categoryChart,
  });
});

// @desc    Get detailed report data for college admin
// @route   GET /api/analytics/college/report
// @access  Private (College)
const getCollegeReportData = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.user._id });
  const eventIds = events.map(e => e._id);

  const registrations = await Registration.find({ event: { $in: eventIds } })
    .populate('student', 'name email')
    .populate('event', 'title')
    .sort({ registeredAt: -1 });

  let mostParticipatedEvent = null;
  let maxCount = 0;
  const eventCounts = {};
  
  registrations.forEach(reg => {
    if (reg.event && reg.event._id) {
      eventCounts[reg.event._id] = (eventCounts[reg.event._id] || 0) + 1;
    }
  });

  events.forEach(ev => {
    const count = eventCounts[ev._id] || 0;
    if (count > maxCount) {
      maxCount = count;
      mostParticipatedEvent = { title: ev.title, count };
    }
  });

  sendResponse(res, 200, 'Report data fetched', {
    mostParticipatedEvent,
    registrations
  });
});

module.exports = { getCollegeAnalytics, getAdminAnalytics, getStudentAnalytics, getCollegeReportData };
