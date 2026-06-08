const mongoose = require('mongoose');

const collegeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a college name'],
      unique: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    adminEmail: {
      type: String,
      required: [true, 'Please add an admin email'],
    },
    website: {
      type: String,
    },
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('College', collegeSchema);
