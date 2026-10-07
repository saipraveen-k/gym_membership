const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Membership = require('../models/Membership');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { sweepExpiredSubscriptions } = require('../utils/dateUtils');

const POPULATE_MEMBERSHIP = {
  path: 'membership',
  select: 'name price duration durationUnit category description features',
};

// @route  POST /api/applications
// @desc   Apply for a membership (creates a pending application)
// @access Private (authenticated user)
const createApplication = asyncHandler(async (req, res) => {
  const { membershipId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(membershipId)) {
    return res.status(400).json({ success: false, message: 'Invalid membership id' });
  }

  const membership = await Membership.findById(membershipId);

  if (!membership) {
    return res.status(404).json({ success: false, message: 'Membership not found' });
  }

  if (!membership.isActive) {
    return res.status(409).json({
      success: false,
      message: 'This membership is no longer available',
    });
  }

  // Prevent duplicate pending/approved/active applications for the same membership
  const existing = await Subscription.findOne({
    user: req.user._id,
    membership: membership._id,
    status: { $in: ['pending', 'approved', 'active'] },
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: `You already have a ${existing.status} application for this membership`,
    });
  }

  const application = await Subscription.create({
    user: req.user._id,
    membership: membership._id,
    status: 'pending',
    paymentStatus: 'unpaid',
    appliedAt: new Date(),
  });

  const populated = await application.populate([POPULATE_MEMBERSHIP]);

  res.status(201).json({
    success: true,
    message: 'Membership application submitted successfully.',
    data: populated,
  });
});

// @route  GET /api/applications/my
// @desc   Current user's applications
// @access Private
const getMyApplications = asyncHandler(async (req, res) => {
  await sweepExpiredSubscriptions();

  const applications = await Subscription.find({ user: req.user._id })
    .populate(POPULATE_MEMBERSHIP)
    .sort({ appliedAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Your applications fetched successfully',
    data: applications,
  });
});

// @route  GET /api/applications/:id
// @desc   Get a single application (owner or admin)
// @access Private
const getApplicationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid application id' });
  }

  const application = await Subscription.findById(id).populate([
    POPULATE_MEMBERSHIP,
    { path: 'user', select: 'name email phone role createdAt' },
  ]);

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const isOwner =
    application.user &&
    String(application.user._id ? application.user._id : application.user) ===
      String(req.user._id);

  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You are not allowed to view this application',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Application fetched successfully',
    data: application,
  });
});

module.exports = { createApplication, getMyApplications, getApplicationById };
