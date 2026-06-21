import express from 'express';
import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.js';
import dishesRoutes from './routes/dishes.js';
import recipesRoutes from './routes/recipes.js';
import reflectionsRoutes from './routes/reflections.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ========================
   TRUST PROXY
======================== */
app.set('trust proxy', 1);

/* ========================
   BODY PARSING
======================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ========================
   CORS CONFIG
======================== */
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL?.replace(/\/$/, ''), // strip trailing slash if present
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.options('*', cors());

/* ========================
   SESSION STORE (MySQL)
======================== */
const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dishcovery',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

/* ========================
   SESSION CONFIG
======================== */
app.use(session({
  key: 'dishcovery.sid',
  secret: process.env.SESSION_SECRET || 'super-secret-key',
  store: sessionStore, // ✅ IMPORTANT
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

/* ========================
   HEALTH CHECK
======================== */
app.get('/health', (req, res) => {
  res.json({ status: 'Backend API is running' });
});

/* ========================
   ROUTES
======================== */
app.use('/api/auth', authRoutes);
app.use('/api/dishes', dishesRoutes);
app.use('/api/recipes', recipesRoutes);
app.use('/api/reflections', reflectionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

/* ========================
   ERROR HANDLER
======================== */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

/* ========================
   START SERVER
======================== */
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend should run on http://localhost:3000`);
});

export default app;
