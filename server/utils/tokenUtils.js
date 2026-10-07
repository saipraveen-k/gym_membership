const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a user id. Expires in 7 days.
 */
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * Public shape of a user object (never includes password).
 */
const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

module.exports = { generateToken, toPublicUser };
