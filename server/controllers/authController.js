const User = require('../models/User');
const { generateToken, toPublicUser } = require('../utils/tokenUtils');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (confirmPassword !== undefined && confirmPassword !== password) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  const normalizedEmail = String(email).toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists',
    });
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    phone: String(phone).trim(),
    password,
    role: 'user',
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      token,
      user: toPublicUser(user),
    },
  });
});

// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email).toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: toPublicUser(user),
    },
  });
});

// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Current user fetched successfully',
    data: toPublicUser(req.user),
  });
});

// @route  PUT /api/auth/profile
// @access Private (name and phone only - role and email are immutable)
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user._id);

  if (name !== undefined) user.name = String(name).trim();
  if (phone !== undefined) user.phone = String(phone).trim();

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: toPublicUser(user),
  });
});

// @route  PUT /api/auth/change-password
// @access Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

module.exports = { register, login, getMe, updateProfile, changePassword };
