const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    booking:  { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

    reviewer: {
      name:    { type: String, required: true },
      email:   { type: String, required: true },
      userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      avatar:  String,
      country: String,
    },

    rating:  { type: Number, required: true, min: 1, max: 5 },
    title:   String,
    comment: { type: String, required: true },

    categories: {
      cleanliness:   { type: Number, min: 1, max: 5 },
      location:      { type: Number, min: 1, max: 5 },
      value:         { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      accuracy:      { type: Number, min: 1, max: 5 },
    },

    isVerified:  { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-update property average rating
ReviewSchema.post('save', async function () {
  const Property = require('./Property');
  const result = await mongoose.model('Review').aggregate([
    { $match: { property: this.property, isPublished: true } },
    { $group: { _id: '$property', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (result.length > 0) {
    await Property.findByIdAndUpdate(this.property, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      totalReviews:  result[0].count,
    });
  }
});

ReviewSchema.index({ property: 1, isPublished: 1 });

module.exports = mongoose.models['Review'] || mongoose.model('Review', ReviewSchema);
