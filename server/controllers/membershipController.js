const Membership = require('../models/Membership');
const { asyncHandler } = require('../middleware/errorMiddleware');

const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @route  GET /api/memberships
// @desc   List active memberships with search / filter / sort
// @access Public
// Query params: search, category, minPrice, maxPrice, duration, sort, includeInactive(admin)
const getMemberships = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, duration, sort } = req.query;

  const query = { isActive: true };

  if (search) {
    const regex = new RegExp(escapeRegex(String(search).trim()), 'i');
    query.$or = [{ name: regex }, { description: regex }, { features: regex }, { category: regex }];
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
    query.price = { ...(query.price || {}), $gte: Number(minPrice) };
  }

  if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
    query.price = { ...(query.price || {}), $lte: Number(maxPrice) };
  }

  if (duration && duration !== 'all' && !Number.isNaN(Number(duration))) {
    query.duration = Number(duration);
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { name: 1 },
  };
  const sortOption = sortMap[sort] || { createdAt: -1 };

  const memberships = await Membership.find(query).sort(sortOption);

  // Metadata for the filter panel (distinct categories + durations of active plans)
  const [categories, durations] = await Promise.all([
    Membership.distinct('category', { isActive: true }),
    Membership.distinct('duration', { isActive: true }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Memberships fetched successfully',
    data: memberships,
    meta: {
      total: memberships.length,
      categories: categories.filter(Boolean).sort(),
      durations: durations.sort((a, b) => a - b),
    },
  });
});

// @route  GET /api/memberships/:id
// @desc   Get a single membership
// @access Public (inactive memberships only visible to admins)
const getMembershipById = asyncHandler(async (req, res) => {
  const membership = await Membership.findById(req.params.id);

  if (!membership) {
    return res.status(404).json({ success: false, message: 'Membership not found' });
  }

  if (!membership.isActive) {
    return res.status(404).json({ success: false, message: 'Membership not found' });
  }

  res.status(200).json({
    success: true,
    message: 'Membership fetched successfully',
    data: membership,
  });
});

module.exports = { getMemberships, getMembershipById };
