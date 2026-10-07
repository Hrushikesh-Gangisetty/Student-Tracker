// Fills the database with a demo account so the app does not look empty.
// Run with: npm run seed   (safe to run again; it resets only the demo account)
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Task = require('./models/Task');

const DEMO = { name: 'Demo Student', email: 'demo@student.com', password: 'demo123' };

// A date N days from today (negative = in the past), at midnight UTC like the date picker sends.
function daysFromNow(days) {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const old = await User.findOne({ email: DEMO.email });
  if (old) {
    await Subject.deleteMany({ userId: old._id });
    await Task.deleteMany({ userId: old._id });
    await old.deleteOne();
  }

  const user = await User.create({ ...DEMO, password: await bcrypt.hash(DEMO.password, 10) });
  const userId = user._id;

  const subjects = await Subject.insertMany([
    { userId, name: 'DBMS', totalClasses: 40, attendedClasses: 34 },
    { userId, name: 'Operating Systems', totalClasses: 36, attendedClasses: 28 },
    { userId, name: 'Computer Networks', totalClasses: 38, attendedClasses: 35 },
    { userId, name: 'Artificial Intelligence', totalClasses: 35, attendedClasses: 24 },
    { userId, name: 'Software Engineering', totalClasses: 30, attendedClasses: 26 },
    { userId, name: 'Compiler Design', totalClasses: 32, attendedClasses: 20 },
  ]);

  // Look up a subject id by name so tasks can be linked to subjects.
  const subjectId = (name) => subjects.find((s) => s.name === name)._id;

  await Task.insertMany([
    { userId, subjectId: subjectId('Operating Systems'), title: 'OS Lab Record', description: 'Complete experiments 5 to 8 and get them signed.', deadline: daysFromNow(-2) },
    { userId, subjectId: subjectId('DBMS'), title: 'DBMS Assignment', description: 'Normalization problems from Unit 3.', deadline: daysFromNow(1) },
    { userId, title: 'React Mini Project', description: 'Finish the dashboard page and charts.', deadline: daysFromNow(2) },
    { userId, subjectId: subjectId('Computer Networks'), title: 'CN Seminar Slides', description: 'Topic: TCP congestion control.', deadline: daysFromNow(6) },
    { userId, subjectId: subjectId('Artificial Intelligence'), title: 'AI Quiz Preparation', description: 'Revise search algorithms and A*.', deadline: daysFromNow(10) },
    { userId, subjectId: subjectId('Compiler Design'), title: 'Compiler Design Assignment', description: 'LL(1) parsing table questions.', deadline: daysFromNow(-6), status: 'completed' },
    { userId, subjectId: subjectId('Software Engineering'), title: 'SE Case Study', description: 'SRS document for library management system.', deadline: daysFromNow(-4), status: 'completed' },
    { userId, subjectId: subjectId('DBMS'), title: 'DBMS Lab Internal', description: 'SQL queries practice set.', deadline: daysFromNow(-9), status: 'completed' },
    { userId, title: 'Mini Project Abstract', description: 'Submit the one-page abstract to the guide.', deadline: daysFromNow(-12), status: 'completed' },
    { userId, subjectId: subjectId('Operating Systems'), title: 'OS Assignment 1', description: 'CPU scheduling numericals.', deadline: daysFromNow(-15), status: 'completed' },
  ]);

  console.log(`Demo data created. Log in with ${DEMO.email} / ${DEMO.password}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
