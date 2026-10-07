const User = require('../models/User');
const Membership = require('../models/Membership');
const Subscription = require('../models/Subscription');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { sweepExpiredSubscriptions } = require('../utils/dateUtils');

// @route  GET /api/admin/dashboard/stats
// @desc   Real dashboard statistics aggregated from MongoDB
// @access Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  await sweepExpiredSubscriptions();

  const [
    totalUsers,
    totalMemberships,
    activeMembershipsCount,
    totalApplications,
    pendingApplications,
    activeMemberships,
    approvedApplications,
    rejectedApplications,
    expiredApplications,
    revenueAgg,
    statusAgg,
    topMemberships,
    recentApplications,
    newUsersThisMonth,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Membership.countDocuments({ isActive: true }),
    Membership.countDocuments(),
    Subscription.countDocuments(),
    Subscription.countDocuments({ status: 'pending' }),
    Subscription.countDocuments({ status: 'active' }),
    Subscription.countDocuments({ status: 'approved' }),
    Subscription.countDocuments({ status: 'rejected' }),
    Subscription.countDocuments({ status: 'expired' }),
    Subscription.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $lookup: {
          from: 'memberships',
          localField: 'membership',
          foreignField: '_id',
          as: 'membershipDoc',
        },
      },
      { $unwind: '$membershipDoc' },
      { $group: { _id: null, total: { $sum: '$membershipDoc.price' } } },
    ]),
    Subscription.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Subscription.aggregate([
      { $group: { _id: '$membership', applications: { $sum: 1 } } },
      { $sort: { applications: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'memberships',
          localField: '_id',
          foreignField: '_id',
          as: 'membershipDoc',
        },
      },
      { $unwind: { path: '$membershipDoc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          applications: 1,
          name: '$membershipDoc.name',
          price: '$membershipDoc.price',
        },
      },
    ]),
    Subscription.find()
      .populate('user', 'name email')
      .populate('membership', 'name price')
      .sort({ appliedAt: -1 })
      .limit(6),
    User.countDocuments({
      role: 'user',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Dashboard statistics fetched successfully',
    data: {
      totalUsers,
      totalMemberships: activeMembershipsCount,
      totalMembershipsAll: totalMemberships,
      totalApplications,
      pendingApplications,
      activeMemberships,
      approvedApplications,
      rejectedApplications,
      expiredApplications,
      revenue: revenueAgg[0] ? revenueAgg[0].total : 0,
      newUsersThisMonth,
      byStatus: statusAgg.map((s) => ({ status: s._id || 'unknown', count: s.count })),
      topMemberships,
      recentApplications,
    },
  });
});

module.exports = { getDashboardStats };
