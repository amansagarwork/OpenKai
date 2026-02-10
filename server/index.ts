import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { authRouter, pasteRouter, urlRouter, terminalRouter, lintRouter } from './modules';
import { query } from './config/db';
import { cleanupService } from './services/cleanupService';
import { redirectToOriginalUrl } from './modules/url/controllers';

dotenv.config();

// Ensure logs directory exists
import fs from 'fs';

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

// URL redirect route (must be before static files)
app.get('/u/:shortId', redirectToOriginalUrl);

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

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

    const HOST = process.env.HOST || '192.168.11.15';
    const PORT = process.env.PORT || 3001;

    app.listen(Number(PORT), HOST, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
      console.log(`Network: http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
