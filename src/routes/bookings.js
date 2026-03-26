const express  = require('express');
const { body, validationResult } = require('express-validator');
const Booking  = require('../models/Booking');
const Property = require('../models/Property');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/bookings
router.post('/',
  [
    body('property').notEmpty().withMessage('Property ID required'),
    body('checkIn').isISO8601().withMessage('Valid check-in date required'),
    body('checkOut').isISO8601().withMessage('Valid check-out date required'),
    body('guests').isInt({ min: 1 }).withMessage('At least 1 guest required'),
    body('guestInfo.firstName').notEmpty().withMessage('First name required'),
    body('guestInfo.lastName').notEmpty().withMessage('Last name required'),
    body('guestInfo.email').isEmail().withMessage('Valid email required'),
    body('guestInfo.phone').notEmpty().withMessage('Phone required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    try {
      const { property: propId, checkIn, checkOut, guests, guestInfo, specialRequests } = req.body;

      const property = await Property.findById(propId);
      if (!property) {
        return res.status(404).json({ success: false, message: 'Property not found' });
      }

      const inDate  = new Date(checkIn);
      const outDate = new Date(checkOut);

      if (inDate >= outDate) {
        return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
      }
      if (Number(guests) > property.maxGuests) {
        return res.status(400).json({ success: false, message: `Max guests for this property is ${property.maxGuests}` });
      }

      const nights   = Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
      const subtotal = property.pricePerNight * nights;

      // Best applicable discount
      let discountAmount = 0;
      if (Array.isArray(property.discounts) && property.discounts.length > 0) {
        const applicable = property.discounts.filter(d => nights >= d.minNights);
        if (applicable.length > 0) {
          const best = applicable.reduce((a, b) => a.percentage > b.percentage ? a : b);
          discountAmount = Math.round((subtotal * best.percentage) / 100);
        }
      }

      // Booking.create is safe now — model won't be re-registered on hot reload
      const booking = await Booking.create({
        property:            propId,
        guestInfo,
        checkIn:             inDate,
        checkOut:            outDate,
        guests:              Number(guests),
        nights,                         // passed explicitly so no conflict with hook
        pricePerNight:       property.pricePerNight,
        subtotal,
        discountAmount,
        totalAmount:         subtotal - discountAmount,
        currency:            property.currency || 'NGN',
        specialRequests:     specialRequests || '',
        externalBookingLink: property.bookingLink || '',
      });

      res.status(201).json({ success: true, data: booking });
    } catch (err) { next(err); }
  }
);

// GET /api/bookings
router.get('/', protect, async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { 'guestInfo.email': req.user.email };

    const bookings = await Booking.find(query)
      .populate('property', 'name coverImage location')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
});

// GET /api/bookings/:ref
router.get('/:ref', async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.ref })
      .populate('property', 'name coverImage location pricePerNight');
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