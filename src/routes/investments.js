const express    = require('express');
const Investment = require('../models/Investment');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/investments
router.get('/', async (req, res, next) => {
  try {
    const { status, projectType, featured, page = 1, limit = 9 } = req.query;
    const query = { isActive: true };
    if (status)      query.status      = status;
    if (projectType) query.projectType = projectType;
    if (featured)    query.isFeatured  = featured === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [investments, total] = await Promise.all([
      Investment.find(query).sort({ isFeatured: -1, createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      Investment.countDocuments(query),
    ]);
    res.json({ success: true, data: investments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) { next(err); }
});

// GET /api/investments/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const filter = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    const investment = await Investment.findOne(filter).populate('similarProjects', 'name slug coverImage location status minimumInvestment');
    if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, data: investment });
  } catch (err) { next(err); }
});

// POST /api/investments  (admin)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const investment = await Investment.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: investment });
  } catch (err) { next(err); }
});

// PUT /api/investments/:id  (admin)
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const investment = await Investment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, data: investment });
  } catch (err) { next(err); }
});

// DELETE /api/investments/:id  (admin)
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    if (!investment) return res.status(404).json({ success: false, message: 'Investment not found' });
    res.json({ success: true, message: 'Investment deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
