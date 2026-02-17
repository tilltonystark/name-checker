/**
 * Rate limiter — in-memory, per-IP.
 * 10 requests per day per IP (free tier).
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const LIMIT = 10;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export function checkRateLimit(ip: string): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
} {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return { allowed: true, remaining: LIMIT - 1, resetAt: now + WINDOW_MS };
    }

    if (entry.count >= LIMIT) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: LIMIT - entry.count, resetAt: entry.resetAt };
}

export function sanitizeInput(input: string): string {
    return input
        .replace(/<[^>]*>/g, "")        // Strip HTML tags
        .replace(/[<>"'&;]/g, "")       // Remove XSS chars
        .trim()
        .slice(0, 100);                 // Max 100 chars
}
