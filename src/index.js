require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/error');

const app = express();

// ── Trust Render/Heroku reverse proxy ──────────────────
// CRITICAL: Without this, express-rate-limit sees the proxy IP
// for every request and behaves unpredictably on live servers.
app.set('trust proxy', 1);

connectDB();

// ── Security ───────────────────────────────────────────
app.use(helmet());

// Build allowed origins list from env vars
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,           // e.g. https://bermstone.vercel.app
  process.env.CLIENT_URL_PREVIEW,   // optional staging URL
].filter(Boolean); // removes undefined/null entries

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests BEFORE rate limiting hits them
app.options('*', cors());

// ── Rate Limiting ──────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  // Required for Render: use the real client IP, not proxy IP
  keyGenerator: (req) => req.ip,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// ── Parsers ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Health ─────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({
    success: true,
    message: 'Bermstone API running',
    env: process.env.NODE_ENV,
    ts: new Date(),
  })
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
app.use((_req, res) =>
  res.status(404).json({ success: false, message: 'Route not found' })
);

// ── Error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────
// Render requires listening on 0.0.0.0, not just the port
const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Bermstone API  →  http://${HOST}:${PORT}`);
  console.log(`💊 Health check   →  http://${HOST}:${PORT}/health`);
  console.log(`🌍 Environment    →  ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed CORS   →  ${allowedOrigins.join(', ')}\n`);
});

server.keepAliveTimeout = 120000; // 120s — Render's load balancer needs this
server.headersTimeout   = 125000; // must be > keepAliveTimeout

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});

module.exports = app;