const jwt  = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const signToken = (id, role) =>
  jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

// POST /api/auth/register
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    if (await User.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user  = await User.create({ firstName, lastName, email, password, phone, role });
    const token = signToken(user._id, user.role);

    res.status(201).json({ success: true, token, user });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user._id, user.role);
    res.json({ success: true, token, user });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = (req, res) => {
  res.json({ success: true, user: req.user });
};

// PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    // Prevent role escalation
    const { role, password, ...safe } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, safe, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};
