const { body } = require('express-validator');

const PASSWORD_RULES = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+?\d{1,3}[- ]?)?\d{7,15}$/)
    .withMessage('Please provide a valid phone number (7-15 digits)'),
  ...PASSWORD_RULES,
  body('confirmPassword')
    .optional({ nullable: true })
    .custom((value, { req }) => {
      if (value !== undefined && value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^(\+?\d{1,3}[- ]?)?\d{7,15}$/)
    .withMessage('Please provide a valid phone number (7-15 digits)'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

const membershipValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Membership name is required')
    .isLength({ min: 3, max: 80 })
    .withMessage('Membership name must be between 3 and 80 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 600 })
    .withMessage('Description must be between 10 and 600 characters'),
  body('price')
    .exists()
    .withMessage('Price is required')
    .bail()
    .isFloat({ min: 0 })
    .withMessage('Price must be 0 or greater')
    .toFloat(),
  body('duration')
    .exists()
    .withMessage('Duration is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Duration must be greater than 0')
    .toInt(),
  body('durationUnit')
    .optional()
    .isIn(['days', 'weeks', 'months', 'years'])
    .withMessage('Duration unit must be days, weeks, months or years'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('features.*')
    .optional()
    .isString()
    .withMessage('Each feature must be text'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Partial update rules: every field optional, validated only when present.
// The update controller applies only the fields that are sent.
const membershipUpdateValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Membership name is required')
    .isLength({ min: 3, max: 80 })
    .withMessage('Membership name must be between 3 and 80 characters'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 600 })
    .withMessage('Description must be between 10 and 600 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be 0 or greater')
    .toFloat(),
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be greater than 0')
    .toInt(),
  body('durationUnit')
    .optional()
    .isIn(['days', 'weeks', 'months', 'years'])
    .withMessage('Duration unit must be days, weeks, months or years'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('features.*')
    .optional()
    .isString()
    .withMessage('Each feature must be text'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const createApplicationValidation = [
  body('membershipId')
    .trim()
    .notEmpty()
    .withMessage('Membership id is required')
    .isMongoId()
    .withMessage('Invalid membership id'),
];

const applicationStatusValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'active', 'expired'])
    .withMessage('Status must be pending, approved, rejected, active or expired'),
];

const paymentStatusValidation = [
  body('paymentStatus')
    .isIn(['paid', 'unpaid'])
    .withMessage('Payment status must be paid or unpaid'),
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  membershipValidation,
  membershipUpdateValidation,
  createApplicationValidation,
  applicationStatusValidation,
  paymentStatusValidation,
};
