const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, unique: true, lowercase: true },
    summary:     { type: String, required: true, maxlength: 400 },
    description: { type: String, required: true },

    location: {
      address: { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      country: { type: String, default: 'Morocco' },
    },

    totalAmount:       { type: Number, required: true, min: 0 },
    minimumInvestment: { type: Number, required: true, min: 0 },
    currentlyRaised:   { type: Number, default: 0, min: 0 },
    currency:          { type: String, default: 'MAD' },

    projectType: {
      type: String,
      enum: ['skyscraper','duplex','flat','hotel','mixed_use','commercial','residential_complex','other'],
      required: true,
    },
    status: {
      type: String,
      enum: ['upcoming','active','funded','completed'],
      default: 'upcoming',
    },

    projectPeriod: {
      startDate:      Date,
      endDate:        Date,
      durationMonths: Number,
    },

    expectedROI:  { type: Number, default: 0 },
    businessPlan: String,
    buildingPlan: String,

    images: [{ url: { type: String, required: true }, publicId: String }],
    coverImage: { type: String, default: '' },

    similarProjects:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Investment' }],
    isFeatured:        { type: Boolean, default: false },
    isActive:          { type: Boolean, default: true },
    createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

InvestmentSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (this.images.length > 0 && !this.coverImage) {
    this.coverImage = this.images[0].url;
  }
  next();
});

InvestmentSchema.virtual('fundingPercentage').get(function () {
  return this.totalAmount ? Math.round((this.currentlyRaised / this.totalAmount) * 100) : 0;
});

module.exports = mongoose.models['Investment'] || mongoose.model('Investment', InvestmentSchema);
