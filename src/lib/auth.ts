const TOKEN_KEY = 'openpaste_token';

function notifyAuthChange() {
  window.dispatchEvent(new Event('auth-change'));
}

export function getToken(): string {
  // Check both localStorage and sessionStorage for the token
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || '';
}

export function setToken(token: string, rememberMe: boolean = true) {
  // Store in localStorage for persistent sessions when rememberMe is true
  // Otherwise, use sessionStorage for session-only storage
  const storage = rememberMe ? localStorage : sessionStorage;
  
  // Clear from both storages to prevent conflicts
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  
  // Store in the appropriate storage
  storage.setItem(TOKEN_KEY, token);
  notifyAuthChange();
}

export function clearToken() {
  // Clear from both storage locations to ensure complete logout
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  notifyAuthChange();
}

export function getEmailFromToken(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return '';
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.email === 'string' ? payload.email : '';
  } catch {
    return '';
  }
}

export function getUsernameFromToken(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return '';
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload = JSON.parse(atob(padded));
    return typeof payload.username === 'string' ? payload.username : '';
  } catch {
    return '';
  }
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
