const { validationResult } = require('express-validator');
const Review = require('../models/Review');

// GET /api/reviews
exports.getReviews = async (req, res, next) => {
  try {
    const { property, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };
    if (property) query.property = property;

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Review.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) { next(err); }
};

// POST /api/reviews
exports.createReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
  } catch (err) { next(err); }
};

// DELETE /api/reviews/:id  (admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review)
      return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) { next(err); }
};

// PATCH /api/reviews/:id/publish  (admin)
exports.togglePublish = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ success: false, message: 'Review not found' });
    review.isPublished = !review.isPublished;
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) { next(err); }
};
