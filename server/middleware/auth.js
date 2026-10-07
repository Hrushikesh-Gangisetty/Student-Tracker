const jwt = require('jsonwebtoken');

// Reads "Authorization: Bearer <token>" and puts the user's id on req.userId.
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Not authorized. Please log in.' });
  }

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
}

module.exports = auth;
