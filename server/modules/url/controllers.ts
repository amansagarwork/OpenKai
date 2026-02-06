import { Request, Response } from 'express';
import { query } from '../../config/db';

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute per IP

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimiter.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetTime: record.resetTime };
}

// URL validation and security check
function validateAndNormalizeUrl(input: string): { valid: boolean; url?: string; error?: string } {
  let url = input.trim();

  if (!url) {
    return { valid: false, error: 'URL is required' };
  }

  // Auto-add https if no protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    const parsed = new URL(url);

    // Check for valid protocol
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Check for localhost/private IPs (security)
    const hostname = parsed.hostname.toLowerCase();
    const blockedHosts = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '[::1]',
      '[::]',
    ];

    // Check for private IP ranges
    const privateIpPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^127\./,
      /^fc00:/i,
      /^fe80:/i,
    ];

    if (blockedHosts.includes(hostname) || privateIpPatterns.some(p => p.test(hostname))) {
      return { valid: false, error: 'URLs pointing to localhost or private networks are not allowed for security reasons' };
    }

    // Block dangerous file extensions
    const pathname = parsed.pathname.toLowerCase();
    const dangerousExtensions = ['.exe', '.dll', '.bat', '.cmd', '.sh', '.zip', '.rar', '.tar.gz', '.js', '.vbs', '.ps1', '.msi', '.dmg', '.apk'];
    if (dangerousExtensions.some(ext => pathname.endsWith(ext))) {
      return { valid: false, error: 'URLs with executable or archive file extensions are not allowed' };
    }

    // Optional: Enforce HTTPS only (uncomment if needed)
    // if (parsed.protocol !== 'https:') {
    //   return { valid: false, error: 'Only HTTPS URLs are allowed for security' };
    // }

    // Check URL length
    if (url.length > 2048) {
      return { valid: false, error: 'URL is too long (max 2048 characters)' };
    }

    return { valid: true, url };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

// Generate a random short ID (6 characters: letters and numbers)
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createShortUrl(req: Request, res: Response) {
  try {
    // Check rate limit
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(clientIp);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded. Please wait a minute before creating more short URLs.',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      });
    }

    const { url } = req.body;

    // Validate and normalize URL with security checks
    const validation = validateAndNormalizeUrl(url);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const normalizedUrl = validation.url!;

    // Generate unique short ID
    let shortId: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortId = generateShortId();
      // Check if ID already exists
      const existing = await query(
        'SELECT short_id FROM shortened_urls WHERE short_id = $1',
        [shortId]
      );
      if (existing.rows.length === 0) break;
      attempts++;
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return res.status(500).json({ error: 'Failed to generate unique short ID' });
    }

    // Store in database with optional user_id
    const userId = (req as any).user?.userId || null;
    await query(
      'INSERT INTO shortened_urls (short_id, original_url, user_id) VALUES ($1, $2, $3)',
      [shortId, normalizedUrl, userId]
    );

    const frontendBase = (process.env.FRONTEND_BASE_URL || process.env.BASE_URL || '').replace(/\/$/, '');
    const shortUrl = `${frontendBase || `${req.protocol}://${req.get('host')}`}/u/${shortId}`;

    res.status(201).json({
      shortId,
      originalUrl: normalizedUrl,
      shortUrl,
    });
  } catch (error) {
    console.error('Error creating short URL:', error);
    res.status(500).json({ error: 'Failed to create short URL' });
  }
}

