const express = require('express');
const {
  createApplication,
  getMyApplications,
  getApplicationById,
} = require('../controllers/applicationController');
const { authenticateUser } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createApplicationValidation } = require('../utils/validators');

const router = express.Router();

// All application routes require a logged-in user
router.use(authenticateUser);

// @route POST /api/applications
router.post('/', createApplicationValidation, validate, createApplication);

// @route GET /api/applications/my
router.get('/my', getMyApplications);

// @route GET /api/applications/:id (owner or admin)
router.get('/:id', getApplicationById);

module.exports = router;
