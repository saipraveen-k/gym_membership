const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { sweepExpiredSubscriptions } = require('../utils/dateUtils');

// @route  GET /api/admin/users
// @desc   List all users with their application counts
// @access Admin
const getUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;

  const query = {};
  if (role && role !== 'all') query.role = role;

  if (search) {
    const term = String(search).trim();
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  // Attach each user's application count (1 query, grouped)
  const counts = await Subscription.aggregate([
    { $group: { _id: '$user', applications: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.applications]));

  const data = users.map((u) => ({
    ...u,
    applications: countMap[String(u._id)] || 0,
  }));

  res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data,
    meta: { total: data.length },
  });
});

// @route  GET /api/admin/users/:id
// @desc   View a single user with their applications
// @access Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password').lean();

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  await sweepExpiredSubscriptions();

  const applications = await Subscription.find({ user: user._id })
    .populate('membership', 'name price duration durationUnit category')
    .sort({ appliedAt: -1 });

  res.status(200).json({
    success: true,
    message: 'User fetched successfully',
    data: { ...user, applications },
  });
});

module.exports = { getUsers, getUserById };
