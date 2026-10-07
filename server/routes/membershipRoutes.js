const express = require('express');
const {
  getMemberships,
  getMembershipById,
} = require('../controllers/membershipController');

const router = express.Router();

// @route GET /api/memberships
router.get('/', getMemberships);

// @route GET /api/memberships/:id
router.get('/:id', getMembershipById);

module.exports = router;
