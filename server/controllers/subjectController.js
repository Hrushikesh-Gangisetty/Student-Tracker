const Subject = require('../models/Subject');
const Task = require('../models/Task');

// Every query filters by req.userId, so a user can only ever touch their own subjects.

async function getSubjects(req, res) {
  const subjects = await Subject.find({ userId: req.userId }).sort('createdAt');
  res.json(subjects);
}

async function createSubject(req, res) {
  const { name, totalClasses, attendedClasses } = req.body || {};
  const subject = await Subject.create({ userId: req.userId, name, totalClasses, attendedClasses });
  res.status(201).json(subject);
}

// Handles both PUT /:id (any field) and PUT /:id/attendance (just the counts).
async function updateSubject(req, res) {
  const subject = await Subject.findOne({ _id: req.params.id, userId: req.userId });
  if (!subject) return res.status(404).json({ message: 'Subject not found' });

  for (const field of ['name', 'totalClasses', 'attendedClasses']) {
    if (req.body?.[field] !== undefined) subject[field] = req.body[field];
  }

  await subject.save(); // runs the schema validation (attended <= total etc.)
  res.json(subject);
}

async function deleteSubject(req, res) {
  const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  // Tasks linked to this subject are kept, just unlinked.
  await Task.updateMany({ subjectId: subject._id }, { subjectId: null });
  res.json({ message: 'Subject deleted' });
}

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };
