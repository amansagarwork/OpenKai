import { Request, Response } from 'express';

// Language detection patterns
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  javascript: [/\.js$/, /\.jsx$/, /javascript/gi],
  typescript: [/\.ts$/, /\.tsx$/, /typescript/gi],
  python: [/\.py$/, /python/gi],
  html: [/\.html$/, /html/gi],
  css: [/\.css$/, /css/gi],
  json: [/\.json$/, /json/gi],
  sql: [/\.sql$/, /sql/gi],
  markdown: [/\.md$/, /markdown/gi],
};

// Common lint rules for different languages
const LINT_RULES: Record<string, Array<{ pattern: RegExp; message: string; severity: 'error' | 'warning' | 'info' }>> = {
  javascript: [
    { pattern: /console\.(log|debug|info|warn|error)/g, message: 'Remove console statement before committing', severity: 'warning' },
    { pattern: /debugger/g, message: 'Remove debugger statement', severity: 'error' },
    { pattern: /var\s+\w+\s*=/g, message: 'Use let or const instead of var', severity: 'warning' },
    { pattern: /==[^=]/g, message: 'Use === instead of == for strict equality', severity: 'warning' },
    { pattern: /!=\s*null/g, message: 'Use !== for strict inequality check', severity: 'warning' },
    { pattern: /function\s+\w+\s*\(\)\s*{/g, message: 'Consider using arrow functions', severity: 'info' },
    { pattern: /setTimeout\s*\(\s*function/g, message: 'Consider using async/await or Promises', severity: 'info' },
    { pattern: /\/\/\s*TODO/g, message: 'TODO comment found', severity: 'info' },
    { pattern: /\/\/\s*FIXME/g, message: 'FIXME comment found', severity: 'warning' },
    { pattern: /eval\(/g, message: 'Avoid using eval() - security risk', severity: 'error' },
    // Link checking rules for fetch/axios
    { pattern: /fetch\s*\(\s*["'][^"']*(?:test|example|dummy|fake|invalid|broken)[^"']*["']/gi, message: 'Suspicious fetch URL - may be a test/broken endpoint', severity: 'warning' },
    { pattern: /axios\.(get|post|put|delete)\s*\(\s*["'][^"']*(?:test|example|dummy|fake|invalid)[^"']*["']/gi, message: 'Suspicious axios URL - may be a test endpoint', severity: 'warning' },
    { pattern: /fetch\s*\(\s*["'][^"']*localhost[^"']*["']/gi, message: 'Fetch URL points to localhost - may not work in production', severity: 'warning' },
    { pattern: /fetch\s*\(\s*["'][^"']*127\.0\.0\.1[^"']*["']/gi, message: 'Fetch URL points to 127.0.0.1 - may not work in production', severity: 'warning' },
  ],
  typescript: [
    { pattern: /console\.(log|debug|info|warn|error)/g, message: 'Remove console statement before committing', severity: 'warning' },
    { pattern: /debugger/g, message: 'Remove debugger statement', severity: 'error' },
    { pattern: /any\s*$/gm, message: 'Avoid using any type - be more specific', severity: 'warning' },
    { pattern: /as\s+any/g, message: 'Avoid type casting to any', severity: 'warning' },
    { pattern: /@ts-ignore/g, message: 'Remove @ts-ignore and fix the type error', severity: 'warning' },
    { pattern: /!important/g, message: 'Avoid !important in CSS', severity: 'warning' },
    { pattern: /console\.(log|debug|info|warn|error)/g, message: 'Remove console statement', severity: 'warning' },
    { pattern: /\/\/\s*TODO/g, message: 'TODO comment found', severity: 'info' },
    { pattern: /\/\/\s*FIXME/g, message: 'FIXME comment found', severity: 'warning' },
    // Link checking rules for TypeScript
    { pattern: /fetch\s*\(\s*["'][^"']*(?:test|example|dummy|fake|invalid|broken)[^"']*["']/gi, message: 'Suspicious fetch URL - may be a test endpoint', severity: 'warning' },
    { pattern: /axios\.(get|post|put|delete)\s*\(\s*["'][^"']*(?:test|example|dummy|fake|invalid)[^"']*["']/gi, message: 'Suspicious axios URL - may be a test endpoint', severity: 'warning' },
    { pattern: /fetch\s*\(\s*["'][^"']*localhost[^"']*["']/gi, message: 'Fetch URL points to localhost - may not work in production', severity: 'warning' },
  ],
  python: [
    { pattern: /print\(/g, message: 'Remove print statements or use logging module', severity: 'warning' },
    { pattern: /import\s+\*/g, message: 'Avoid wildcard imports', severity: 'warning' },
    { pattern: /def\s+\w+\s*\(\)\s*:/g, message: 'Consider adding type hints to function parameters', severity: 'info' },
    { pattern: /#\s*TODO/g, message: 'TODO comment found', severity: 'info' },
    { pattern: /#\s*FIXME/g, message: 'FIXME comment found', severity: 'warning' },
    { pattern: /\t/g, message: 'Use spaces instead of tabs (PEP 8)', severity: 'warning' },
    { pattern: /len\([^)]+\)\s*==\s*0/g, message: 'Use "not list" instead of "len == 0"', severity: 'warning' },
    { pattern: /len\([^)]+\)\s*>\s*0/g, message: 'Use "if list" instead of "len > 0"', severity: 'info' },
  ],
  html: [
    { pattern: /<br\s*>/gi, message: 'Use <br/> sparingly - consider CSS for spacing', severity: 'info' },
    { pattern: /<div\s+style/g, message: 'Avoid inline styles - use CSS classes', severity: 'warning' },
    { pattern: /onclick/g, message: 'Consider using event listeners instead of inline handlers', severity: 'info' },
    { pattern: /<font/g, message: 'Remove <font> tag - use CSS instead', severity: 'error' },
    { pattern: /<center>/gi, message: 'Remove <center> tag - use CSS text-align', severity: 'error' },
    // Deep Link Checking Rules
    { pattern: /href\s*=\s*["']javascript:/gi, message: 'Avoid javascript: in href - potential XSS vector', severity: 'error' },
    { pattern: /href\s*=\s*["']data:/gi, message: 'data: URLs can be used for XSS - avoid in production', severity: 'warning' },
    { pattern: /href\s*=\s*["']mailto:/gi, message: 'mailto: links expose email addresses - consider using a contact form', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*\.xyz[^"']*["']/gi, message: 'Suspicious TLD (.xyz) - may be a spam/malicious domain', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\.top[^"']*["']/gi, message: 'Suspicious TLD (.top) - commonly used for spam', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\.gq[^"']*["']/gi, message: 'Suspicious TLD (.gx) - commonly used for malicious domains', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\.tk[^"']*["']/gi, message: 'Suspicious TLD (.tk) - free domain often used for spam', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\.ml[^"']*["']/gi, message: 'Suspicious TLD (.ml) - commonly used for malicious domains', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\.cf[^"']*["']/gi, message: 'Suspicious TLD (.cf) - free domain often abused', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\.ga[^"']*["']/gi, message: 'Suspicious TLD (.ga) - free domain often used for spam', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\.work[^"']*["']/gi, message: 'Suspicious TLD (.work) - may be a low-quality domain', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*\.click[^"']*["']/gi, message: 'Suspicious TLD (.click) - commonly used for tracking/malicious', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*\.link[^"']*["']/gi, message: 'Suspicious TLD (.link) - may be a tracking domain', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*bit\.ly[^"']*["']/gi, message: 'URL shortener detected - original URL is hidden', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*tinyurl[^"']*["']/gi, message: 'URL shortener detected - original URL is hidden', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*goo\.gl[^"']*["']/gi, message: 'URL shortener detected - original URL is hidden', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*ow\.ly[^"']*["']/gi, message: 'URL shortener detected - original URL is hidden', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*t\.co[^"']*["']/gi, message: 'URL shortener detected - original URL is hidden', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*is\.gd[^"']*["']/gi, message: 'URL shortener detected - original URL is hidden', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*buff\.ly[^"']*["']/gi, message: 'URL shortener detected - original URL is hidden', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*localhost[^"']*["']/gi, message: 'Link points to localhost - will not work in production', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*127\.0\.0\.1[^"']*["']/gi, message: 'Link points to 127.0.0.1 - will not work in production', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*0\.0\.0\.0[^"']*["']/gi, message: 'Link points to 0.0.0.0 - invalid IP address', severity: 'error' },
    { pattern: /href\s*=\s*["'][^"']*[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}[^"']*["']/gi, message: 'Direct IP address in link - may be suspicious', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*(?:test|example|dummy|fake|invalid|broken)[^"']*["']/gi, message: 'Suspicious link URL - may be a test/broken link', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*(?:does-not-exist|not-exist|missing-page|broken-link|dead-link|404-test|invalid-url)[^"']*["']/gi, message: 'URL contains broken link indicator - likely a test/invalid link', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*[0-9]{4,}\.com[^"']*["']/gi, message: 'Suspicious numeric domain - may be a test/invalid URL', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*(?:domain|site|page|url|link)[^"']*(?:does|not|invalid|broken|missing|fake|dummy|test)[^"']*["']/gi, message: 'Suspicious URL with broken/invalid indicators', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\.com\/[a-z-]*[0-9]{4,}[^"']*["']/gi, message: 'URL with random numbers in path - may be test data', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*@[^"']*["']/gi, message: 'Link contains @ symbol - potential phishing indicator', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*%40[^"']*["']/gi, message: 'URL encoded @ symbol - potential phishing indicator', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*\/\/[^\/][^"']*["']/gi, message: 'Protocol-relative URL - consider using explicit https://', severity: 'info' },
    { pattern: /href\s*=\s*["'][^"']*\.\.\/[^"']*["']/gi, message: 'Path traversal (../) in link - may lead to unexpected location', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*file:\/\/[^"']*["']/gi, message: 'file:// URL detected - may expose local files', severity: 'error' },
    { pattern: /href\s*=\s*["'][^"']*ftp:\/\/[^"']*["']/gi, message: 'FTP URL detected - insecure protocol', severity: 'warning' },
    { pattern: /href\s*=\s*["'][^"']*tel:[^"']*["']/gi, message: 'tel: link exposes phone number', severity: 'info' },
  ],
  markdown: [
    { pattern: /\[ \]/g, message: 'Empty checkbox - complete or remove', severity: 'info' },
    { pattern: /```\s*$/gm, message: 'Unclosed code block', severity: 'error' },
    // Markdown link checking
    { pattern: /\[.*?\]\(https?:\/\/[^)]*(?:test|example|dummy|fake|invalid|broken)[^)]*\)/gi, message: 'Suspicious markdown link - may be a test/broken link', severity: 'warning' },
    { pattern: /\[.*?\]\(https?:\/\/[^)]*(?:does-not-exist|not-exist|missing-page|broken-link)[^)]*\)/gi, message: 'Markdown link contains broken link indicator', severity: 'warning' },
    { pattern: /\[.*?\]\(https?:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+[^)]*\)/gi, message: 'Markdown link uses IP address - may not work in production', severity: 'warning' },
    { pattern: /\[.*?\]\(https?:\/\/[^)]*(?:\.xyz|\.top|\.gq|\.tk|\.ml|\.cf|\.ga|\.work|\.click|\.link)[^)]*\)/gi, message: 'Markdown link uses suspicious TLD', severity: 'info' },
    { pattern: /\[.*?\]\(https?:\/\/[^)]*[0-9]{5,}\.com[^)]*\)/gi, message: 'Markdown link has suspicious numeric domain', severity: 'info' },
  ],
  css: [
    { pattern: /!important/g, message: 'Avoid !important - use specific selectors', severity: 'warning' },
    { pattern: /color:\s*#[0-9a-f]{3}(?![\da-f])/gi, message: 'Use full 6-digit hex colors', severity: 'warning' },
    { pattern: /z-index:\s*\d+/g, message: 'Consider using a z-index scale system', severity: 'info' },
    { pattern: /position:\s*fixed/g, message: 'Fixed positioning may cause issues on mobile', severity: 'info' },
    { pattern: /display:\s*flex;\s*display:\s*flex/g, message: 'Duplicate flex display', severity: 'error' },
  ],
  sql: [
    { pattern: /SELECT\s*\*/gi, message: 'Avoid SELECT * - specify columns explicitly', severity: 'warning' },
    { pattern: /LIKE\s+'%[^%]+%'/gi, message: 'Leading wildcard in LIKE may cause performance issues', severity: 'warning' },
    { pattern: /ORDER BY\s+RAND\(\)/gi, message: 'RAND() in ORDER BY is very slow on large tables', severity: 'error' },
    { pattern: /INSERT INTO\s+\w+\s+VALUES\s*\(\s*\)/gi, message: 'Empty INSERT statement', severity: 'error' },
    { pattern: /--\s*TODO/g, message: 'TODO comment found', severity: 'info' },
  ],
  json: [
    { pattern: /,\s*}/g, message: 'Remove trailing comma before closing brace', severity: 'error' },
    { pattern: /,\s*\]/g, message: 'Remove trailing comma before closing bracket', severity: 'error' },
  ],
};

// Detect language from code content
function detectLanguage(code: string, filename?: string): string {
  // Check filename first
  if (filename) {
    for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(filename)) {
          return lang;
        }
      }
    }
  }

  // Check content for shebang
  if (code.startsWith('#!')) {
    if (code.includes('python') || code.includes('python3')) return 'python';
    if (code.includes('node')) return 'javascript';
    if (code.includes('bash') || code.includes('sh')) return 'bash';
  }

  // Check for common patterns
  const lowerCode = code.toLowerCase();
  
  if (lowerCode.includes('interface ') && lowerCode.includes(': string')) return 'typescript';
  if (lowerCode.includes('import ') && lowerCode.includes(' from ')) {
    if (lowerCode.includes(': ') && lowerCode.includes('function')) return 'typescript';
    if (lowerCode.includes('require(')) return 'javascript';
    return lowerCode.includes('from ') && lowerCode.includes('import') ? 'javascript' : 'typescript';
  }
  if (lowerCode.includes('def ') && lowerCode.includes(':')) return 'python';
  if (lowerCode.includes('function ') || lowerCode.includes('=>')) return 'javascript';
  if (lowerCode.includes('<!doctype html') || lowerCode.includes('<html')) return 'html';
  if (lowerCode.includes('{') && lowerCode.includes('}') && lowerCode.includes(':')) {
    if (/^\s*["']?\w+["']?\s*:/.test(code)) return 'json';
  }

  return 'javascript'; // Default
}

// Analyze code for lint issues
function analyzeCode(code: string, language: string): Array<{ line: number; column: number; message: string; severity: 'error' | 'warning' | 'info'; rule: string }> {
  const issues: Array<{ line: number; column: number; message: string; severity: 'error' | 'warning' | 'info'; rule: string }> = [];
  const rules = LINT_RULES[language] || LINT_RULES.javascript;
  
  const lines = code.split('\n');
  
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];
    
    for (const rule of rules) {
      const matches = line.matchAll(rule.pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          issues.push({
            line: lineIndex + 1,
            column: match.index + 1,
            message: rule.message,
            severity: rule.severity,
            rule: rule.pattern.source,
          });
        }
      }
    }
  }

  // Sort by severity (errors first)
  const severityOrder = { error: 0, warning: 1, info: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return issues;
}

// Calculate code quality metrics
function calculateMetrics(code: string): { lines: number; characters: number; words: number; functions: number; comments: number } {
  const lines = code.split('\n');
  const characters = code.length;
  const words = code.split(/\s+/).filter(w => w.length > 0).length;
  
  // Count functions
  const functionRegex = /(?:function\s+\w+|const\s+\w+\s*=|let\s+\w+\s*=|=>)/g;
  const functions = (code.match(functionRegex) || []).length;
  
  // Count comments
  const singleLineComments = (code.match(/\/\/.*$/gm) || []).length;
  const multiLineComments = (code.match(/\/\*[\s\S]*?\*\//g) || []).length;
  const comments = singleLineComments + multiLineComments;

  return { lines: lines.length, characters, words, functions, comments };
}

// Extract all URLs from code
function extractUrls(code: string): string[] {
  const urls: string[] = [];
  
  // HTML href patterns
  const hrefRegex = /href\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = hrefRegex.exec(code)) !== null) {
    if (match[1] && !match[1].startsWith('#') && !match[1].startsWith('javascript:')) {
      urls.push(match[1]);
    }
  }
  
  // Markdown link patterns: [text](url)
  const mdLinkRegex = /\[.*?\]\((https?:\/\/[^)]+)\)/gi;
  while ((match = mdLinkRegex.exec(code)) !== null) {
    if (match[1]) urls.push(match[1]);
  }
  
  // fetch/axios URL patterns
  const fetchRegex = /(?:fetch|axios)\s*\(\s*["']([^"']+)["']/gi;
  while ((match = fetchRegex.exec(code)) !== null) {
    if (match[1]) urls.push(match[1]);
  }
  
  // Generic URL pattern in code
  const urlRegex = /(?:https?:\/\/)[^\s"'`)>]+/gi;
  while ((match = urlRegex.exec(code)) !== null) {
    if (match[0] && !urls.includes(match[0])) {
      urls.push(match[0]);
    }
  }
  
  return [...new Set(urls)];
}

// Verify a single URL (using native fetch with timeout)
async function verifyUrl(url: string): Promise<{ url: string; status: number | null; ok: boolean; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout
  
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'LinkChecker/1.0',
      },
    });
    
    clearTimeout(timeout);
    
    return {
      url,
      status: response.status,
      ok: response.status < 400,
    };
  } catch (error: any) {
    clearTimeout(timeout);
    
    if (error.name === 'AbortError') {
      return { url, status: null, ok: false, error: 'timeout' };
    }
    
    return {
      url,
      status: null,
      ok: false,
      error: error.code || 'network_error',
    };
  }
}

// Verify multiple URLs with concurrency limit
async function verifyUrls(urls: string[]): Promise<Array<{ url: string; status: number | null; ok: boolean; error?: string }>> {
  const CONCURRENCY_LIMIT = 5;
  const results: Array<{ url: string; status: number | null; ok: boolean; error?: string }> = [];
  
  for (let i = 0; i < urls.length; i += CONCURRENCY_LIMIT) {
    const batch = urls.slice(i, i + CONCURRENCY_LIMIT);
    const batchResults = await Promise.all(batch.map(verifyUrl));
    results.push(...batchResults);
  }
  
  return results;
}

// Main lint check endpoint
export const checkLint = async (req: Request, res: Response) => {
  try {
    const { code, filename, verifyLinks } = req.body as { code?: string; filename?: string; verifyLinks?: boolean };

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required' });
    }

    if (code.length > 100000) {
      return res.status(400).json({ error: 'Code too long (max 100,000 characters)' });
    }

    const language = detectLanguage(code, filename);
    const issues = analyzeCode(code, language);
    const metrics = calculateMetrics(code);

    // Extract and optionally verify URLs
    let linkResults: Array<{ url: string; status: number | null; ok: boolean; error?: string }> = [];
    if (verifyLinks === true) {
      const urls = extractUrls(code);
      if (urls.length > 0) {
        linkResults = await verifyUrls(urls);
      }
    }

    // Calculate score
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const infoCount = issues.filter(i => i.severity === 'info').length;
    
    let score = 100;
    score -= errorCount * 5;
    score -= warningCount * 2;
    score -= infoCount * 0.5;
    score = Math.max(0, Math.min(100, score));

    const summary = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Improvement' : 'Poor';

    res.status(200).json({
      language,
      issues,
      metrics,
      links: linkResults,
      summary: {
        score,
        total: issues.length,
        errors: errorCount,
        warnings: warningCount,
        info: infoCount,
        rating: summary,
        brokenLinks: linkResults.filter(l => !l.ok).length,
        totalLinks: linkResults.length,
      },
    });
  } catch (error) {
    console.error('Lint check error:', error);
    res.status(500).json({ error: 'Failed to analyze code' });
  }
};

// Verify links endpoint - for standalone URL checking
export const verifyLinks = async (req: Request, res: Response) => {
  try {
    const { urls } = req.body as { urls?: string[] };

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    if (urls.length > 50) {
      return res.status(400).json({ error: 'Too many URLs (max 50)' });
    }

    const results = await verifyUrls(urls);

    res.status(200).json({
      results,
      summary: {
        total: results.length,
        working: results.filter(r => r.ok).length,
        broken: results.filter(r => !r.ok).length,
      },
    });
  } catch (error) {
    console.error('Verify links error:', error);
    res.status(500).json({ error: 'Failed to verify links' });
  }
};

// Get supported languages
export const getSupportedLanguages = async (_req: Request, res: Response) => {
  res.status(200).json({
    languages: Object.keys(LANGUAGE_PATTERNS),
    rules: Object.keys(LINT_RULES),
  });
};
