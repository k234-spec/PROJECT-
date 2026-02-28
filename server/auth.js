const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-saas-jwt-secret-dev-2024';
const JWT_EXPIRES = '7d';

const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

const authMiddleware = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { signToken, authMiddleware };
