const mongoose = require('mongoose');

const wholeNumber = {
  validator: Number.isInteger,
  message: 'Class counts must be whole numbers',
};

// Attendance percentage is never stored; it is calculated from these two counts.
const subjectSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Subject name is required'], trim: true },
    totalClasses: {
      type: Number,
      default: 0,
      min: [0, 'Total classes cannot be negative'],
      validate: wholeNumber,
    },
    attendedClasses: {
      type: Number,
      default: 0,
      min: [0, 'Attended classes cannot be negative'],
      validate: [
        wholeNumber,
        {
          validator: function (value) {
            return value <= this.totalClasses;
          },
          message: 'Attended classes cannot exceed total classes',
        },
      ],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Subject', subjectSchema);
