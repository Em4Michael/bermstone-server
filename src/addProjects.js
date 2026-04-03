require('dotenv').config();
const mongoose   = require('mongoose');
const Investment = require('./models/Investment');
const User       = require('./models/User');

const URI = process.env.MONGO_URI;
if (!URI) { console.error('❌ MONGO_URI missing'); process.exit(1); }

const PROJECTS = [
  {
    name: 'Prime Location 3BR Renovation',
    summary: 'High-yield 3-bedroom house renovation in a prime location — fully funded.',
    description: 'A premium 3-bedroom house renovation in a prime location, targeting high rental yields post-renovation. The project is fully funded and nearing completion with 35% ROI for investors.',
    location: { address: 'Prime Location', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    totalAmount:       2750000,
    minimumInvestment: 100000,
    currentlyRaised:   2750000,
    currency: 'NGN',
    projectType: 'duplex',
    status: 'funded',
    projectPeriod: {
      startDate:      new Date('2024-01-01'),
      endDate:        new Date('2025-07-01'),
      durationMonths: 18,
    },
    expectedROI:  35,
    coverImage:   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    images:       [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200' }],
    isFeatured:   true,
    isActive:     true,
  },
  {
    name: 'Bab Khames 4BR Renovation',
    summary: 'Four-bedroom renovation in Bab Khames — 50% funded, strong ROI projected.',
    description: 'A 4-bedroom house renovation project in the sought-after Bab Khames area. Currently 50% funded with a target of ₦3,000,000. Expected to deliver 35% ROI within 9 months of completion.',
    location: { address: 'Bab Khames', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    totalAmount:       3000000,
    minimumInvestment: 150000,
    currentlyRaised:   1500000,
    currency: 'NGN',
    projectType: 'duplex',
    status: 'active',
    projectPeriod: {
      startDate:      new Date('2024-06-01'),
      endDate:        new Date('2025-03-01'),
      durationMonths: 9,
    },
    expectedROI:  35,
    coverImage:   'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200',
    images:       [{ url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200' }],
    isFeatured:   true,
    isActive:     true,
  },
  {
    name: 'Kasba 3BR Renovation',
    summary: 'Three-bedroom renovation in Kasba — 50% funded with the highest projected ROI.',
    description: 'A premium 3-bedroom house renovation in the Kasba area. 50% funded with a 24-month timeline. This project offers the highest ROI in the current portfolio at 45%, making it an exceptional investment opportunity.',
    location: { address: 'Kasba', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    totalAmount:       2000000,
    minimumInvestment: 100000,
    currentlyRaised:   1000000,
    currency: 'NGN',
    projectType: 'duplex',
    status: 'active',
    projectPeriod: {
      startDate:      new Date('2024-03-01'),
      endDate:        new Date('2026-03-01'),
      durationMonths: 24,
    },
    expectedROI:  45,
    coverImage:   'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    images:       [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200' }],
    isFeatured:   false,
    isActive:     true,
  },
];

async function run() {
  await mongoose.connect(URI);
  console.log('✅ Connected');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) { console.error('❌ No admin user found — run seed.js first'); process.exit(1); }

  let added = 0;
  for (const proj of PROJECTS) {
    const exists = await Investment.findOne({ name: proj.name });
    if (exists) { console.log(`⏭  Already exists: ${proj.name}`); continue; }
    await Investment.create({ ...proj, createdBy: admin._id });
    console.log(`✅ Added: ${proj.name}`);
    added++;
  }

  console.log(`\n🎉 Done — ${added} projects added`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
