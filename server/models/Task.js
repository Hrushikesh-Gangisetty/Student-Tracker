const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Optional link to one of the user's subjects.
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    title: { type: String, required: [true, 'Task title is required'], trim: true },
    description: { type: String, default: '', trim: true },
    deadline: { type: Date, required: [true, 'Deadline is required'] },
    status: {
      type: String,
      enum: { values: ['pending', 'completed'], message: 'Status must be pending or completed' },
      default: 'pending',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('Task', taskSchema);
