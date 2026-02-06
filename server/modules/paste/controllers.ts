import { Request, Response } from 'express';
import { query } from '../../config/db';

type AuthedUser = {
  userId: number;
  email: string;
};

const generatePasteId = (): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  let id = '';
  
  // Add 3 random letters
  for (let i = 0; i < 3; i++) {
    id += letters[Math.floor(Math.random() * letters.length)];
  }
  
  // Add 3 random digits
  for (let i = 0; i < 3; i++) {
    id += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return id;
};

export const listMyPastes = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user as AuthedUser | undefined;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limitRaw = req.query.limit;
    const limit = Math.min(100, Math.max(1, Number(limitRaw ?? 50) || 50));

    const result = await query(
      'SELECT paste_id, created_at, expires_at FROM pastes WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [user.userId, limit]
    );

    return res.status(200).json({
      items: result.rows.map((r) => ({
        pasteId: r.paste_id,
        createdAt: r.created_at,
        expiresAt: r.expires_at,
      })),
    });
  } catch (error) {
    console.error('Error listing user pastes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generateDeleteToken = (): string => {
  return Array(32).fill(0).map(() => 
    Math.random().toString(36).charAt(2)
  ).join('');
};

const calculateExpiresAt = (expiresIn?: string): Date | null => {
  if (!expiresIn || expiresIn === 'never') return null;
  
  const now = new Date();
  switch (expiresIn) {
    case '1m': return new Date(now.getTime() + 60 * 1000);
    case '5m': return new Date(now.getTime() + 5 * 60 * 1000);
    case '10m': return new Date(now.getTime() + 10 * 60 * 1000);
    case '1h': return new Date(now.getTime() + 60 * 60 * 1000);
    case '1d': return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '1w': return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    default: return null;
  }
};

export const createPaste = async (req: Request, res: Response) => {
  try {
    const { content, expiresIn } = req.body;
    const user = (req as any).user as AuthedUser | undefined;

    if (!content || content.length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 1024 * 1024) {
      return res.status(400).json({ error: 'Content exceeds 1MB limit' });
    }

    // Generate unique paste ID
    let pasteId = '';
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      pasteId = generatePasteId();
      attempts++;
      
      const existing = await query(
        'SELECT paste_id FROM pastes WHERE paste_id = $1',
        [pasteId]
      );
      
      if (existing.rows.length === 0) {
        break;
      }
    } while (attempts < maxAttempts);
    
    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Failed to generate unique paste ID' });
    }
      const expiresAt = calculateExpiresAt(expiresIn);
    const deleteToken = generateDeleteToken();

    await query(
      'INSERT INTO pastes (paste_id, user_id, content, expires_at, delete_token) VALUES ($1, $2, $3, $4, $5)',
      [pasteId, user?.userId ?? null, content, expiresAt, deleteToken]
    );

    res.status(201).json({
      pasteId,
      url: `${process.env.BASE_URL || 'http://localhost:5173'}/open-kai/${pasteId}`,
      deleteToken
    });
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPaste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First check if the paste exists and get its content
    const result = await query(
      'SELECT content, created_at, expires_at FROM pastes WHERE paste_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    const paste = result.rows[0];
    
    // Check if paste has expired
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
      // Delete the expired paste
      await query('DELETE FROM pastes WHERE paste_id = $1', [id]);
      return res.status(410).json({ error: 'Paste has expired' });
    }

    res.json({
      pasteId: id,
      content: paste.content,
      createdAt: paste.created_at,
      expiresAt: paste.expires_at
    });
  } catch (error) {
    console.error('Error retrieving paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePaste = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Delete token is required' });
    }

    const result = await query(
      'DELETE FROM pastes WHERE paste_id = $1 AND delete_token = $2 RETURNING 1',
      [id, token]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Paste not found or invalid token' });
    }

    res.status(200).json({ message: 'Paste deleted successfully' });
  } catch (error) {
    console.error('Error deleting paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Unified history: get all user activity (pastes + shortened URLs)
export const getUserHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user.userId;

    // Get user's pastes
    const pastesResult = await query(
      `SELECT paste_id, content, created_at, expires_at, 'paste' as type
       FROM pastes 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Get user's shortened URLs
    const urlsResult = await query(
      `SELECT short_id, original_url as content, created_at, clicks as expires_at, 'url' as type
       FROM shortened_urls 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Combine and sort by created_at
    const history = [
      ...pastesResult.rows.map((p: any) => ({
        id: p.paste_id,
        type: 'paste',
        content: p.content.substring(0, 100) + (p.content.length > 100 ? '...' : ''),
        createdAt: p.created_at,
        expiresAt: p.expires_at,
        url: `/open-kai/${p.paste_id}`,
      })),
      ...urlsResult.rows.map((u: any) => ({
        id: u.short_id,
        type: 'url',
        content: u.content,
        createdAt: u.created_at,
        clicks: u.expires_at,
        url: `/u/${u.short_id}`,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ history });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
