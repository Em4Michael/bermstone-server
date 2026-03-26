require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();
connectDB();

// ── Security ───────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods:     ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

// ── Parsers ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health ─────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({ success: true, message: 'Bermstone API running', env: process.env.NODE_ENV, ts: new Date() })
);

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/properties',  require('./routes/properties'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/bookings',    require('./routes/bookings'));
app.use('/api/inquiries',   require('./routes/inquiries'));
app.use('/api/reviews',     require('./routes/reviews'));
app.use('/api/upload',      require('./routes/upload'));
app.use('/api/analytics',   require('./routes/analytics'));

// ── 404 ────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Bermstone API  →  http://localhost:${PORT}`);
  console.log(`💊 Health check   →  http://localhost:${PORT}/health\n`);
});

process.on('SIGTERM', () => server.close(() => process.exit(0)));
module.exports = app;
