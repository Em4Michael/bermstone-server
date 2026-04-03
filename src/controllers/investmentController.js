const Investment = require('../models/Investment');

// GET /api/investments
exports.getInvestments = async (req, res, next) => {
  try {
    const { status, projectType, featured, search, page = 1, limit = 9, admin } = req.query;

    const query = admin === 'true' ? {} : { isActive: true };

    if (status)      query.status      = status;
    if (projectType) query.projectType = projectType;
    if (featured !== undefined && featured !== '')
      query.isFeatured = featured === 'true';
    if (search) {
      const regex = { $regex: search, $options: 'i' };
      query.$or = [
        { name: regex },
        { summary: regex },
        { 'location.city': regex },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [investments, total] = await Promise.all([
      Investment.find(query)
        .populate('similarProjects', 'name coverImage location expectedROI status totalAmount minimumInvestment currency projectType')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Investment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: investments,
      pagination: {
        page: Number(page), limit: Number(limit), total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/investments/:id
exports.getInvestment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const investment = await Investment.findOne(filter)
      .populate('similarProjects', 'name coverImage location expectedROI status totalAmount minimumInvestment currency projectType');
    if (!investment)
      return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, data: investment });
  } catch (err) { next(err); }
};

// POST /api/investments  (admin)
exports.createInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: investment });
  } catch (err) { next(err); }
};

// PUT /api/investments/:id  (admin)
exports.updateInvestment = async (req, res, next) => {
  try {
    const { slug, ...updateData } = req.body;
    const investment = await Investment.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    );
    if (!investment)
      return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, data: investment });
  } catch (err) { next(err); }
};

// DELETE /api/investments/:id  (admin)
exports.deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    if (!investment)
      return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, message: 'Investment deleted' });
  } catch (err) { next(err); }
};