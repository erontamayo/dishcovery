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
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));

app.options('*', cors());

/* ========================
   SESSION STORE (MySQL)
======================== */
const MySQLStore = MySQLStoreFactory(session);

const sessionStore = new MySQLStore({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // 🔥 lagay mo password mo kung meron
  database: 'dishcovery'
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
    secure: false,     // ⚠️ false for localhost
    sameSite: 'lax',   // ⚠️ important for cross-origin
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