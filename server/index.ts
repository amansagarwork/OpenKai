import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { startServer as startApp } from './startServer';
import { seedServices } from './services/serviceSeeder';
import authRoutes from './routes/authRoutes';
import pasteRoutes from './routes/pasteRoutes';
import urlRoutes from './routes/urlRoutes';
import serviceRoutes from './routes/serviceRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import terminalRouter from './modules/terminal/routes';
import lintRouter from './modules/lint/routes';
import productManagementRoutes from './routes/productManagementRoutes';
import { redirectToOriginalUrl } from './modules/url/controllers';

// Load env vars FIRST before any other imports
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3002;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.116:3000'],
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/pastes', pasteRoutes);
app.use('/api/urls', urlRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/terminal', terminalRouter);
app.use('/api/lint', lintRouter);
app.use('/api/product-management', productManagementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: 'operational'
  });
});

// Seed services on startup
mongoose.connection.once('open', () => {
  seedServices();
});

// URL redirect route (must be before static files)
app.get('/u/:shortId', redirectToOriginalUrl);

// Static file serving - only for production builds
// In development, Next.js dev server handles frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Catch-all route to serve index.html for client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
startApp(app, PORT);
