const express = require('express');
const { body } = require('express-validator');
const {
  createInquiry, getInquiries, getInquiry, updateInquiry,
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', [
  body('type').isIn(['owner_listing', 'investor', 'general_contact']).withMessage('Invalid inquiry type'),
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').optional({ checkFalsy: true }),
  body('message').trim().isLength({ min: 5 }).withMessage('Message must be at least 5 characters'),
], createInquiry);

router.get('/',    protect, authorize('admin'), getInquiries);
router.get('/:id', protect, authorize('admin'), getInquiry);
router.patch('/:id', protect, authorize('admin'), updateInquiry);

module.exports = router;
