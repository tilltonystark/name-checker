import type { WebPresenceResult, WebRiskLevel } from "@/types";
import { cache, TTL } from "@/lib/cache";

/**
 * Module 3: Web Presence Intelligence Engine
 * Uses SerpAPI to check web presence risk. Falls back to simulation if no API key.
 */
export async function checkWebPresence(name: string): Promise<WebPresenceResult> {
    const normalized = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();
    const cacheKey = `web:${normalized}`;

    const cached = await cache.get<WebPresenceResult>(cacheKey);
    if (cached) return cached;

    let result: WebPresenceResult;

    if (process.env.SERP_API_KEY) {
        result = await fetchSerpResults(normalized);
    } else {
        result = simulateWebPresence(normalized);
    }

    await cache.set(cacheKey, result, TTL.WEB);
    return result;
}

async function fetchSerpResults(query: string): Promise<WebPresenceResult> {
    try {
        const params = new URLSearchParams({
            q: `"${query}"`,
            api_key: process.env.SERP_API_KEY!,
            engine: "google",
            num: "10",
        });

        const res = await fetch(`https://serpapi.com/search.json?${params}`, {
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return simulateWebPresence(query);

        const data = await res.json();
        const organicResults = data.organic_results || [];
        const resultCount = parseInt(data.search_information?.total_results || "0", 10);

        const topResults = organicResults.slice(0, 10).map((r: { title?: string; link?: string; snippet?: string }) => ({
            title: r.title || "",
            link: r.link || "",
            snippet: r.snippet || "",
        }));

        const hasCompanyWebsite = topResults.some(
            (r: { title: string; link: string }) =>
                r.link.includes(query.replace(/\s+/g, "")) ||
                r.title.toLowerCase().includes(query)
        );

        const sameIndustryPresence = topResults.filter(
            (r: { title: string; snippet: string }) =>
                r.title.toLowerCase().includes(query) ||
                r.snippet.toLowerCase().includes(query)
        ).length >= 3;

        const risk = classifyWebRisk(resultCount, hasCompanyWebsite, sameIndustryPresence);

        return { risk, resultCount, hasCompanyWebsite, sameIndustryPresence, topResults };
    } catch {
        return simulateWebPresence(query);
    }
}

function simulateWebPresence(query: string): WebPresenceResult {
    // Heuristic: common English words = higher risk
    const commonWords = [
        "bright", "smart", "cloud", "pixel", "flow", "hub", "core", "labs",
        "tech", "data", "wave", "spark", "bolt", "nova", "apex", "prime",
        "base", "blue", "green", "red", "digital", "global", "swift",
    ];
    const words = query.split(/\s+/);
    const commonCount = words.filter((w) => commonWords.includes(w)).length;
    const isShort = query.replace(/\s+/g, "").length <= 5;

    let risk: WebRiskLevel = "low";
    const resultCount = commonCount * 45000 + (isShort ? 80000 : 5000) + Math.floor(Math.random() * 10000);

    if (commonCount >= 2 || resultCount > 100000) {
        risk = "high";
    } else if (commonCount >= 1 || resultCount > 30000) {
        risk = "medium";
    }

    return {
        risk,
        resultCount,
        hasCompanyWebsite: commonCount >= 1,
        sameIndustryPresence: commonCount >= 2,
        topResults: [],
    };
}

function classifyWebRisk(
    resultCount: number,
    hasCompanyWebsite: boolean,
    sameIndustryPresence: boolean
): WebRiskLevel {
    if (hasCompanyWebsite && sameIndustryPresence) return "high";
    if (hasCompanyWebsite || resultCount > 100000) return "medium";
    if (resultCount > 500000) return "high";
    return "low";
}
