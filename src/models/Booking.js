const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    guest:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    guestInfo: {
      firstName: { type: String, required: true },
      lastName:  { type: String, required: true },
      email:     { type: String, required: true },
      phone:     { type: String, required: true },
    },

    checkIn:  { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests:   { type: Number, required: true, min: 1 },
    nights:   { type: Number },

    pricePerNight:  { type: Number, required: true },
    subtotal:       { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    totalAmount:    { type: Number, required: true },
    currency:       { type: String, default: 'NGN' },

    status:        { type: String, enum: ['pending','confirmed','cancelled','completed','no_show'], default: 'pending' },
    paymentStatus: { type: String, enum: ['unpaid','partially_paid','paid','refunded'], default: 'unpaid' },

    specialRequests:     String,
    bookingReference:    { type: String, unique: true },
    externalBookingLink: String,
  },
  { timestamps: true }
);

BookingSchema.pre('save', function (next) {
  if (this.checkIn && this.checkOut) {
    const ms = this.checkOut.getTime() - this.checkIn.getTime();
    this.nights = Math.ceil(ms / (1000 * 60 * 60 * 24));
  }
  if (!this.bookingReference) {
    this.bookingReference = `BRM-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  next();
});

BookingSchema.index({ property: 1, checkIn: 1, checkOut: 1 });
BookingSchema.index({ bookingReference: 1 });

// Prevent "Cannot overwrite model once compiled" on nodemon hot-reload
module.exports = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);