const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    summary:     { type: String, required: true, maxlength: 300 },
    description: { type: String, required: true },

    location: {
      address:     { type: String, required: true },
      city:        { type: String, required: true },
      state:       { type: String, required: true },
      country:     { type: String, default: 'Nigeria' },
      coordinates: { lat: Number, lng: Number },
    },

    pricePerNight: { type: Number, required: true, min: 0 },
    currency:      { type: String, default: 'NGN' },

    discounts: [
      {
        label:      String,
        percentage: { type: Number, min: 0, max: 100 },
        minNights:  { type: Number, min: 1 },
      },
    ],

    maxGuests:   { type: Number, required: true, min: 1 },
    bedrooms:    { type: Number, required: true, min: 0 },
    bathrooms:   { type: Number, required: true, min: 0 },
    amenities:   [String],
    rules:       [String],

    images: [
      {
        url:      { type: String, required: true },
        publicId: String,
        caption:  String,
      },
    ],
    coverImage:   { type: String, default: '' },
    bookingLink:  { type: String },

    isFeatured:    { type: Boolean, default: false },
    isActive:      { type: Boolean, default: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews:  { type: Number, default: 0 },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PropertySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (this.images.length > 0 && !this.coverImage) {
    this.coverImage = this.images[0].url;
  }
  next();
});

PropertySchema.index({ 'location.city': 1, isActive: 1 });
PropertySchema.index({ pricePerNight: 1 });

module.exports = mongoose.models['Property'] || mongoose.model('Property', PropertySchema);