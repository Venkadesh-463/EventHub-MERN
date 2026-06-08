const mongoose = require('mongoose');

const registrationSchema = mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Event',
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    status: {
      type: String,
      required: true,
      enum: ['registered', 'checked-in', 'attended', 'cancelled'],
      default: 'registered',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'n/a'],
      default: 'n/a',
    },
    paymentProof: {
      type: String,
      default: '',
    },
    checkInTime: {
      type: Date,
    },
    checkOutTime: {
      type: Date,
    },
    qrCodeData: {
      type: String,
      required: true,
      unique: true,
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Registration', registrationSchema);
