require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const auth = require('./middleware/auth');
const { getDashboard } = require('./controllers/dashboardController');

// Fail early with a clear message instead of a confusing error on the first request.
for (const name of ['MONGO_URI', 'JWT_SECRET']) {
  if (!process.env[name]) {
    console.error(`Missing environment variable: ${name}`);
    process.exit(1);
  }
}

const app = express();

// Browsers may call the API only from the deployed frontend (CLIENT_URL, comma-separated
// if there is more than one) or from a local dev server on any port.
const allowedOrigins = [
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/,
  ...(process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Smart Student Tracker API is running' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/subjects', auth, require('./routes/subjects'));
app.use('/api/tasks', auth, require('./routes/tasks'));
app.get('/api/dashboard', auth, getDashboard);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler. Express 5 forwards errors thrown in async controllers here,
// so the controllers do not need their own try/catch blocks.
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const first = Object.values(err.errors)[0];
    const message = first.name === 'CastError' ? `Invalid value for ${first.path}` : first.message;
    return res.status(400).json({ message });
  }
  if (err.name === 'CastError') {
    // A malformed id in the URL simply means the record does not exist.
    return res.status(404).json({ message: 'Not found' });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Email is already registered' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }

  console.error(err);
  res.status(500).json({ message: 'Server error. Please try again later.' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
