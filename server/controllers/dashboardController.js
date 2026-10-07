const Subject = require('../models/Subject');
const Task = require('../models/Task');

async function getDashboard(req, res) {
  const [subjects, tasks] = await Promise.all([
    Subject.find({ userId: req.userId }).sort('createdAt'),
    Task.find({ userId: req.userId }).sort('deadline').populate('subjectId', 'name'),
  ]);

  // Overall attendance = total attended / total held (not the average of percentages).
  const attended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
  const total = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const overallAttendance = total > 0 ? Math.round((attended / total) * 1000) / 10 : null;

  const pending = tasks.filter((t) => t.status === 'pending');

  res.json({
    totalSubjects: subjects.length,
    overallAttendance,
    totalTasks: tasks.length,
    pendingTasks: pending.length,
    completedTasks: tasks.length - pending.length,
    subjects,
    upcomingTasks: pending.slice(0, 5), // already sorted by nearest deadline
  });
}

module.exports = { getDashboard };
