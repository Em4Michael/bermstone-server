const Property = require('../models/Property');

// ── GET /api/properties ────────────────────────────────
exports.getProperties = async (req, res, next) => {
  try {
    const {
      city, minPrice, maxPrice, bedrooms,
      maxGuests, amenities, sortBy, featured,
      page = 1, limit = 12,
    } = req.query;

    const query = {};

    // Only filter by isActive if the field exists — avoids 500 if field missing in schema
    query.isActive = { $ne: false };

    if (city)     query['location.city'] = { $regex: city, $options: 'i' };
    if (featured) query.isFeatured       = featured === 'true';
    if (bedrooms) query.bedrooms         = { $gte: Number(bedrooms) };
    if (maxGuests) query.maxGuests       = { $gte: Number(maxGuests) };
    if (amenities) query.amenities       = { $all: amenities.split(',') };

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

    const pageNum  = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip     = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Property.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('❌ getProperties error:', err.message);
    next(err);
  }
};

// ── GET /api/properties/meta/cities ───────────────────
exports.getCities = async (_req, res, next) => {
  try {
    const cities = await Property.distinct('location.city', { isActive: { $ne: false } });
    res.json({ success: true, data: cities.filter(Boolean) });
  } catch (err) {
    console.error('❌ getCities error:', err.message);
    next(err);
  }
};

// ── GET /api/properties/:id ───────────────────────────
exports.getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id };

    const property = await Property.findOne(filter)
      .populate('createdBy', 'firstName lastName')
      .lean();

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (err) {
    console.error('❌ getProperty error:', err.message);
    next(err);
  }
};

// ── POST /api/properties  (admin) ─────────────────────
exports.createProperty = async (req, res, next) => {
  try {
    const property = await Property.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    console.error('❌ createProperty error:', err.message);
    next(err);
  }
};

// ── PUT /api/properties/:id  (admin) ──────────────────
exports.updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (err) {
    console.error('❌ updateProperty error:', err.message);
    next(err);
  }
};

// ── DELETE /api/properties/:id  (admin) ───────────────
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    console.error('❌ deleteProperty error:', err.message);
    next(err);
  }
};