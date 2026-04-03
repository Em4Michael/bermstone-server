const { validationResult } = require('express-validator');
const Booking  = require('../models/Booking');
const Property = require('../models/Property');
const { sendBookingEmails } = require('../lib/mailer');

// POST /api/bookings
exports.createBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });

  try {
    const { property: propId, checkIn, checkOut, guests, guestInfo, specialRequests } = req.body;

    const property = await Property.findById(propId);
    if (!property)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const inDate  = new Date(checkIn);
    const outDate = new Date(checkOut);

    if (inDate >= outDate)
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });

    if (Number(guests) > property.maxGuests)
      return res.status(400).json({ success: false, message: `Max guests for this property is ${property.maxGuests}` });

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

    const booking = await Booking.create({
      property:            propId,
      guestInfo,
      checkIn:             inDate,
      checkOut:            outDate,
      guests:              Number(guests),
      nights,
      pricePerNight:       property.pricePerNight,
      subtotal,
      discountAmount,
      totalAmount:         subtotal - discountAmount,
      currency:            property.currency || 'NGN',
      specialRequests:     specialRequests || '',
      externalBookingLink: property.bookingLink || '',
    });

    // Non-blocking email — booking succeeds even if email fails
    sendBookingEmails(booking, property).catch(err =>
      console.error('[Mailer] Booking email failed:', err.message)
    );

    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// GET /api/bookings
exports.getBookings = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : { 'guestInfo.email': req.user.email };

    const bookings = await Booking.find(query)
      .populate('property', 'name coverImage location')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (err) { next(err); }
};

// GET /api/bookings/:ref
exports.getBookingByRef = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ bookingReference: req.params.ref })
      .populate('property', 'name coverImage location pricePerNight');
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// PATCH /api/bookings/:id/status  (admin)
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const update = {};
    if (status)        update.status        = status;
    if (paymentStatus) update.paymentStatus = paymentStatus;

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// POST /api/bookings/admin  (admin manually adds a booking)
exports.adminCreateBooking = async (req, res, next) => {
  try {
    const { property: propId, checkIn, checkOut, guests, guestInfo,
            totalAmount, pricePerNight, paymentStatus, specialRequests } = req.body;

    const property = await Property.findById(propId);
    if (!property)
      return res.status(404).json({ success: false, message: 'Property not found' });

    const inDate  = new Date(checkIn);
    const outDate = new Date(checkOut);
    const nights  = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    const price   = Number(pricePerNight) || property.pricePerNight;
    const total   = Number(totalAmount)   || price * nights;

    const booking = await Booking.create({
      property:        propId,
      guestInfo,
      checkIn:         inDate,
      checkOut:        outDate,
      guests:          Number(guests) || 1,
      nights,
      pricePerNight:   price,
      subtotal:        price * nights,
      discountAmount:  0,
      totalAmount:     total,
      currency:        property.currency || 'NGN',
      specialRequests: specialRequests || '',
      paymentStatus:   paymentStatus || 'unpaid',
      status:          'confirmed',                   // admin-added = auto confirmed
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// PATCH /api/bookings/:id/payment  (admin confirms/updates payment)
exports.updatePayment = async (req, res, next) => {
  try {
    const { paymentStatus, amountPaid, paymentReference } = req.body;
    const update = {};
    if (paymentStatus)    update.paymentStatus    = paymentStatus;
    if (paymentReference) update.paymentReference = paymentReference;

    // If marking as paid, also confirm the booking
    if (paymentStatus === 'paid') {
      update.status = 'confirmed';
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('property', 'name');
    if (!booking)
      return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};
