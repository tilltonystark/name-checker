import dns from "dns";
import { promisify } from "util";
import type { DomainResults, DomainStatus } from "@/types";
import { cache, TTL } from "@/lib/cache";

const resolveDns = promisify(dns.resolve);

/**
 * Module 2: Domain Intelligence Engine
 * Checks domain availability for .com, .io, .co using DNS resolution.
 */
export async function checkDomains(name: string): Promise<DomainResults> {
    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cacheKey = `domain:${normalized}`;

    // Check cache
    const cached = await cache.get<DomainResults>(cacheKey);
    if (cached) return cached;

    const extensions = ["com", "io", "co"] as const;
    const results: Record<string, DomainStatus> = {};

    await Promise.all(
        extensions.map(async (ext) => {
            const domain = `${normalized}.${ext}`;
            try {
                await resolveDns(domain);
                // DNS resolved → domain is taken
                results[ext] = "taken";
            } catch (err: unknown) {
                const error = err as NodeJS.ErrnoException;
                if (error.code === "ENOTFOUND" || error.code === "ENODATA") {
                    results[ext] = "available";
                } else if (error.code === "ETIMEOUT" || error.code === "TIMEOUT") {
                    results[ext] = "error";
                } else {
                    // Assume available if we can't resolve
                    results[ext] = "available";
                }
            }
        })
    );

    const domainResults: DomainResults = {
        com: results.com || "error",
        io: results.io || "error",
        co: results.co || "error",
    };

    await cache.set(cacheKey, domainResults, TTL.DOMAIN);
    return domainResults;
}
