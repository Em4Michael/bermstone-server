const { validationResult } = require('express-validator');
const Inquiry = require('../models/Inquiry');
const { sendInquiryEmails } = require('../lib/mailer');

// POST /api/inquiries
exports.createInquiry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });

  try {
    const inquiry = await Inquiry.create(req.body);

    // Non-blocking email
    sendInquiryEmails(inquiry).catch(err =>
      console.error('[Mailer] Inquiry email failed:', err.message)
    );

    res.status(201).json({
      success: true,
      message: "Inquiry received. We'll be in touch within 24 hours.",
      data: { id: inquiry._id },
    });
  } catch (err) { next(err); }
};

// GET /api/inquiries  (admin)
exports.getInquiries = async (req, res, next) => {
  try {
    const { type, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (type)   query.type   = type;
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [inquiries, total] = await Promise.all([
      Inquiry.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Inquiry.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: inquiries,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) { next(err); }
};

// GET /api/inquiries/:id  (admin)
exports.getInquiry = async (req, res, next) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry)
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, data: inquiry });
  } catch (err) { next(err); }
};

// PATCH /api/inquiries/:id  (admin)
exports.updateInquiry = async (req, res, next) => {
  try {
    const { status, adminNotes, assignedTo } = req.body;
    const update = {};
    if (status)     update.status     = status;
    if (adminNotes) update.adminNotes = adminNotes;
    if (assignedTo) update.assignedTo = assignedTo;

    const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!inquiry)
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    res.json({ success: true, data: inquiry });
  } catch (err) { next(err); }
};
