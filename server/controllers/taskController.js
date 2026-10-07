const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Task = require('../models/Task');

// A task may be linked to a subject, but only to one that belongs to the same user.
async function subjectIsAllowed(req) {
  const id = req.body?.subjectId;
  if (!id) return true;
  if (!mongoose.isValidObjectId(id)) return false;
  return (await Subject.exists({ _id: id, userId: req.userId })) !== null;
}

async function getTasks(req, res) {
  const tasks = await Task.find({ userId: req.userId }).sort('deadline').populate('subjectId', 'name');
  res.json(tasks);
}

async function createTask(req, res) {
  if (!(await subjectIsAllowed(req))) {
    return res.status(400).json({ message: 'Selected subject was not found' });
  }

  const { title, description, deadline, subjectId } = req.body || {};
  const task = await Task.create({
    userId: req.userId,
    title,
    description,
    deadline,
    subjectId: subjectId || null,
  });
  res.status(201).json(task);
}

// Handles both PUT /:id (edit) and PATCH /:id/status (complete / reopen).
async function updateTask(req, res) {
  const task = await Task.findOne({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (!(await subjectIsAllowed(req))) {
    return res.status(400).json({ message: 'Selected subject was not found' });
  }

  for (const field of ['title', 'description', 'deadline', 'status']) {
    if (req.body?.[field] !== undefined) task[field] = req.body[field];
  }
  if (req.body?.subjectId !== undefined) task.subjectId = req.body.subjectId || null;

  await task.save();
  res.json(task);
}

async function deleteTask(req, res) {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json({ message: 'Task deleted' });
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
