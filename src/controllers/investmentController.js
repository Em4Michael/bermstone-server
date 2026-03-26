const Investment = require('../models/Investment');

// ── GET /api/investments ───────────────────────────────
exports.getInvestments = async (req, res, next) => {
  try {
    const { status, projectType, featured, page = 1, limit = 9 } = req.query;

    const query = { isActive: { $ne: false } };

    if (status)      query.status      = status;
    if (projectType) query.projectType = projectType;
    if (featured)    query.isFeatured  = featured === 'true';

    const pageNum  = Math.max(Number(page), 1);
    const limitNum = Math.min(Math.max(Number(limit), 1), 100);
    const skip     = (pageNum - 1) * limitNum;

    const [investments, total] = await Promise.all([
      Investment.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Investment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: investments,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error('❌ getInvestments error:', err.message);
    next(err);
  }
};

// ── GET /api/investments/:id ──────────────────────────
exports.getInvestment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { slug: id };

    const investment = await Investment.findOne(filter)
      .populate('similarProjects', 'name slug coverImage location status minimumInvestment')
      .lean();

    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }
    res.json({ success: true, data: investment });
  } catch (err) {
    console.error('❌ getInvestment error:', err.message);
    next(err);
  }
};

// ── POST /api/investments  (admin) ────────────────────
exports.createInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: investment });
  } catch (err) {
    console.error('❌ createInvestment error:', err.message);
    next(err);
  }
};

// ── PUT /api/investments/:id  (admin) ─────────────────
exports.updateInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findByIdAndUpdate(
      req.params.id, req.body, { new: true, runValidators: true }
    );
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }
    res.json({ success: true, data: investment });
  } catch (err) {
    console.error('❌ updateInvestment error:', err.message);
    next(err);
  }
};

// ── DELETE /api/investments/:id  (admin) ──────────────
exports.deleteInvestment = async (req, res, next) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    if (!investment) {
      return res.status(404).json({ success: false, message: 'Investment not found' });
    }
    res.json({ success: true, message: 'Investment deleted' });
  } catch (err) {
    console.error('❌ deleteInvestment error:', err.message);
    next(err);
  }
};