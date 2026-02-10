import { Request, Response } from 'express';
import multer from 'multer';
import { query } from '../../config/db';

// Multer setup for file uploads (5MB limit)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types
    cb(null, true);
  }
});

export const uploadMiddleware = upload.single('file');

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

// Generate URL-friendly slug from text
const generateSlug = (text: string): string => {
  if (!text || text.length === 0) return '';
  
  // Take first line or first 50 chars for slug base
  const base = text.split('\n')[0].substring(0, 50);
  
  let slug = base
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Remove consecutive hyphens
    .replace(/^-+|-+$/g, '');     // Trim hyphens
  
  // If slug is empty or too short, add a prefix
  if (slug.length < 3) {
    slug = `paste-${slug}`;
  }
  
  // If still empty, generate random slug
  if (slug.length === 0 || slug === 'paste-') {
    const random = Math.random().toString(36).substring(2, 8);
    slug = `paste-${random}`;
  }
  
  return slug;
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
    const file = (req as any).file as Express.Multer.File | undefined;
    const user = (req as any).user as AuthedUser | undefined;

    // Validate: need either content or file
    if ((!content || content.length === 0) && !file) {
      return res.status(400).json({ error: 'Content or file is required' });
    }

    // Check content size (1MB for text)
    if (content && content.length > 1024 * 1024) {
      return res.status(400).json({ error: 'Content exceeds 1MB limit' });
    }

    // Check file size (5MB limit enforced by multer, but double-check)
    if (file && file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ error: 'File exceeds 5MB limit' });
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

    // Determine content type and prepare data
    const contentType = file ? file.mimetype : 'text/plain';
    const fileData = file ? file.buffer : null;
    const fileNameValue = file ? file.originalname : null;
    const fileSize = file ? file.size : null;

    // Generate SEO-friendly slug with content type prefix
    let contentTypePrefix = 'text';
    if (file) {
      if (file.mimetype.startsWith('image/')) {
        contentTypePrefix = 'image';
      } else {
        contentTypePrefix = 'file';
      }
    }
    const slug = `${contentTypePrefix}/${pasteId}`;

    await query(
      `INSERT INTO pastes (paste_id, user_id, content, content_type, file_data, file_name, file_size, expires_at, delete_token, slug) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [pasteId, user?.userId ?? null, content || '', contentType, fileData, fileNameValue, fileSize, expiresAt, deleteToken, slug]
    );

    res.status(201).json({
      pasteId,
      slug,
      url: `${process.env.BASE_URL || 'http://localhost:5173'}/open-kai/${slug || pasteId}`,
      deleteToken,
      contentType: contentType.startsWith('image/') ? 'image' : contentType.startsWith('text/') ? 'text' : 'file'
    });
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPaste = async (req: Request, res: Response) => {
  const { id } = req.params;
  const raw = req.query.raw === 'true';
  const download = req.query.download === 'true';
  const user = (req as any).user;

  if (!id) {
    return res.status(400).json({ error: 'Paste ID is required' });
  }

  try {
    // Support both formats: "abc123" and "text/abc123"
    const pasteId = id.includes('/') ? id.split('/')[1] : id; 

    // Get paste with file data - check paste_id or full slug path
    const result = await query(
      'SELECT paste_id, content, content_type, file_data, file_name, file_size, slug, created_at, expires_at, user_id FROM pastes WHERE paste_id = $1 OR slug = $2',
      [pasteId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paste not found' });
    }

    const paste = result.rows[0];
    
    // Check if paste has expired
    if (paste.expires_at && new Date(paste.expires_at) < new Date()) {
      await query('DELETE FROM pastes WHERE paste_id = $1', [id]);
      return res.status(410).json({ error: 'Paste has expired' });
    }

    // If raw=true, serve the actual file content
    if (raw && paste.file_data) {
      const contentType = paste.content_type || 'application/octet-stream';
      const isImage = contentType.startsWith('image/');
      
      // Track download in history only for logged-in users
      if (user && (!isImage || download)) {
        await query(
          `INSERT INTO user_history (user_id, item_type, item_id, file_name, file_size, content_type, action, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'download', NOW())`,
          [user.userId, 'paste_download', id, paste.file_name, paste.file_size, contentType]
        );
      }
      
      // Set appropriate headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', paste.file_size);
      
      // Set download disposition for non-images or explicit download requests
      if (!isImage || download) {
        const filename = paste.file_name || `download-${paste.paste_id}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      }
      
      return res.send(paste.file_data);
    }

    // Return metadata as JSON (default behavior)
    const response: any = {
      pasteId: paste.paste_id,
      content: paste.content,
      contentType: paste.content_type || 'text/plain',
      hasFile: !!paste.file_data,
      fileName: paste.file_name,
      fileSize: paste.file_size,
      slug: paste.slug,
      createdAt: paste.created_at,
      expiresAt: paste.expires_at,
      isOwner: user ? paste.user_id === user.userId : false
    };

    // For text pastes without file, include content directly
    if (!paste.file_data) {
      response.type = 'text';
    } else if (paste.content_type?.startsWith('image/')) {
      response.type = 'image';
      response.fileUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/api/pastes/${pasteId}?raw=true`;
    } else {
      response.type = 'file';
      response.downloadUrl = `${process.env.BASE_URL || 'http://localhost:3001'}/api/pastes/${pasteId}?raw=true&download=true`;
    }

    res.json(response);
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

// Unified history: get all user activity from user_history table
export const getUserHistory = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = user.userId;

    // Get all user activities from user_history table
    const historyResult = await query(
      `SELECT id, item_type, item_id, file_name, file_size, content_type, action, metadata, created_at
       FROM user_history 
       WHERE user_id = $1 
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId]
    );

    // Get user's pastes (created items)
    const pastesResult = await query(
      `SELECT paste_id, content, created_at, expires_at, content_type, file_name, file_size, 'paste' as type
       FROM pastes 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Get user's shortened URLs
    const urlsResult = await query(
      `SELECT short_id, original_url as content, created_at, clicks, 'url' as type
       FROM shortened_urls 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Format history items
    const historyItems = historyResult.rows.map((h: any) => ({
      id: h.id,
      itemId: h.item_id,
      type: h.item_type,
      action: h.action,
      fileName: h.file_name,
      fileSize: h.file_size,
      contentType: h.content_type,
      metadata: h.metadata,
      createdAt: h.created_at,
      url: getItemUrl(h.item_type, h.item_id)
    }));

    // Combine created items and history
    const createdItems = [
      ...pastesResult.rows.map((p: any) => ({
        id: p.paste_id,
        itemId: p.paste_id,
        type: 'paste',
        action: 'create',
        content: p.content?.substring(0, 100) + (p.content?.length > 100 ? '...' : ''),
        fileName: p.file_name,
        fileSize: p.file_size,
        contentType: p.content_type,
        createdAt: p.created_at,
        expiresAt: p.expires_at,
        url: `/open-kai/${p.paste_id}`,
      })),
      ...urlsResult.rows.map((u: any) => ({
        id: u.short_id,
        itemId: u.short_id,
        type: 'url',
        action: 'create',
        content: u.content,
        clicks: u.clicks,
        createdAt: u.created_at,
        url: `/u/${u.short_id}`,
      })),
    ];

    // Merge and sort by created_at
    const allHistory = [...historyItems, ...createdItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100);

    res.json({ history: allHistory });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

// Helper function to get URL for different item types
function getItemUrl(itemType: string, itemId: string | null): string | null {
  if (!itemId) return null;
  
  switch (itemType) {
    case 'paste':
    case 'paste_download':
      return `/open-kai/${itemId}`;
    case 'url':
      return `/u/${itemId}`;
    case 'terminal_session':
      return `/terminal/${itemId}`;
    case 'lint_check':
      return `/code-health`;
    default:
      return null;
  }
}
