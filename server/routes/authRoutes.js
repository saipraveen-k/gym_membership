const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} = require('../utils/validators');

const router = express.Router();

// @route POST /api/auth/register
router.post('/register', registerValidation, validate, register);

// @route POST /api/auth/login
router.post('/login', loginValidation, validate, login);

// @route GET /api/auth/me
router.get('/me', authenticateUser, getMe);

// @route PUT /api/auth/profile
router.put('/profile', authenticateUser, updateProfileValidation, validate, updateProfile);

// @route PUT /api/auth/change-password
router.put(
  '/change-password',
  authenticateUser,
  changePasswordValidation,
  validate,
  changePassword
);

module.exports = router;
