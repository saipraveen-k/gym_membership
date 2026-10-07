require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Membership = require('../models/Membership');

// Sample membership packages (only inserted when the collection is empty)
const SAMPLE_MEMBERSHIPS = [
  {
    name: 'Basic Membership',
    description:
      'A simple plan for beginners who want regular access to the gym floor and basic equipment.',
    duration: 1,
    durationUnit: 'months',
    price: 999,
    category: 'Basic',
    isActive: true,
    features: ['Gym Floor Access', 'Locker Room', 'Cardio Equipment', 'Free Weights'],
  },
  {
    name: 'Premium Membership',
    description:
      'Complete access to all gym facilities with personal training sessions every month.',
    duration: 3,
    durationUnit: 'months',
    price: 4999,
    category: 'Premium',
    isActive: true,
    features: [
      'Unlimited Gym Access',
      'Personal Trainer',
      'Cardio Area',
      'Weight Training',
      'Group Classes',
    ],
  },
  {
    name: 'Gold Membership',
    description:
      'Our flagship plan with premium equipment, personal training, sauna and priority class booking.',
    duration: 6,
    durationUnit: 'months',
    price: 8999,
    category: 'Gold',
    isActive: true,
    features: [
      'Unlimited Gym Access',
      'Personal Trainer (4 sessions/month)',
      'Sauna & Steam Room',
      'Priority Class Booking',
      'Nutrition Consultation',
      'Guest Pass (2 per month)',
    ],
  },
  {
    name: 'Annual Membership',
    description:
      'Best value for committed members - full access for a whole year with two months free.',
    duration: 12,
    durationUnit: 'months',
    price: 17999,
    category: 'Annual',
    isActive: true,
    features: [
      'Unlimited Gym Access',
      'All Group Classes',
      'Personal Trainer (2 sessions/month)',
      'Free Body Composition Analysis',
      'Two Months Free vs Monthly Billing',
    ],
  },
  {
    name: 'Student Membership',
    description:
      'Discounted plan for students with a valid college ID. Great facilities at an affordable price.',
    duration: 3,
    durationUnit: 'months',
    price: 2499,
    category: 'Student',
    isActive: true,
    features: [
      'Gym Floor Access',
      'Cardio Area',
      'Group Classes',
      'Valid College ID Required',
    ],
  },
];

const seedMemberships = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    const count = await Membership.countDocuments();

    if (count > 0) {
      console.log(
        `Memberships already exist (${count} found). Sample data not inserted to avoid duplicates.`
      );
    } else {
      await Membership.insertMany(SAMPLE_MEMBERSHIPS);
      console.log(`${SAMPLE_MEMBERSHIPS.length} sample memberships inserted:`);
      SAMPLE_MEMBERSHIPS.forEach((m) =>
        console.log(`  - ${m.name} | ${m.category} | Rs.${m.price} / ${m.duration} ${m.durationUnit}`)
      );
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed memberships:');
    console.error(`  ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch (_) {
      /* ignore */
    }
    process.exit(1);
  }
};

seedMemberships();
