import dotenv from 'dotenv';
import path from 'path';

// Load env vars FIRST before any other imports
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import { authRouter, pasteRouter, urlRouter, terminalRouter, lintRouter } from './modules';
import productManagementRoutes from './routes/productManagementRoutes';
import { query } from './config/db';
import { cleanupService } from './services/cleanupService';
import { redirectToOriginalUrl } from './modules/url/controllers';

// Ensure logs directory exists
import fs from 'fs';

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOrigins = process.env.NODE_ENV === 'development' 
  ? true // Allow all origins in development
  : [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://152.160.0.78:3000',
    'http://152.160.0.78:3001',
    'http://152.160.0.78:3002',
    `http://${process.env.HOST || '0.0.0.0'}:3000`,
    `http://${process.env.HOST || '0.0.0.0'}:3001`,
    `http://${process.env.HOST || '0.0.0.0'}:3002`,
  ];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API routes
app.use('/api/pastes', pasteRouter);
app.use('/api/auth', authRouter);
app.use('/api/urls', urlRouter);
app.use('/api/terminal', terminalRouter);
app.use('/api/lint', lintRouter);
app.use('/api/product', productManagementRoutes);

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

// Start the server
const startServer = async () => {
  try {
    // Test the database connection
    await query('SELECT NOW()');
    console.log('Database connection successful!');

    // Start the cleanup service
    cleanupService.start();

    const HOST = process.env.HOST || '0.0.0.0';
    const PORT = process.env.PORT || 3001;

    app.listen(Number(PORT), HOST, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`Network: http://192.168.0.146:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
