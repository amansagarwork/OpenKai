import { query } from '../config/db';

async function cleanupExpiredPastes() {
  try {
    // Delete pastes where expires_at is in the past
    const result = await query(
      'DELETE FROM pastes WHERE expires_at < NOW() RETURNING *'
    );
    
    console.log(`[${new Date().toISOString()}] Cleaned up ${result.rowCount} expired pastes`);
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning up expired pastes:', error);
    throw error;
  }
}

// If run directly (not imported)
if (require.main === module) {
  cleanupExpiredPastes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { cleanupExpiredPastes };
