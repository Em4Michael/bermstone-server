const express = require('express');
const { body } = require('express-validator');
const {
  createBooking, getBookings, getBookingByRef,
  updateBookingStatus, adminCreateBooking, updatePayment,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', [
  body('property').notEmpty().withMessage('Property ID required'),
  body('checkIn').isISO8601().withMessage('Valid check-in date required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date required'),
  body('guests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
  body('guestInfo.firstName').notEmpty().withMessage('First name required'),
  body('guestInfo.lastName').notEmpty().withMessage('Last name required'),
  body('guestInfo.email').isEmail().withMessage('Valid email required'),
  body('guestInfo.phone').notEmpty().withMessage('Phone required'),
], createBooking);

router.get('/',               protect, getBookings);
router.get('/:ref',           getBookingByRef);
router.post('/admin',          protect, authorize('admin'), adminCreateBooking);
router.patch('/:id/status',   protect, authorize('admin'), updateBookingStatus);
router.patch('/:id/payment',  protect, authorize('admin'), updatePayment);

module.exports = router;
