const express = require('express');
const { body } = require('express-validator');
const {
  getReviews, createReview, deleteReview, togglePublish,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getReviews);

router.post('/', [
  body('property').notEmpty().withMessage('Property ID required'),
  body('reviewer.name').notEmpty().withMessage('Reviewer name required'),
  body('reviewer.email').isEmail().withMessage('Valid email required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1–5'),
  body('comment').isLength({ min: 10 }).withMessage('Comment must be at least 10 characters'),
], createReview);

router.delete('/:id',         protect, authorize('admin'), deleteReview);
router.patch('/:id/publish',  protect, authorize('admin'), togglePublish);

module.exports = router;
