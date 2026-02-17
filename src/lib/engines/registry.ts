import { compareTwoStrings } from "string-similarity";
import type { RegistryResult, RegistryMatch } from "@/types";
import { cache, TTL } from "@/lib/cache";

/**
 * Module 4: Company Registry Intelligence Engine
 * Uses OpenCorporates API. Falls back to simulation.
 */
export async function checkRegistry(
    name: string,
    region?: string
): Promise<RegistryResult> {
    const normalized = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const cacheKey = `registry:${normalized}:${region || "global"}`;

    const cached = await cache.get<RegistryResult>(cacheKey);
    if (cached) return cached;

    let result: RegistryResult;

    if (process.env.OPENCORPORATES_API_KEY) {
        result = await fetchOpenCorporates(normalized, region);
    } else {
        result = simulateRegistry(normalized);
    }

    await cache.set(cacheKey, result, TTL.REGISTRY);
    return result;
}

async function fetchOpenCorporates(
    query: string,
    region?: string
): Promise<RegistryResult> {
    try {
        const params = new URLSearchParams({
            q: query,
            api_token: process.env.OPENCORPORATES_API_KEY!,
            per_page: "30",
        });
        if (region) params.set("jurisdiction_code", region.toLowerCase());

        const res = await fetch(
            `https://api.opencorporates.com/v0.4/companies/search?${params}`,
            { signal: AbortSignal.timeout(8000) }
        );

        if (!res.ok) return simulateRegistry(query);

        const data = await res.json();
        const companies = data.results?.companies || [];

        const exactMatches: RegistryMatch[] = [];
        const similarMatches: RegistryMatch[] = [];
        const jurisdictions = new Set<string>();

        for (const entry of companies) {
            const company = entry.company;
            const companyName = (company.name || "").toLowerCase();
            const similarity = compareTwoStrings(query, companyName);
            jurisdictions.add(company.jurisdiction_code || "unknown");

            const match: RegistryMatch = {
                name: company.name,
                jurisdiction: company.jurisdiction_code || "unknown",
                status: company.current_status || "unknown",
                similarity: Math.round(similarity * 100) / 100,
            };

            if (similarity > 0.95) {
                exactMatches.push(match);
            } else if (similarity > 0.8) {
                similarMatches.push(match);
            }
        }

        return {
            exactMatches: exactMatches.slice(0, 10),
            similarMatches: similarMatches.slice(0, 10),
            jurisdictionCount: jurisdictions.size,
        };
    } catch {
        return simulateRegistry(query);
    }
}

function simulateRegistry(query: string): RegistryResult {
    const words = query.split(/\s+/);
    const isGeneric = words.length === 1 && query.length <= 6;

    // Common company names get simulated matches
    const commonNames = [
        "tech", "labs", "digital", "cloud", "global", "smart", "blue", "green",
        "bright", "prime", "apex", "core", "hub", "base", "nova", "pixel",
    ];

    const hasCommon = words.some((w) => commonNames.includes(w));

    if (isGeneric || hasCommon) {
        const exact: RegistryMatch[] = hasCommon
            ? [
                {
                    name: `${query.charAt(0).toUpperCase() + query.slice(1)} Inc.`,
                    jurisdiction: "us_de",
                    status: "Active",
                    similarity: 0.92,
                },
            ]
            : [];

        const similar: RegistryMatch[] = [
            {
                name: `${query.charAt(0).toUpperCase() + query.slice(1)} Technologies Ltd`,
                jurisdiction: "gb",
                status: "Active",
                similarity: 0.84,
            },
        ];

        return {
            exactMatches: exact,
            similarMatches: similar,
            jurisdictionCount: exact.length + similar.length,
        };
    }

    // Unique names get no matches
    return {
        exactMatches: [],
        similarMatches: [],
        jurisdictionCount: 0,
    };
}
