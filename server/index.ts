import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter, pasteRouter, urlRouter, terminalRouter, lintRouter } from './modules';
import { query } from './config/db';
import { cleanupService } from './services/cleanupService';
import { redirectToOriginalUrl } from './modules/url/controllers';

dotenv.config();

// Ensure logs directory exists
import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// URL redirect route (must be before error handler)
app.get('/u/:shortId', redirectToOriginalUrl);

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

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
