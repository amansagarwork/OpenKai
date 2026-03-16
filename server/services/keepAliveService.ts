import { logger } from '../utils/logger';
import db from '../config/db';

class KeepAliveService {
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private readonly KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private testPasteId: string | null = null;

  public async pingDatabase(): Promise<void> {
    try {
      // Create a test paste with random numeric paste_id (6 digits)
      const pasteId = Math.floor(100000 + Math.random() * 900000).toString();
      const testContent = `keepalive_${Date.now()}`;
      
      await db.query(
        'INSERT INTO pastes (paste_id, user_id, content, content_type, file_data, file_name, file_size, expires_at, delete_token, slug) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [pasteId, null, testContent, 'text/plain', null, null, null, null, 'keepalive_token', null]
      );
      
      // Immediately delete it
      await db.query('DELETE FROM pastes WHERE paste_id = $1', [pasteId]);
      
      logger.info('MongoDB keepalive ping successful');
    } catch (error) {
      logger.error('MongoDB keepalive ping failed:', error);
    }
  }

  public start(): void {
    // Run immediately
    this.pingDatabase().catch(console.error);
    
    // Then set up interval
    this.keepAliveInterval = setInterval(() => {
      this.pingDatabase().catch(console.error);
    }, this.KEEP_ALIVE_INTERVAL);

    logger.info(`MongoDB keepalive service started. Will ping every ${this.KEEP_ALIVE_INTERVAL / 1000} seconds.`);
  }

  public stop(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
      logger.info('MongoDB keepalive service stopped');
    }
  }
}

export const keepAliveService = new KeepAliveService();
