const mongoose = require('mongoose');
const Subscription = require('../models/Subscription');
const Membership = require('../models/Membership');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { addDuration, sweepExpiredSubscriptions } = require('../utils/dateUtils');

// Allowed lifecycle transitions
const ALLOWED_TRANSITIONS = {
  pending: ['approved', 'rejected'],
  approved: ['active', 'rejected'],
  rejected: [],
  active: ['expired'],
  expired: [],
};

const POPULATES = [
  { path: 'user', select: 'name email phone role createdAt' },
  { path: 'membership', select: 'name price duration durationUnit category description features' },
];

// @route  GET /api/admin/applications
// @desc   All applications (filter by status / search)
// @access Admin
const getAllApplications = asyncHandler(async (req, res) => {
  await sweepExpiredSubscriptions();

  const { status, paymentStatus, search } = req.query;
  const query = {};

  if (status && status !== 'all') query.status = status;
  if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;

  let applications = await Subscription.find(query)
    .populate(POPULATES)
    .sort({ appliedAt: -1 });

  if (search) {
    const term = String(search).toLowerCase();
    applications = applications.filter(
      (app) =>
        (app.user && app.user.name && app.user.name.toLowerCase().includes(term)) ||
        (app.user && app.user.email && app.user.email.toLowerCase().includes(term)) ||
        (app.membership && app.membership.name && app.membership.name.toLowerCase().includes(term))
    );
  }

  res.status(200).json({
    success: true,
    message: 'Applications fetched successfully',
    data: applications,
    meta: { total: applications.length },
  });
});

// @route  PUT /api/admin/applications/:id/status
// @desc   Approve / Reject / Activate an application (with lifecycle enforcement)
// @access Admin
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid application id' });
  }

  const application = await Subscription.findById(id).populate(
    'membership',
    'name price duration durationUnit'
  );

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  const currentStatus = application.status;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(status)) {
    return res.status(409).json({
      success: false,
      message: `Cannot change status from "${currentStatus}" to "${status}"`,
    });
  }

  application.status = status;

  if (status === 'active') {
    if (!application.membership) {
      return res.status(400).json({
        success: false,
        message: 'Membership linked to this application no longer exists',
      });
    }

    const now = new Date();
    application.startDate = now;
    application.endDate = addDuration(
      now,
      application.membership.duration,
      application.membership.durationUnit
    );
  }

  await application.save();

  const updated = await Subscription.findById(application._id).populate(POPULATES);

  const messages = {
    approved: 'Application approved successfully',
    rejected: 'Application rejected successfully',
    active: 'Membership activated successfully',
    expired: 'Membership marked as expired',
    pending: 'Application moved back to pending',
  };

  res.status(200).json({
    success: true,
    message: messages[status] || 'Application status updated successfully',
    data: updated,
  });
});

// @route  PUT /api/admin/applications/:id/payment
// @desc   Mark payment as paid / unpaid (simulated payment)
// @access Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid application id' });
  }

  const application = await Subscription.findById(id);

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found' });
  }

  application.paymentStatus = paymentStatus;
  await application.save();

  const updated = await Subscription.findById(application._id).populate(POPULATES);

  res.status(200).json({
    success: true,
    message:
      paymentStatus === 'paid'
        ? 'Payment marked as paid successfully'
        : 'Payment marked as unpaid',
    data: updated,
  });
});

module.exports = { getAllApplications, updateApplicationStatus, updatePaymentStatus };
