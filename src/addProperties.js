require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('./models/Property');
const User     = require('./models/User');

const URI = process.env.MONGO_URI;
if (!URI) { console.error('❌ MONGO_URI missing'); process.exit(1); }

// ── Images ────────────────────────────────────────────────────────
// Apartment images from your SwissTransfer link — use Unsplash as fallbacks
// Replace the Unsplash URLs below with your actual images once uploaded to Cloudinary

const PROPERTIES = [

  // ── 1. Apartment ─────────────────────────────────────────────────
  {
    name: 'The Summer Terrace',
    summary: 'Sun-drenched apartment with private pool, lush garden and high-speed WiFi — your relaxing urban retreat.',
    description: `Step into a world of calm at The Summer Terrace. This thoughtfully designed apartment blends comfort with luxury — a sparkling private pool, beautifully landscaped garden, and seamless WiFi make it the perfect base whether you're unwinding, working remotely, or entertaining guests.

The interiors are bright and airy with floor-to-ceiling windows that flood the living space with natural light. The kitchen is fully equipped, and the master bedroom opens onto a private terrace overlooking the garden.

Ideal for couples and small families who value both style and tranquility.`,
    location: { address: 'Rue de la Paix, Guéliz', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 95000,
    currency: 'MAD',
    discounts: [
      { label: 'Weekly', percentage: 15, minNights: 7 },
      { label: 'Monthly', percentage: 28, minNights: 30 },
    ],
    maxGuests:  4,
    bedrooms:   2,
    bathrooms:  2,
    amenities:  ['WiFi', 'Pool', 'Garden', 'Air Conditioning', 'Kitchen', 'TV', 'Parking', 'Security'],
    rules:      ['No smoking inside', 'No loud music after 10pm', 'Max 4 guests', 'No pets'],
    // Replace these with your actual image URLs from SwissTransfer/Cloudinary
    coverImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
    images: [
      { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200', caption: 'Pool & Garden' },
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', caption: 'Living Area' },
      { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200', caption: 'Master Bedroom' },
      { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200', caption: 'Kitchen' },
    ],
    isFeatured: true,
    isActive:   true,
    bookingLink: 'https://wa.me/212600000000',
  },

  // ── 2. Riad Shambala ──────────────────────────────────────────────
  {
    name: 'Riad Shambala',
    summary: 'An authentic Moroccan riad with a serene courtyard, plunge pool and artisan interiors — a true sanctuary.',
    description: `Riad Shambala is a masterpiece of Moroccan craftsmanship hidden behind a discreet doorway. Step through and discover an enchanting world of handcrafted zellige tilework, carved stucco archways, and a central courtyard where a plunge pool glitters under the open sky.

Each room tells a story — hand-painted ceilings, lantern light, Berber textiles. The rooftop terrace offers sweeping views over the medina and is perfect for sunset aperitifs.

The riad accommodates up to 8 guests and includes a daily breakfast prepared by our in-house chef. Private cooking classes and medina tours can be arranged on request.

Perfect for groups, families, and couples seeking an immersive cultural experience.`,
    location: { address: 'Medina', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 8500,
    currency: 'MAD',
    discounts: [
      { label: 'Weekly', percentage: 18, minNights: 7 },
    ],
    maxGuests:  8,
    bedrooms:   4,
    bathrooms:  4,
    amenities:  ['WiFi', 'Pool', 'Air Conditioning', 'Kitchen', 'TV', 'Security', 'Balcony'],
    rules:      ['No smoking inside', 'Respect local customs', 'No parties', 'Quiet hours after 11pm'],
    coverImage: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200',
    images: [
      { url: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200', caption: 'Courtyard' },
      { url: 'https://images.unsplash.com/photo-1582610285985-a42d9193f2fd?w=1200', caption: 'Suite' },
      { url: 'https://images.unsplash.com/photo-1617143207675-e7e6371f5f5d?w=1200', caption: 'Rooftop Terrace' },
      { url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=1200', caption: 'Plunge Pool' },
    ],
    isFeatured: true,
    isActive:   true,
    bookingLink: 'https://wa.me/212600000000',
  },

  // ── 3. Riad Al Baraka ─────────────────────────────────────────────
  {
    name: 'Riad Al Baraka',
    summary: 'A hidden jewel in the heart of the medina — intimate riad with a lush garden courtyard and rooftop views.',
    description: `Meaning "The Blessing" in Arabic, Riad Al Baraka lives up to its name. This intimate six-suite riad wraps around a fragrant courtyard filled with orange trees and jasmine, creating a living, breathing oasis of calm within the bustling medina.

The architecture is pure Moorish — horseshoe arches, geometric mosaic floors, hand-carved cedar ceilings. Each suite is uniquely decorated with antique Moroccan furniture and locally sourced textiles.

A candlelit rooftop restaurant serves authentic Moroccan cuisine prepared fresh each evening. Guests can arrange private hammam sessions, guided souq tours, and Atlas Mountain day trips through our concierge.

Ideal for those seeking an intimate, culturally rich stay with a maximum of 6 guests.`,
    location: { address: 'Bab Doukkala', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 6800,
    currency: 'MAD',
    discounts: [
      { label: 'Weekly', percentage: 15, minNights: 7 },
      { label: 'Long Stay', percentage: 25, minNights: 14 },
    ],
    maxGuests:  6,
    bedrooms:   3,
    bathrooms:  3,
    amenities:  ['WiFi', 'Garden', 'Air Conditioning', 'TV', 'Security', 'Balcony'],
    rules:      ['No smoking inside', 'Shoes off at entrance', 'Quiet hours after 10pm', 'Max 6 guests'],
    coverImage: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200',
    images: [
      { url: 'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=1200', caption: 'Garden Courtyard' },
      { url: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?w=1200', caption: 'Suite Interior' },
      { url: 'https://images.unsplash.com/photo-1602343168117-bb8ced3e3b0b?w=1200', caption: 'Rooftop Dining' },
      { url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200', caption: 'Detail — Zellige Tiles' },
    ],
    isFeatured: false,
    isActive:   true,
    bookingLink: 'https://wa.me/212600000000',
  },

  // ── 4. Villa Azur ─────────────────────────────────────────────────
  {
    name: 'Villa Azur',
    summary: 'Panoramic ocean-view villa with infinity pool, private chef services and sunset terraces — pure indulgence.',
    description: `Perched on a clifftop with uninterrupted views stretching to the horizon, Villa Azur is our most dramatic property. The name says it all — every room frames the azure expanse of the Atlantic in a different way, from the glass-walled living room to the infinity pool that appears to merge with the sea.

The villa is designed for effortless luxury. Five en-suite bedrooms, each with a private terrace. A chef's kitchen fully equipped for those who love to cook, or a private chef available on request. The landscaped garden includes an outdoor dining pavilion, a fire pit for starlit evenings, and a private path to a secluded cove below.

Facilities include a home cinema, wine cellar, and a wellness room with massage table. Airport transfers and daily housekeeping are included. Minimum 3-night stay.`,
    location: { address: 'Cap Spartel Road', city: 'Tangier', state: 'Tanger-Tetouan-Al Hoceima', country: 'Morocco' },
    pricePerNight: 18500,
    currency: 'MAD',
    discounts: [
      { label: 'Weekly', percentage: 12, minNights: 7 },
    ],
    maxGuests:  10,
    bedrooms:   5,
    bathrooms:  5,
    amenities:  ['WiFi', 'Pool', 'Sea View', 'Parking', 'Air Conditioning', 'Kitchen', 'TV', 'Balcony', 'Security', 'Gym'],
    rules:      ['No smoking inside', 'No events without prior approval', 'Min 3-night stay', 'Pets on request'],
    coverImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
    images: [
      { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200', caption: 'Infinity Pool & Ocean View' },
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200', caption: 'Villa Exterior' },
      { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6d1a2635?w=1200', caption: 'Master Suite' },
      { url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200', caption: 'Living Room' },
      { url: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=1200', caption: 'Outdoor Dining' },
    ],
    isFeatured: true,
    isActive:   true,
    bookingLink: 'https://wa.me/212600000000',
  },

  // ── 5. Villa Nour ─────────────────────────────────────────────────
  {
    name: 'Villa Nour',
    summary: 'A sun-filled Andalusian villa with private garden, heated pool and bespoke interiors — space and serenity combined.',
    description: `Nour — meaning "light" — and that is what defines this extraordinary villa. Flooded with natural light through its wide arched windows and open terraces, Villa Nour is a celebration of warmth, space, and timeless Andalusian style.

The ground floor unfolds into a series of interconnected living spaces — a formal sitting room with a fireplace, a casual family room, a dining room that seats 12, and a professional kitchen. Four bedrooms are arranged across two floors, each designed around comfort and privacy.

Outside, a heated pool sits within a walled garden bursting with bougainvillea and lavender. An outdoor kitchen and wood-fired grill make al fresco entertaining effortless. The villa's private hammam and steam room add a final touch of indulgence.

Located 15 minutes from the city centre with private parking for 4 vehicles. Housekeeping, gardening, and concierge services are all included.`,
    location: { address: 'Palmeraie', city: 'Marrakech', state: 'Marrakech-Safi', country: 'Morocco' },
    pricePerNight: 14200,
    currency: 'MAD',
    discounts: [
      { label: 'Weekly', percentage: 15, minNights: 7 },
      { label: 'Monthly', percentage: 25, minNights: 30 },
    ],
    maxGuests:  8,
    bedrooms:   4,
    bathrooms:  4,
    amenities:  ['WiFi', 'Pool', 'Garden', 'Parking', 'Air Conditioning', 'Kitchen', 'Washer', 'TV', 'Security', 'Gym'],
    rules:      ['No smoking inside', 'No shoes in bedrooms', 'Quiet hours after 11pm', 'Pets on request'],
    coverImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200',
    images: [
      { url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200', caption: 'Garden & Pool' },
      { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200', caption: 'Exterior' },
      { url: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200', caption: 'Living Space' },
      { url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200', caption: 'Master Bedroom' },
      { url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200', caption: 'Kitchen' },
    ],
    isFeatured: true,
    isActive:   true,
    bookingLink: 'https://wa.me/212600000000',
  },
];

async function run() {
  await mongoose.connect(URI);
  console.log('✅ Connected to MongoDB');

  const admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    console.error('❌ No admin user found — run seed.js first');
    process.exit(1);
  }

  let added = 0;
  let skipped = 0;

  for (const prop of PROPERTIES) {
    const exists = await Property.findOne({ name: prop.name });
    if (exists) {
      console.log(`⏭  Skipping (already exists): ${prop.name}`);
      skipped++;
      continue;
    }
    await Property.create({ ...prop, createdBy: admin._id });
    console.log(`✅ Added: ${prop.name}`);
    added++;
  }

  console.log(`\n🎉 Done — ${added} added, ${skipped} skipped`);
  console.log('\n📝 Note: Replace Unsplash image URLs with your actual photos from:');
  console.log('   https://www.swisstransfer.com/d/d9267182-20e2-4e6c-ad93-9d10847d9cd2');
  console.log('   Upload them to Cloudinary then update via Admin → Properties → Edit\n');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
