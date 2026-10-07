const express = require('express');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  listMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
} = require('../controllers/adminMembershipController');
const { getUsers, getUserById } = require('../controllers/adminUserController');
const {
  getAllApplications,
  updateApplicationStatus,
  updatePaymentStatus,
} = require('../controllers/adminApplicationController');
const { getDashboardStats } = require('../controllers/adminDashboardController');
const {
  membershipValidation,
  membershipUpdateValidation,
  applicationStatusValidation,
  paymentStatusValidation,
} = require('../utils/validators');

const router = express.Router();

// Every /api/admin route requires authentication AND the admin role
router.use(authenticateUser, requireAdmin);

// ---------- Dashboard ----------
// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', getDashboardStats);

// ---------- Membership management ----------
// GET /api/admin/memberships (includes inactive plans)
router.get('/memberships', listMemberships);

// POST /api/admin/memberships
router.post('/memberships', membershipValidation, validate, createMembership);

// PUT /api/admin/memberships/:id (partial update: fields optional)
router.put('/memberships/:id', membershipUpdateValidation, validate, updateMembership);

// DELETE /api/admin/memberships/:id
router.delete('/memberships/:id', deleteMembership);

// ---------- User management ----------
// GET /api/admin/users
router.get('/users', getUsers);

// GET /api/admin/users/:id
router.get('/users/:id', getUserById);

// ---------- Application management ----------
// GET /api/admin/applications
router.get('/applications', getAllApplications);

// PUT /api/admin/applications/:id/status
router.put(
  '/applications/:id/status',
  applicationStatusValidation,
  validate,
  updateApplicationStatus
);

// PUT /api/admin/applications/:id/payment
router.put(
  '/applications/:id/payment',
  paymentStatusValidation,
  validate,
  updatePaymentStatus
);

module.exports = router;