export async function redirectToOriginalUrl(req: Request, res: Response) {
  try {
    const { shortId } = req.params;

    if (!shortId || shortId.length !== 6) {
      return res.status(400).json({ error: 'Invalid short ID' });
    }

    // Get original URL and increment click count
    const result = await query(
      'UPDATE shortened_urls SET clicks = clicks + 1 WHERE short_id = $1 RETURNING original_url',
      [shortId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const { original_url } = result.rows[0];

    // Serve lightweight HTML with 5s countdown before redirect
    const escapedUrl = original_url.replace(/"/g, '&quot;');
    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Redirecting...</title>
    <style>
      * { box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; 
        background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); 
        color: #0f172a; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        min-height: 100vh; 
        margin: 0; 
        padding: 20px;
      }
      .card { 
        background: white; 
        padding: 40px; 
        border-radius: 20px; 
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1); 
        max-width: 480px; 
        width: 100%; 
        border: 1px solid #e2e8f0;
        text-align: center;
      }
      .icon {
        width: 64px;
        height: 64px;
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        font-size: 28px;
      }
      .title { 
        font-size: 24px; 
        font-weight: 700; 
        margin: 0 0 8px; 
        color: #1e293b;
      }
      .subtitle { 
        font-size: 15px;
        margin: 0 0 24px; 
        color: #64748b; 
      }
      .destination-label {
        font-size: 13px;
        font-weight: 600;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        text-align: left;
      }
      .box { 
        background: #f8fafc; 
        border: 1px solid #e2e8f0; 
        border-radius: 12px; 
        padding: 16px; 
        font-size: 14px; 
        word-break: break-all; 
        color: #475569;
        margin-bottom: 32px;
        text-align: left;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .box::before {
        content: "🔗";
        font-size: 20px;
        flex-shrink: 0;
      }
      .count { 
        font-size: 56px; 
        font-weight: 800; 
        color: #7c3aed; 
        margin: 0;
        line-height: 1;
      }
      .countdown-text {
        font-size: 14px;
        color: #64748b;
        margin: 12px 0 32px;
      }
      .countdown-text span {
        font-weight: 600;
        color: #7c3aed;
      }
      .btn { 
        display: block;
        width: 100%;
        text-align: center; 
        padding: 14px 24px; 
        border-radius: 12px; 
        border: none; 
        cursor: pointer; 
        font-weight: 600; 
        font-size: 15px; 
        transition: all 0.2s;
      }
      .btn:hover {
        transform: translateY(-1px);
      }
      .btn:active {
        transform: translateY(0);
      }
      .primary { 
        background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); 
        color: white; 
        margin-bottom: 12px;
        box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
      }
      .primary:hover {
        box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
      }
      .ghost { 
        background: #f1f5f9; 
        color: #64748b;
      }
      .ghost:hover {
        background: #e2e8f0;
        color: #475569;
      }
      .footer {
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid #e2e8f0;
        font-size: 13px;
        color: #94a3b8;
      }
      .footer strong {
        color: #64748b;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">🚀</div>
      <div class="title">You're being redirected</div>
      <div class="subtitle">Please wait while we take you to your destination</div>
      
      <div class="destination-label">Destination URL</div>
      <div class="box">${escapedUrl}</div>
      
      <div class="count" id="count">5</div>
      <div class="countdown-text">Redirecting in <span id="seconds">5</span> seconds...</div>
      
      <button class="btn primary" id="continue">Continue now →</button>
      <button class="btn ghost" id="cancel">Cancel and go home</button>
      
      <div class="footer">
        <strong>MinusURL</strong> — Secure URL Shortener
      </div>
    </div>
    <script>
      const target = "${escapedUrl}";
      let n = 5;
      const countEl = document.getElementById('count');
      const secondsEl = document.getElementById('seconds');
      const tick = () => {
        n -= 1;
        if (n <= 0) {
          window.location.href = target;
          return;
        }
        countEl.textContent = n;
        secondsEl.textContent = n;
        setTimeout(tick, 1000);
      };
      setTimeout(tick, 1000);
      document.getElementById('continue').onclick = () => window.location.href = target;
      document.getElementById('cancel').onclick = () => window.location.href = '/';
    </script>
  </body>
</html>`);
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Failed to redirect' });
  }
}

export async function getShortUrlStats(req: Request, res: Response) {
  try {
    const { shortId } = req.params;

    const result = await query(
      'SELECT short_id, original_url, created_at, clicks FROM shortened_urls WHERE short_id = $1',
      [shortId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
}

export async function getShortUrlInfo(req: Request, res: Response) {
  try {
    const { shortId } = req.params;

    if (!shortId || shortId.length !== 6) {
      return res.status(400).json({ error: 'Invalid short ID' });
    }

    const result = await query(
      'SELECT short_id, original_url, created_at, clicks FROM shortened_urls WHERE short_id = $1',
      [shortId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting URL info:', error);
    res.status(500).json({ error: 'Failed to get URL info' });
  }
}

// Delete shortened URL (only by owner or if public)
export async function deleteShortUrl(req: Request, res: Response) {
  try {
    const { shortId } = req.params;
    const user = (req as any).user;

    if (!shortId || shortId.length !== 6) {
      return res.status(400).json({ error: 'Invalid short ID' });
    }

    // Check if URL exists and get owner info
    const checkResult = await query(
      'SELECT short_id, user_id FROM shortened_urls WHERE short_id = $1',
      [shortId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    const urlData = checkResult.rows[0];

    // Check ownership - allow delete if:
    // 1. User is logged in and owns the URL, OR
    // 2. URL was created anonymously (user_id is null) - anyone can delete
    if (urlData.user_id !== null && (!user || user.userId !== urlData.user_id)) {
      return res.status(403).json({ error: 'You do not have permission to delete this URL' });
    }

    // Delete the URL
    await query('DELETE FROM shortened_urls WHERE short_id = $1', [shortId]);

    res.status(200).json({ message: 'Short URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting short URL:', error);
    res.status(500).json({ error: 'Failed to delete short URL' });
  }
}
