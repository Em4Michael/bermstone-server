const mongoose = require('mongoose');

const InvestmentPaymentSchema = new mongoose.Schema(
  {
    investment: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Investment',
      required: true,
    },
    investor: {
      name:    { type: String, required: true },
      email:   { type: String, required: true },
      phone:   { type: String },
      company: { type: String },
    },
    amount:           { type: Number, required: true, min: 1 },
    currency:         { type: String, default: 'NGN' },
    paymentStatus:    {
      type:    String,
      enum:    ['pending', 'confirmed', 'rejected'],
      default: 'pending',
    },
    paymentMethod:    { type: String, default: 'bank_transfer' },
    paymentReference: { type: String },       // bank ref / transaction ID
    paymentDate:      { type: Date },          // date admin confirms
    notes:            { type: String },        // admin notes
    confirmedBy:      {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  { timestamps: true }
);

// When a payment is confirmed, add the amount to investment.currentlyRaised
InvestmentPaymentSchema.post('save', async function () {
  if (this.paymentStatus === 'confirmed') {
    const Investment = mongoose.model('Investment');
    const total = await this.constructor
      .aggregate([
        { $match: { investment: this.investment, paymentStatus: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
    const raised = total[0]?.total || 0;
    await Investment.findByIdAndUpdate(this.investment, { currentlyRaised: raised });
  }
});

module.exports = mongoose.models['InvestmentPayment'] ||
  mongoose.model('InvestmentPayment', InvestmentPaymentSchema);
