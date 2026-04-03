const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();
connectDB();

// ── CORS ────────────────────────────────────────────────
// Permissive CORS — accepts any origin in development,
// restricts to known domains in production.
const corsOptions = {
  origin: (origin, callback) => {
    // Always allow: no origin (Postman, mobile), localhost, Vercel deploys
    if (
      !origin ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin === process.env.CLIENT_URL ||
      origin === process.env.CLIENT_URL_PREVIEW
    ) {
      return callback(null, true);
    }
    // In development, allow everything
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  optionsSuccessStatus: 200, // some browsers send 204 issues
};

// Handle OPTIONS preflight for every route FIRST
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ── Security ─────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── Rate limiting ─────────────────────────────────────────
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }));

// ── Parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health check ─────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({
    success: true,
    message: 'Bermstone API running',
    env:     process.env.NODE_ENV || 'development',
    db:      'connected',
    ts:      new Date().toISOString(),
  })
);

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/properties',  require('./routes/properties'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/bookings',    require('./routes/bookings'));
app.use('/api/inquiries',   require('./routes/inquiries'));
app.use('/api/reviews',     require('./routes/reviews'));
app.use('/api/upload',      require('./routes/upload'));
app.use('/api/analytics',          require('./routes/analytics'));
app.use('/api/investment-payments', require('./routes/investment-payments'));

// ── 404 ──────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Error handler ─────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀  Bermstone API   →  http://localhost:${PORT}`);
  console.log(`💊  Health check   →  http://localhost:${PORT}/health\n`);
});

module.exports = app;
