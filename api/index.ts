import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from '../server/modules/auth/routes';
import pasteRoutes from '../server/modules/paste/routes';
import urlRoutes from '../server/modules/url/routes';
import lintRoutes from '../server/modules/lint/routes';
import terminalRoutes from '../server/modules/terminal/routes';

dotenv.config();

const app = express();

// CORS configuration - allow deployed frontend and local dev
const allowedOrigins = [
  'https://openkai-darr7id11-amansagarwork2025-9891s-projects.vercel.app',
  'https://openkai.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/paste', pasteRoutes);
app.use('/api/url', urlRoutes);
app.use('/api/lint', lintRoutes);
app.use('/api/terminal', terminalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel serverless
export default app;
