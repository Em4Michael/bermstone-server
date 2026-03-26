const express  = require('express');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/properties
router.get('/', async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice, bedrooms, maxGuests, amenities, sortBy, featured, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (city)      query['location.city'] = { $regex: city, $options: 'i' };
    if (featured)  query.isFeatured = featured === 'true';
    if (bedrooms)  query.bedrooms   = { $gte: Number(bedrooms) };
    if (maxGuests) query.maxGuests  = { $gte: Number(maxGuests) };
    if (amenities) query.amenities  = { $all: amenities.split(',') };
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    const sortMap = {
      price_asc:   { pricePerNight: 1 },
      price_desc:  { pricePerNight: -1 },
      rating_desc: { averageRating: -1 },
      newest:      { createdAt: -1 },
    };
    const sort = sortMap[sortBy] || { isFeatured: -1, createdAt: -1 };

    const skip  = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
      Property.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Property.countDocuments(query),
    ]);

    res.json({ success: true, data: properties, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
});

// GET /api/properties/meta/cities
router.get('/meta/cities', async (_req, res, next) => {
  try {
    const cities = await Property.distinct('location.city', { isActive: true });
    res.json({ success: true, data: cities });
  } catch (err) { next(err); }
});

// GET /api/properties/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const property = await Property.findOne(filter).populate('createdBy', 'firstName lastName');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, data: property });
  } catch (err) { next(err); }
});

// POST /api/properties  (admin)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const property = await Property.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: property });
  } catch (err) { next(err); }
});

// PUT /api/properties/:id  (admin)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, data: property });
  } catch (err) { next(err); }
});

// DELETE /api/properties/:id  (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
