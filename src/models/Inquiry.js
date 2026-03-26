const mongoose = require('mongoose');

const InquirySchema = new mongoose.Schema(
  {
    type:   { type: String, enum: ['owner_listing','investor','general_contact'], required: true },
    status: { type: String, enum: ['new','in_review','contacted','closed'], default: 'new' },

    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, lowercase: true, trim: true },
    phone:     { type: String },
    company:   String,
    subject:   String,
    message:   { type: String, required: true },

    propertyDetails: {
      propertyName:           String,
      address:                String,
      city:                   String,
      propertyType:           String,
      bedrooms:               Number,
      bathrooms:              Number,
      monthlyExpectedRevenue: Number,
    },

    investmentDetails: {
      investmentAmount:  Number,
      projectOfInterest: String,
      timeline:          String,
    },

    adminNotes: String,
    assignedTo: String,
  },
  { timestamps: true }
);

InquirySchema.index({ type: 1, status: 1 });

module.exports = mongoose.models['Inquiry'] || mongoose.model('Inquiry', InquirySchema);