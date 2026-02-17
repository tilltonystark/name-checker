import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedName, OverallRiskLevel, StrengthLevel, DomainResults } from "@/types";
import { checkDomains } from "./domain";
import { scoreBrandability } from "./brandability";

/**
 * Module 8: AI Name Generation Engine
 * Uses Google Gemini to generate company names, then filters and ranks them.
 */
export async function generateNames(
    industry: string,
    description: string,
    keywords: string[] = [],
    region?: string
): Promise<GeneratedName[]> {
    const rawNames = process.env.GEMINI_API_KEY
        ? await fetchAINames(industry, description, keywords, region)
        : simulateNames(industry, keywords);

    // Filter: 4-12 chars, no numbers, no special chars
    const filtered = rawNames.filter((name) => {
        const len = name.length;
        return len >= 4 && len <= 12 && /^[a-zA-Z]+$/.test(name);
    });

    // Run lightweight checks and score
    const scored = await Promise.all(
        filtered.slice(0, 15).map(async (name) => {
            try {
                const domains = await checkDomains(name);
                const brandability = scoreBrandability(name);

                const domainStrength = quickDomainStrength(domains);
                let confidence = 50;

                if (domains.com === "available") confidence += 25;
                if (domainStrength === "strong") confidence += 10;
                confidence += Math.floor(brandability.brandabilityScore * 0.15);

                const riskLevel: OverallRiskLevel =
                    confidence >= 70 ? "low" : confidence >= 40 ? "moderate" : "high";

                return {
                    name,
                    riskLevel,
                    confidenceScore: Math.min(100, confidence),
                    domainStrength,
                    brandabilityScore: brandability.brandabilityScore,
                    category: riskLevel === "low"
                        ? "low-risk" as const
                        : riskLevel === "moderate"
                            ? "moderate-risk" as const
                            : "creative" as const,
                };
            } catch {
                return null;
            }
        })
    );

    const valid = scored.filter((n): n is GeneratedName => n !== null);
    valid.sort((a, b) => b.confidenceScore - a.confidenceScore);

    // Categorize: 3 low, 3 moderate, 4 creative
    const lowRisk = valid.filter((n) => n.riskLevel === "low").slice(0, 3);
    const moderate = valid.filter((n) => n.riskLevel === "moderate").slice(0, 3);
    const creative = valid
        .filter((n) => !lowRisk.includes(n) && !moderate.includes(n))
        .slice(0, 4)
        .map((n) => ({ ...n, category: "creative" as const }));

    return [...lowRisk, ...moderate, ...creative];
}

/** Helper: wait for ms */
function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAINames(
    industry: string,
    description: string,
    keywords: string[],
    region?: string
): Promise<string[]> {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate 15 unique, creative company names for a startup.

Industry: ${industry}
Description: ${description}
${keywords.length ? `Keywords: ${keywords.join(", ")}` : ""}
${region ? `Target Region: ${region}` : ""}

Requirements:
- Each name should be 4-12 characters
- Only alphabetic characters (no numbers, hyphens, or special characters)
- Names should be memorable, modern, and brandable
- Mix of coined words, portmanteaus, and evocative real words
- Avoid generic terms like "solutions", "services", "global"

Return ONLY the names, one per line, no numbering or explanations.`;

    // Retry up to 3 times with exponential backoff for rate limits
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            console.log(`[Gemini] Attempt ${attempt + 1}/${MAX_RETRIES}...`);
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            console.log(`[Gemini] Success! Generated text:`, text.slice(0, 200));

            const names = text
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0 && /^[a-zA-Z]+$/.test(line));

            if (names.length > 0) return names;
            console.warn("[Gemini] Got response but no valid names parsed, retrying...");
        } catch (e: unknown) {
            const errMsg = e instanceof Error ? e.message : String(e);
            console.error(`[Gemini] Attempt ${attempt + 1} failed:`, errMsg);

            // If it's a rate limit error and we have retries left, wait and retry
            if (errMsg.includes("429") && attempt < MAX_RETRIES - 1) {
                const waitTime = (attempt + 1) * 15000; // 15s, 30s, 45s
                console.log(`[Gemini] Rate limited. Waiting ${waitTime / 1000}s before retry...`);
                await delay(waitTime);
                continue;
            }

            // For non-429 errors or exhausted retries, fall back
            console.error("[Gemini] All retries exhausted or non-retryable error. Using simulation fallback.");
            return simulateNames(industry, keywords);
        }
    }

    return simulateNames(industry, keywords);
}

function simulateNames(industry: string, keywords: string[]): string[] {
    const prefixes = ["Neo", "Flux", "Vex", "Zyn", "Qori", "Brio", "Luma", "Aero", "Kova", "Pyre"];
    const suffixes = ["ify", "ly", "ora", "ix", "eo", "ia", "ium", "ar", "en", "os"];
    const bases = ["spark", "drift", "craft", "bloom", "swift", "crest", "forge", "pulse", "wave", "mint"];

    const names: string[] = [];

    // Use a seed from industry + timestamp to vary results
    const seed = industry.length + Date.now();

    // Generate coined names
    for (let i = 0; i < 5; i++) {
        const prefix = prefixes[(i + (seed % prefixes.length)) % prefixes.length];
        const suffix = suffixes[(i + (seed % suffixes.length) + 3) % suffixes.length];
        names.push(prefix + suffix);
    }

    // Generate from bases
    for (let i = 0; i < 5; i++) {
        const base = bases[(i + (seed % bases.length)) % bases.length];
        names.push(base.charAt(0).toUpperCase() + base.slice(1));
    }

    // Industry-inspired
    const industryWord = industry.toLowerCase().replace(/[^a-z]/g, "").slice(0, 4);
    for (let i = 0; i < 5; i++) {
        const suffix = suffixes[(i + (seed % suffixes.length)) % suffixes.length];
        const coined = industryWord + suffix;
        if (coined.length >= 4 && coined.length <= 12) {
            names.push(coined.charAt(0).toUpperCase() + coined.slice(1));
        }
    }

    return [...new Set(names)].slice(0, 15);
}

function quickDomainStrength(domains: DomainResults): StrengthLevel {
    const available = Object.values(domains).filter(
        (d) => d === "available"
    ).length;
    if (domains.com === "available" && available >= 4) return "strong";
    if (available >= 2) return "moderate";
    return "weak";
}
