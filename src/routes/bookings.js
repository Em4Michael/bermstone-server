const express  = require('express');
const { body, validationResult } = require('express-validator');
const Booking  = require('../models/Booking');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings
router.post('/',
  [
    body('property').notEmpty(),
    body('checkIn').isISO8601(),
    body('checkOut').isISO8601(),
    body('guests').isInt({ min: 1 }),
    body('guestInfo.firstName').notEmpty(),
    body('guestInfo.lastName').notEmpty(),
    body('guestInfo.email').isEmail(),
    body('guestInfo.phone').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const { property: propId, checkIn, checkOut, guests, guestInfo, specialRequests } = req.body;
      const property = await Property.findById(propId);
      if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

      const inDate  = new Date(checkIn);
      const outDate = new Date(checkOut);
      if (inDate >= outDate) return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
      if (guests > property.maxGuests) return res.status(400).json({ success: false, message: `Max guests is ${property.maxGuests}` });

      const nights   = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
      const subtotal = property.pricePerNight * nights;
      const applicable = (property.discounts || []).filter(d => nights >= d.minNights);
      let discountAmount = 0;
      if (applicable.length) {
        const best = applicable.reduce((a, b) => a.percentage > b.percentage ? a : b);
        discountAmount = (subtotal * best.percentage) / 100;
      }

      const booking = await Booking.create({
        property: propId, guestInfo, checkIn: inDate, checkOut: outDate, guests, nights,
        pricePerNight: property.pricePerNight, subtotal, discountAmount,
        totalAmount: subtotal - discountAmount, currency: property.currency,
        specialRequests, externalBookingLink: property.bookingLink,
      });
      res.status(201).json({ success: true, data: booking });
    } catch (err) { next(err); }
  }
);

// GET /api/bookings  (admin gets all, user gets own)
router.get('/', protect, async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { 'guestInfo.email': req.user.email };
    const bookings = await Booking.find(query).populate('property', 'name coverImage location').sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
});

// GET /api/bookings/:ref
router.get('/:ref', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.ref }).populate('property', 'name coverImage location pricePerNight');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
});

// PATCH /api/bookings/:id/status  (admin)
router.patch('/:id/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status)        update.status        = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;
    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
});

module.exports = router;
