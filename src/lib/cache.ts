/**
 * In-memory cache with TTL support.
 * Redis-compatible interface — swap to ioredis later for production.
 */

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

class MemoryCache {
    private store = new Map<string, CacheEntry<unknown>>();

    async get<T>(key: string): Promise<T | null> {
        const entry = this.store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return entry.value as T;
    }

    async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlSeconds * 1000,
        });
    }

    async del(key: string): Promise<void> {
        this.store.delete(key);
    }

    async flush(): Promise<void> {
        this.store.clear();
    }

    get size(): number {
        return this.store.size;
    }
}

// Singleton
export const cache = new MemoryCache();

// TTL constants (in seconds)
export const TTL = {
    DOMAIN: 24 * 60 * 60,     // 24 hours
    REGISTRY: 7 * 24 * 60 * 60, // 7 days
    WEB: 60 * 60,               // 1 hour
} as const;
