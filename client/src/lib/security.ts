/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous HTML tags and scripts
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Sanitize HTML content - allows basic formatting but removes scripts
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 6 characters (Firebase minimum)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Sanitize task title
 * Removes dangerous characters while allowing normal text
 */
export function sanitizeTaskTitle(title: string): string {
  if (typeof title !== 'string') return '';
  
  return title
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .substring(0, 200); // Max 200 characters
}

/**
 * Validate and sanitize XP reward value
 * Ensures it's a positive number within reasonable bounds
 */
export function sanitizeXPReward(xp: any): number {
  const numXP = Number(xp);
  
  if (isNaN(numXP) || numXP < 1) {
    return 10; // Default XP
  }
  
  // Cap at 1000 XP to prevent abuse
  return Math.min(Math.floor(numXP), 1000);
}

/**
 * Sanitize user name
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  
  return name
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 50); // Max 50 characters
}

/**
 * Validate duration for Pomodoro timer
 */
export function isValidDuration(duration: any): boolean {
  return duration === 25 || duration === 50;
}

/**
 * Rate limiting helper (client-side basic protection)
 */
const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(key) || [];
  
  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter(t => now - t < windowMs);
  
  if (validTimestamps.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  validTimestamps.push(now);
  rateLimitMap.set(key, validTimestamps);
  
  return true;
}

/**
 * Sanitize subject name
 */
export function sanitizeSubject(subject: string): string {
  if (typeof subject !== 'string') return '';
  
  return subject
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 100);
}
