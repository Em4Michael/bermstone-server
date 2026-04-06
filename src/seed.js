const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose   = require('mongoose');
const User       = require('./models/User');
const Property   = require('./models/Property');
const Investment = require('./models/Investment');
const Review     = require('./models/Review');

const URI = process.env.MONGODB_URI || 'mongodb+srv://aniehegc:nZ8whhzfYW3TCzU0@bermstone.mxqhkcb.mongodb.net/';

const PROPERTIES = [
  {
    name: 'Skyline Executive Suite', summary: 'Breathtaking views from the 18th floor with all executive amenities.',
    description: 'Experience the pinnacle of Marrakech luxury in our flagship Skyline Executive Suite. Perched on the 18th floor with panoramic views of the city, this meticulously appointed two-bedroom suite is designed for discerning executives and travellers.',
    location: { address: 'Rue de la Liberté, Guéliz', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 85000, currency: 'MAD',
    discounts: [{ label: 'Weekly', percentage: 15, minNights: 7 }, { label: 'Monthly', percentage: 30, minNights: 30 }],
    maxGuests: 4, bedrooms: 2, bathrooms: 2,
    amenities: ['WiFi','Pool','Gym','Parking','Air Conditioning','TV','Balcony','Elevator','Security'],
    rules: ['No smoking inside', 'No pets', 'No loud music after 10pm', 'Max 4 guests'],
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200',
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', caption: 'Living Area' },
      { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', caption: 'Bedroom' },
    ],
    isFeatured: true, isActive: true, bookingLink: 'https://wa.me/212600000000',
  },
  {
    name: 'Garden Villa Duplex', summary: 'Spacious family duplex surrounded by lush tropical gardens.',
    description: 'The Garden Villa Duplex is the perfect home-away-from-home for families and groups. Set within a landscaped estate, this four-bedroom duplex offers luxury living and tropical garden serenity.',
    location: { address: 'Avenue Mohammed V, Hivernage', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 120000, currency: 'MAD',
    discounts: [{ label: 'Weekly', percentage: 20, minNights: 7 }],
    maxGuests: 8, bedrooms: 4, bathrooms: 3,
    amenities: ['WiFi','Garden','Parking','Air Conditioning','TV','Kitchen','Washer','Generator','Security'],
    rules: ['No smoking indoors', 'Pets with prior approval', 'No events without consent'],
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200' }],
    isFeatured: true, isActive: true, bookingLink: 'https://wa.me/212600000000',
  },
  {
    name: 'Ocean View Studio', summary: 'Chic modern studio with uninterrupted waterfront views.',
    description: 'Compact, chic, and absolutely stunning. Floor-to-ceiling windows frame breathtaking views of the waterfront. Perfect for solo travellers or couples.',
    location: { address: 'Rue Bab Agnaw, Medina', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 55000, currency: 'MAD', discounts: [],
    maxGuests: 2, bedrooms: 1, bathrooms: 1,
    amenities: ['WiFi','Sea View','Air Conditioning','TV','Kitchen'],
    rules: ['No smoking', 'No pets', 'Max 2 guests'],
    coverImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200' }],
    isFeatured: false, isActive: true, bookingLink: 'https://wa.me/212600000000',
  },
  {
    name: 'The Penthouse at Meridian', summary: 'Full-floor luxury penthouse with private rooftop terrace.',
    description: 'Our crown jewel — a full-floor sky residence with private rooftop terrace, plunge pool, and al fresco dining. Dedicated concierge and private lift access.',
    location: { address: 'Boulevard Zerktouni, Guéliz', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 250000, currency: 'MAD',
    discounts: [{ label: 'Extended Stay', percentage: 25, minNights: 7 }],
    maxGuests: 6, bedrooms: 3, bathrooms: 4,
    amenities: ['WiFi','Pool','Gym','Parking','Air Conditioning','TV','Balcony','Elevator','Security','Kitchen','Washer'],
    rules: ['No smoking', 'No pets', 'No events without written approval'],
    coverImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200' }],
    isFeatured: true, isActive: true, bookingLink: 'https://wa.me/212600000000',
  },
  {
    name: 'Corporate Flat — Trans-Amadi', summary: 'Practical furnished corporate flat in the business hub.',
    description: 'Built for the business traveller. Located minutes from the Trans-Amadi industrial district. Reliable WiFi, generator, secure parking.',
    location: { address: 'Rue Mouassine, Medina', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 35000, currency: 'MAD',
    discounts: [{ label: 'Weekly', percentage: 10, minNights: 7 }, { label: 'Monthly', percentage: 25, minNights: 30 }],
    maxGuests: 4, bedrooms: 2, bathrooms: 1,
    amenities: ['WiFi','Parking','Air Conditioning','TV','Kitchen','Generator','Security'],
    rules: ['No smoking', 'No pets', 'Quiet hours 10pm–7am'],
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200' }],
    isFeatured: false, isActive: true, bookingLink: 'https://wa.me/212600000000',
  },
];

const INVESTMENTS = [
  {
    name: 'Harbour View Towers', summary: 'A 24-storey mixed-use skyscraper at the heart of GRA.',
    description: 'Bermstone\'s most ambitious project — a 24-storey mixed-use skyscraper with residential, office, retail, and sky-lounge floors. 70% funded, construction underway.',
    location: { address: 'Avenue Hassan II, Guéliz', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    totalAmount: 2000000000, minimumInvestment: 5000000, currentlyRaised: 1400000000,
    currency: 'MAD', projectType: 'skyscraper', status: 'active',
    projectPeriod: { startDate: new Date('2024-01-01'), endDate: new Date('2027-12-31'), durationMonths: 48 },
    expectedROI: 28, coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200' }],
    isFeatured: true, isActive: true,
  },
  {
    name: 'Palm Court Residences', summary: 'Boutique luxury duplex complex targeting high-end rental returns.',
    description: '16 luxury duplexes in a gated estate in Rumuola. Shared pool, gym, 24-hour security. Targeting 90%+ occupancy from day one.',
    location: { address: 'Palmeraie District', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    totalAmount: 500000000, minimumInvestment: 2000000, currentlyRaised: 200000000,
    currency: 'MAD', projectType: 'duplex', status: 'upcoming',
    projectPeriod: { startDate: new Date('2025-04-01'), endDate: new Date('2026-10-01'), durationMonths: 18 },
    expectedROI: 22, coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200' }],
    isFeatured: false, isActive: true,
  },
  {
    name: 'The Meridian Hotel', summary: '4-star business hotel now generating consistent investor returns.',
    description: 'Completed 80-room 4-star hotel in Trans-Amadi. Opened Q1 2023, averaging 82% occupancy. Shown as a track-record reference project.',
    location: { address: 'Zone Industrielle Sidi Ghanem', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    totalAmount: 3500000000, minimumInvestment: 10000000, currentlyRaised: 3500000000,
    currency: 'MAD', projectType: 'hotel', status: 'completed',
    projectPeriod: { startDate: new Date('2020-06-01'), endDate: new Date('2023-01-01'), durationMonths: 32 },
    expectedROI: 35, coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200' }],
    isFeatured: true, isActive: true,
  },
  {
    name: 'Sapphire Court Flats', summary: '32-unit apartment complex targeting the middle-class rental market.',
    description: '32 modern 2 and 3-bedroom flats in Essaouira for oil & gas workers. Chronic undersupply in area — vacancy below 5% for comparable properties.',
    location: { address: 'Alode Layout, Essaouira', city: 'Essaouira', state: 'Marrakech-Safi', country: 'Morocco' },
    totalAmount: 800000000, minimumInvestment: 3000000, currentlyRaised: 320000000,
    currency: 'MAD', projectType: 'residential_complex', status: 'active',
    projectPeriod: { startDate: new Date('2025-01-01'), endDate: new Date('2027-01-01'), durationMonths: 24 },
    expectedROI: 20, coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
    images: [{ url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200' }],
    isFeatured: false, isActive: true,
  },
];

async function seed() {
  console.log('\n🌱 Seeding Bermstone database...\n');
  await mongoose.connect(URI);
  console.log('✅ Connected\n');

  await Promise.all([User.deleteMany({}), Property.deleteMany({}), Investment.deleteMany({}), Review.deleteMany({})]);
  console.log('🗑️  Cleared existing data');

  const admin = await User.create({
    firstName: 'Bermstone', lastName: 'Admin',
    email: 'admin@bermstone.com', password: 'Admin1234!',
    role: 'admin', isVerified: true,
  });
  console.log(`👤 Admin: ${admin.email}`);

  const props = await Property.create(PROPERTIES.map(p => ({ ...p, createdBy: admin._id })));
  console.log(`🏠 ${props.length} properties`);

  const invs = await Investment.create(INVESTMENTS.map(i => ({ ...i, createdBy: admin._id })));
  await Investment.findByIdAndUpdate(invs[0]._id, { similarProjects: [invs[1]._id, invs[2]._id] });
  await Investment.findByIdAndUpdate(invs[1]._id, { similarProjects: [invs[0]._id, invs[3]._id] });
  console.log(`📈 ${invs.length} investments`);

  const REVIEWS = [
    { name: 'Chukwuemeka Obi', country: 'Morocco', rating: 5, comment: 'Absolutely outstanding — the views, the finish, and the concierge service were all impeccable. Will not stay anywhere else in PH.', propIdx: 0 },
    { name: 'Sarah Mitchell',   country: 'UK',      rating: 5, comment: 'I visit Marrakech quarterly and exclusively book Bermstone. Consistently exceptional quality.', propIdx: 0 },
    { name: 'Adaeze Nwosu',     country: 'Morocco', rating: 5, comment: 'Perfect for families. Kids loved the garden, great space for everyone, well-stocked kitchen.', propIdx: 1 },
    { name: 'James Okafor',     country: 'Morocco', rating: 5, comment: 'Brought important clients — they said it was better than some 5-star hotels internationally.', propIdx: 3 },
    { name: 'Emmanuel Wachuku', country: 'Morocco', rating: 4, comment: 'Great value for a month-long work assignment. Clean, practical, great WiFi, no power disruptions.', propIdx: 4 },
    { name: 'Dr. Amaka Eze',    country: 'Morocco', rating: 5, comment: 'Most professional keyneet operator in Morocco. The Ocean View Studio is small but perfectly formed.', propIdx: 2 },
  ];
  const reviews = await Review.create(REVIEWS.map(r => ({
    property: props[r.propIdx]._id,
    reviewer: { name: r.name, email: `${r.name.split(' ')[0].toLowerCase()}@example.com`, country: r.country },
    rating: r.rating, comment: r.comment,
    categories: { cleanliness: r.rating, location: r.rating, value: r.rating, communication: 5, accuracy: r.rating },
    isVerified: true, isPublished: true,
  })));
  console.log(`⭐ ${reviews.length} reviews`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Seed complete!\n');
  console.log('Admin →  admin@bermstone.com  /  Admin1234!\n');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('❌', err.message); process.exit(1); });

// Run this separately to add the 3 Moroccan projects:
// node src/addMoroccanProjects.js
