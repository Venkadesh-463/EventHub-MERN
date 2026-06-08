const mongoose = require('mongoose');

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
    },
    time: {
      type: String,
      required: [true, 'Please add a time'],
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    department: {
      type: String,
      required: [true, 'Please specify the department'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    poster: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
    },
    capacity: {
      type: Number,
      default: 0,
    },
    registeredStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isFree: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    paymentUPI: {
      type: String,
      default: '',
    },
    paymentInstructions: {
      type: String,
      default: '',
    },
    isTeamEvent: {
      type: Boolean,
      default: false,
    },
    minTeamSize: {
      type: Number,
      default: 1,
    },
    maxTeamSize: {
      type: Number,
      default: 1,
    },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Event', eventSchema);
