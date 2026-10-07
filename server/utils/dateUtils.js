const Subscription = require('../models/Subscription');

/**
 * Add a duration to a date: e.g. addDuration(new Date(), 3, 'months')
 */
const addDuration = (date, amount, unit) => {
  const result = new Date(date);
  const value = Number(amount) || 0;

  switch (unit) {
    case 'days':
      result.setDate(result.getDate() + value);
      break;
    case 'weeks':
      result.setDate(result.getDate() + value * 7);
      break;
    case 'months':
      result.setMonth(result.getMonth() + value);
      break;
    case 'years':
      result.setFullYear(result.getFullYear() + value);
      break;
    default:
      result.setMonth(result.getMonth() + value);
  }

  return result;
};

/**
 * Mark all active subscriptions whose endDate has passed as expired.
 * Used instead of a background job (sufficient for this project).
 */
const sweepExpiredSubscriptions = async () => {
  try {
    const result = await Subscription.updateMany(
      { status: 'active', endDate: { $ne: null, $lt: new Date() } },
      { $set: { status: 'expired' } }
    );
    return result.modifiedCount;
  } catch (error) {
    console.error('[Subscription] Failed to expire memberships:', error.message);
    return 0;
  }
};

module.exports = { addDuration, sweepExpiredSubscriptions };
