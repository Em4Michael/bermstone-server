// src/seed.js
require('dotenv').config();   // Load environment variables FIRST

const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');
const Investment = require('./models/Investment');
const Review = require('./models/Review');

const URI = process.env.MONGO_URI;

if (!URI) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

const PROPERTIES = [
  {
    name: 'Skyline Executive Suite',
    summary: 'Breathtaking views from the 18th floor with all executive amenities.',
    description: 'Experience the pinnacle of Port Harcourt luxury in our flagship Skyline Executive Suite. Perched on the 18th floor with panoramic views of the city, this meticulously appointed two-bedroom suite is designed for discerning executives and travellers.',
    location: { address: '14 Aba Road, GRA Phase 2', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    pricePerNight: 85000,
    currency: 'NGN',
    discounts: [
      { label: 'Weekly', percentage: 15, minNights: 7 },
      { label: 'Monthly', percentage: 30, minNights: 30 }
    ],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Air Conditioning', 'TV', 'Balcony', 'Elevator', 'Security'],
    rules: ['No smoking inside', 'No pets', 'No loud music after 10pm', 'Max 4 guests'],
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', caption: 'Living Area' },
      { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', caption: 'Bedroom' },
    ],
    isFeatured: true,
    isActive: true,
    bookingLink: 'https://wa.me/2348000000000',
  },
  {
    name: 'Garden Villa Duplex',
    summary: 'Spacious family duplex surrounded by lush tropical gardens.',
    description: 'The Garden Villa Duplex is the perfect home-away-from-home for families and groups. Set within a landscaped estate, this four-bedroom duplex offers luxury living and tropical garden serenity.',
    location: { address: '3 Rumuola Drive', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    pricePerNight: 120000,
    currency: 'NGN',
    discounts: [{ label: 'Weekly', percentage: 20, minNights: 7 }],
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 3,
    amenities: ['WiFi', 'Garden', 'Parking', 'Air Conditioning', 'TV', 'Kitchen', 'Washer', 'Generator', 'Security'],
    rules: ['No smoking indoors', 'Pets with prior approval', 'No events without consent'],
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200' }],
    isFeatured: true,
    isActive: true,
    bookingLink: 'https://wa.me/2348000000000',
  },
  {
    name: 'Ocean View Studio',
    summary: 'Chic modern studio with uninterrupted waterfront views.',
    description: 'Compact, chic, and absolutely stunning. Floor-to-ceiling windows frame breathtaking views of the waterfront. Perfect for solo travellers or couples.',
    location: { address: '7 Marine Base Road', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    pricePerNight: 55000,
    currency: 'NGN',
    discounts: [],
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['WiFi', 'Sea View', 'Air Conditioning', 'TV', 'Kitchen'],
    rules: ['No smoking', 'No pets', 'Max 2 guests'],
    coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200' }],
    isFeatured: false,
    isActive: true,
    bookingLink: 'https://wa.me/2348000000000',
  },
  {
    name: 'The Penthouse at Meridian',
    summary: 'Full-floor luxury penthouse with private rooftop terrace.',
    description: 'Our crown jewel — a full-floor sky residence with private rooftop terrace, plunge pool, and al fresco dining. Dedicated concierge and private lift access.',
    location: { address: '22 Woji Road, GRA Phase 3', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    pricePerNight: 250000,
    currency: 'NGN',
    discounts: [{ label: 'Extended Stay', percentage: 25, minNights: 7 }],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 4,
    amenities: ['WiFi', 'Pool', 'Gym', 'Parking', 'Air Conditioning', 'TV', 'Balcony', 'Elevator', 'Security', 'Kitchen', 'Washer'],
    rules: ['No smoking', 'No pets', 'No events without written approval'],
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200' }],
    isFeatured: true,
    isActive: true,
    bookingLink: 'https://wa.me/2348000000000',
  },
  {
    name: 'Corporate Flat — Trans-Amadi',
    summary: 'Practical furnished corporate flat in the business hub.',
    description: 'Built for the business traveller. Located minutes from the Trans-Amadi industrial district. Reliable WiFi, generator, secure parking.',
    location: { address: '8 Oil Mill Road, Trans-Amadi', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    pricePerNight: 35000,
    currency: 'NGN',
    discounts: [
      { label: 'Weekly', percentage: 10, minNights: 7 },
      { label: 'Monthly', percentage: 25, minNights: 30 }
    ],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ['WiFi', 'Parking', 'Air Conditioning', 'TV', 'Kitchen', 'Generator', 'Security'],
    rules: ['No smoking', 'No pets', 'Quiet hours 10pm–7am'],
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200' }],
    isFeatured: false,
    isActive: true,
    bookingLink: 'https://wa.me/2348000000000',
  },
];

const INVESTMENTS = [
  {
    name: 'Harbour View Towers',
    summary: 'A 24-storey mixed-use skyscraper at the heart of GRA.',
    description: "Bermstone's most ambitious project — a 24-storey mixed-use skyscraper with residential, office, retail, and sky-lounge floors. 70% funded, construction underway.",
    location: { address: 'Plot 7 Forces Avenue, GRA Phase 2', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    totalAmount: 2000000000,
    minimumInvestment: 5000000,
    currentlyRaised: 1400000000,
    currency: 'NGN',
    projectType: 'skyscraper',
    status: 'active',
    projectPeriod: { startDate: new Date('2024-01-01'), endDate: new Date('2027-12-31'), durationMonths: 48 },
    expectedROI: 28,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200' }],
    isFeatured: true,
    isActive: true,
  },
  // ... (keep all your other 3 investment objects exactly as before)
  {
    name: 'Palm Court Residences',
    summary: 'Boutique luxury duplex complex targeting high-end rental returns.',
    description: '16 luxury duplexes in a gated estate in Rumuola. Shared pool, gym, 24-hour security. Targeting 90%+ occupancy from day one.',
    location: { address: 'Rumuola New Layout', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    totalAmount: 500000000,
    minimumInvestment: 2000000,
    currentlyRaised: 200000000,
    currency: 'NGN',
    projectType: 'duplex',
    status: 'upcoming',
    projectPeriod: { startDate: new Date('2025-04-01'), endDate: new Date('2026-10-01'), durationMonths: 18 },
    expectedROI: 22,
    coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200' }],
    isFeatured: false,
    isActive: true,
  },
  {
    name: 'The Meridian Hotel',
    summary: '4-star business hotel now generating consistent investor returns.',
    description: 'Completed 80-room 4-star hotel in Trans-Amadi. Opened Q1 2023, averaging 82% occupancy. Shown as a track-record reference project.',
    location: { address: '14 Trans-Amadi Industrial Layout', city: 'Port Harcourt', state: 'Rivers State', country: 'Nigeria' },
    totalAmount: 3500000000,
    minimumInvestment: 10000000,
    currentlyRaised: 3500000000,
    currency: 'NGN',
    projectType: 'hotel',
    status: 'completed',
    projectPeriod: { startDate: new Date('2020-06-01'), endDate: new Date('2023-01-01'), durationMonths: 32 },
    expectedROI: 35,
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200' }],
    isFeatured: true,
    isActive: true,
  },
  {
    name: 'Sapphire Court Flats',
    summary: '32-unit apartment complex targeting the middle-class rental market.',
    description: '32 modern 2 and 3-bedroom flats in Eleme for oil & gas workers. Chronic undersupply in area — vacancy below 5% for comparable properties.',
    location: { address: 'Alode Layout, Eleme', city: 'Eleme', state: 'Rivers State', country: 'Nigeria' },
    totalAmount: 800000000,
    minimumInvestment: 3000000,
    currentlyRaised: 320000000,
    currency: 'NGN',
    projectType: 'residential_complex',
    status: 'active',
    projectPeriod: { startDate: new Date('2025-01-01'), endDate: new Date('2027-01-01'), durationMonths: 24 },
    expectedROI: 20,
    coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200' }],
    isFeatured: false,
    isActive: true,
  },
];

const REVIEWS = [
  { name: 'Chukwuemeka Obi', country: 'Nigeria', rating: 5, comment: 'Absolutely outstanding — the views, the finish, and the concierge service were all impeccable. Will not stay anywhere else in PH.', propIdx: 0 },
  { name: 'Sarah Mitchell', country: 'UK', rating: 5, comment: 'I visit Port Harcourt quarterly and exclusively book Bermstone. Consistently exceptional quality.', propIdx: 0 },
  { name: 'Adaeze Nwosu', country: 'Nigeria', rating: 5, comment: 'Perfect for families. Kids loved the garden, great space for everyone, well-stocked kitchen.', propIdx: 1 },
  { name: 'James Okafor', country: 'Nigeria', rating: 5, comment: 'Brought important clients — they said it was better than some 5-star hotels internationally.', propIdx: 3 },
  { name: 'Emmanuel Wachuku', country: 'Nigeria', rating: 4, comment: 'Great value for a month-long work assignment. Clean, practical, great WiFi, no power disruptions.', propIdx: 4 },
  { name: 'Dr. Amaka Eze', country: 'Nigeria', rating: 5, comment: 'Most professional shortlet operator in Nigeria. The Ocean View Studio is small but perfectly formed.', propIdx: 2 },
];

async function seed() {
  console.log('\n🌱 Starting Bermstone Database Seeding...\n');

  try {
    await mongoose.connect(URI);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Property.deleteMany({}),
      Investment.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing collections');

    // Create Admin User
    const admin = await User.create({
      firstName: 'Bermstone',
      lastName: 'Admin',
      email: 'admin@bermstone.com',
      password: 'Admin1234!',
      role: 'admin',
      isVerified: true,
    });
    console.log(`👤 Admin user created: ${admin.email}`);

    // Create Properties
    const properties = await Property.insertMany(
      PROPERTIES.map(p => ({ ...p, createdBy: admin._id }))
    );
    console.log(`🏠 ${properties.length} properties seeded`);

    // Create Investments
    const investments = await Investment.insertMany(
      INVESTMENTS.map(i => ({ ...i, createdBy: admin._id }))
    );
    console.log(`📈 ${investments.length} investments seeded`);

    // Add similar projects references
    await Investment.findByIdAndUpdate(investments[0]._id, {
      similarProjects: [investments[1]._id, investments[2]._id],
    });
    await Investment.findByIdAndUpdate(investments[1]._id, {
      similarProjects: [investments[0]._id, investments[3]._id],
    });
    console.log('🔗 Similar projects linked');

    // Create Reviews
    const reviewData = REVIEWS.map((r, index) => ({
      property: properties[r.propIdx]._id,
      reviewer: {
        name: r.name,
        email: `${r.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
        country: r.country,
      },
      rating: r.rating,
      comment: r.comment,
      categories: {
        cleanliness: r.rating,
        location: r.rating,
        value: r.rating,
        communication: 5,
        accuracy: r.rating,
      },
      isVerified: true,
      isPublished: true,
    }));

    const reviews = await Review.insertMany(reviewData);
    console.log(`⭐ ${reviews.length} reviews seeded`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Admin Login →  admin@bermstone.com  |  Admin1234!`);
    console.log(`🌐 Your API is running on port ${process.env.PORT || 5000}\n`);

  } catch (error) {
    console.error('❌ Seeding Error:', error.message);
    if (error.code === 11000) {
      console.error('   → Duplicate key error (likely email already exists)');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();