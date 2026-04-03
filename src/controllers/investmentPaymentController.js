const InvestmentPayment = require('../models/InvestmentPayment');
const Investment        = require('../models/Investment');

// POST /api/investment-payments
// Any user/visitor can submit a payment record (marks as pending)
exports.createPayment = async (req, res, next) => {
  try {
    const {
      investment, amount, currency,
      name, email, phone, company,
      paymentMethod, paymentReference, notes,
    } = req.body;

    if (!investment || !amount || !name || !email) {
      return res.status(400).json({ success: false, message: 'investment, amount, name and email are required' });
    }

    const inv = await Investment.findById(investment);
    if (!inv) return res.status(404).json({ success: false, message: 'Investment not found' });

    if (amount < inv.minimumInvestment) {
      return res.status(400).json({
        success: false,
        message: `Minimum investment is ${inv.currency} ${inv.minimumInvestment.toLocaleString()}`,
      });
    }

    const payment = await InvestmentPayment.create({
      investment,
      investor: { name, email, phone, company },
      amount:   Number(amount),
      currency: currency || inv.currency,
      paymentMethod:    paymentMethod    || 'bank_transfer',
      paymentReference: paymentReference || '',
      notes:            notes            || '',
    });

    res.status(201).json({
      success: true,
      message: 'Payment submission received. Admin will confirm shortly.',
      data:    payment,
    });
  } catch (err) { next(err); }
};

// GET /api/investment-payments  (admin — all payments)
exports.getPayments = async (req, res, next) => {
  try {
    const { status, investment, page = 1, limit = 30 } = req.query;
    const query = {};
    if (status)     query.paymentStatus = status;
    if (investment) query.investment    = investment;

    const skip = (Number(page) - 1) * Number(limit);
    const [payments, total] = await Promise.all([
      InvestmentPayment.find(query)
        .populate('investment', 'name currency totalAmount minimumInvestment')
        .populate('confirmedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InvestmentPayment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data:    payments,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) { next(err); }
};

// GET /api/investment-payments/:id  (admin)
exports.getPayment = async (req, res, next) => {
  try {
    const payment = await InvestmentPayment.findById(req.params.id)
      .populate('investment', 'name currency totalAmount currentlyRaised')
      .populate('confirmedBy', 'firstName lastName');
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};

// PATCH /api/investment-payments/:id/confirm  (admin — confirm payment)
exports.confirmPayment = async (req, res, next) => {
  try {
    const { paymentReference, notes } = req.body;
    const payment = await InvestmentPayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (payment.paymentStatus === 'confirmed') {
      return res.status(400).json({ success: false, message: 'Payment already confirmed' });
    }

    payment.paymentStatus    = 'confirmed';
    payment.paymentDate      = new Date();
    payment.confirmedBy      = req.user._id;
    if (paymentReference) payment.paymentReference = paymentReference;
    if (notes)            payment.notes            = notes;

    await payment.save(); // post-save hook updates investment.currentlyRaised

    // Fetch updated investment to return new totals
    const investment = await Investment.findById(payment.investment);

    res.json({
      success: true,
      message: 'Payment confirmed. Investment funding updated.',
      data:    { payment, investment },
    });
  } catch (err) { next(err); }
};

// PATCH /api/investment-payments/:id/reject  (admin)
exports.rejectPayment = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const payment = await InvestmentPayment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'rejected', notes: notes || '' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment });
  } catch (err) { next(err); }
};
