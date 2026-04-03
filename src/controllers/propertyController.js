const Property = require('../models/Property');

// GET /api/properties
exports.getProperties = async (req, res, next) => {
  try {
    const {
      city, minPrice, maxPrice, bedrooms, maxGuests,
      amenities, sortBy, featured, search, page = 1, limit = 12,
      admin,
    } = req.query;

    // Admin view includes hidden properties; public view shows only active
    const query = admin === 'true' ? {} : { isActive: true };

    if (city)      query['location.city'] = { $regex: city, $options: 'i' };
    if (bedrooms)  query.bedrooms         = { $gte: Number(bedrooms) };
    if (maxGuests) query.maxGuests        = { $gte: Number(maxGuests) };
    if (amenities) query.amenities        = { $all: amenities.split(',').map(a => a.trim()).filter(Boolean) };
    if (featured !== undefined && featured !== '')
      query.isFeatured = featured === 'true';

    // Full-text search across name, summary, description, city
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: regex },
        { summary: regex },
        { 'location.city': regex },
        { 'location.address': regex },
      ];
    }

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
    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query).sort(sort).skip(skip).limit(Number(limit)).lean(),
      Property.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: {
        page: Number(page), limit: Number(limit), total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/properties/meta/cities
exports.getCities = async (_req, res, next) => {
  try {
    const cities = await Property.distinct('location.city', { isActive: true });
    res.json({ success: true, data: cities });
  } catch (err) { next(err); }
};

// GET /api/properties/:id
exports.getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const property = await Property.findOne(filter).populate('createdBy', 'firstName lastName');
    if (!property)
      return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, data: property });
  } catch (err) { next(err); }
};

// POST /api/properties  (admin)
exports.createProperty = async (req, res, next) => {
  try {
    const property = await Property.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: property });
  } catch (err) { next(err); }
};

// PUT /api/properties/:id  (admin)
exports.updateProperty = async (req, res, next) => {
  try {
    // Strip slug from update to avoid unique-constraint conflicts on re-save
    const { slug, ...updateData } = req.body;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    );
    if (!property)
      return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, data: property });
  } catch (err) { next(err); }
};

// DELETE /api/properties/:id  (admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property)
      return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) { next(err); }
};