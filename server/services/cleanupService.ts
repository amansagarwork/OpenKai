import { logger } from '../utils/logger';
import db from '../config/db';

interface Paste {
  paste_id: string;
  content: string;
  created_at: string;
  expires_at: string | null;
  delete_token?: string;
  user_id?: number | null;
}

type PasteIdRow = Pick<Paste, 'paste_id'>;

class CleanupService {
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

  public async cleanupExpiredPastes(): Promise<number> {
    const client = await db.connect();
    try {
      const result = await client.query<PasteIdRow>(
        'DELETE FROM pastes WHERE expires_at < NOW() RETURNING paste_id'
      );
      
      const count = result.rowCount ?? 0;
      if (count > 0) {
        const pasteIds = result.rows.map(row => row.paste_id).join(', ');
        logger.info(`Cleaned up ${count} expired pastes: ${pasteIds}`);
      }
      return count;
    } catch (error) {
      logger.error('Error cleaning up expired pastes:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  public start(): void {
    // Run cleanup immediately
    this.cleanupExpiredPastes().catch(console.error);
    
    // Then set up interval for periodic cleanup
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredPastes().catch(console.error);
    }, this.CLEANUP_INTERVAL);

    logger.info(`Cleanup service started. Will run every ${this.CLEANUP_INTERVAL / 1000} seconds.`);
  }

  public stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Cleanup service stopped');
    }
  }
}

export const cleanupService = new CleanupService();
