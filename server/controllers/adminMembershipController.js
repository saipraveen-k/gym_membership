const Membership = require('../models/Membership');
const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/errorMiddleware');

// @route  GET /api/admin/memberships
// @desc   List ALL memberships (including inactive) for the admin table
// @access Admin
const listMemberships = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;
  const query = {};

  if (isActive === 'true') query.isActive = true;
  if (isActive === 'false') query.isActive = false;

  if (search) {
    const term = String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(term, 'i');
    query.$or = [{ name: regex }, { category: regex }, { description: regex }];
  }

  const memberships = await Membership.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Memberships fetched successfully',
    data: memberships,
    meta: { total: memberships.length },
  });
});

// @route  POST /api/admin/memberships
// @desc   Create a membership
// @access Admin
const createMembership = asyncHandler(async (req, res) => {
  const { name, description, price, duration, durationUnit, category, features, isActive } =
    req.body;

  const membership = await Membership.create({
    name,
    description,
    price,
    duration,
    durationUnit: durationUnit || 'months',
    category,
    features: Array.isArray(features)
      ? features.map((f) => String(f).trim()).filter(Boolean)
      : [],
    isActive: isActive !== undefined ? Boolean(isActive) : true,
  });

  res.status(201).json({
    success: true,
    message: 'Membership created successfully',
    data: membership,
  });
});

// @route  PUT /api/admin/memberships/:id
// @desc   Update a membership
// @access Admin
const updateMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findById(req.params.id);

  if (!membership) {
    return res.status(404).json({ success: false, message: 'Membership not found' });
  }

  const { name, description, price, duration, durationUnit, category, features, isActive } =
    req.body;

  if (name !== undefined) membership.name = name;
  if (description !== undefined) membership.description = description;
  if (price !== undefined) membership.price = price;
  if (duration !== undefined) membership.duration = duration;
  if (durationUnit !== undefined) membership.durationUnit = durationUnit;
  if (category !== undefined) membership.category = category;
  if (features !== undefined) {
    membership.features = Array.isArray(features)
      ? features.map((f) => String(f).trim()).filter(Boolean)
      : [];
  }
  if (isActive !== undefined) membership.isActive = Boolean(isActive);

  await membership.save();

  res.status(200).json({
    success: true,
    message: 'Membership updated successfully',
    data: membership,
  });
});

// @route  DELETE /api/admin/memberships/:id
// @desc   Delete a membership (hard delete if unused, deactivation if it has subscriptions)
// @access Admin
const deleteMembership = asyncHandler(async (req, res) => {
  const membership = await Membership.findById(req.params.id);

  if (!membership) {
    return res.status(404).json({ success: false, message: 'Membership not found' });
  }

  const subscriptionCount = await Subscription.countDocuments({ membership: membership._id });

  if (subscriptionCount > 0) {
    // Safe deletion: memberships with existing applications are deactivated instead.
    membership.isActive = false;
    await membership.save();

    return res.status(200).json({
      success: true,
      message: `"${membership.name}" has ${subscriptionCount} application(s), so it was deactivated instead of deleted. It will no longer appear to users.`,
      data: { ...membership.toObject(), deactivated: true },
    });
  }

  await membership.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Membership deleted successfully',
    data: null,
  });
});

module.exports = { listMemberships, createMembership, updateMembership, deleteMembership };
