import OpenAI from "openai";
import type { GeneratedName, OverallRiskLevel, StrengthLevel } from "@/types";
import { checkDomains } from "./domain";
import { calculateRisk } from "./risk-scoring";
import { scoreBrandability } from "./brandability";

/**
 * Module 8: AI Name Generation Engine
 * Uses OpenAI to generate company names, then filters and ranks them.
 */
export async function generateNames(
    industry: string,
    description: string,
    keywords: string[] = [],
    region?: string
): Promise<GeneratedName[]> {
    const rawNames = process.env.OPENAI_API_KEY
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

async function fetchAINames(
    industry: string,
    description: string,
    keywords: string[],
    region?: string
): Promise<string[]> {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.9,
            max_tokens: 300,
        });

        const text = completion.choices[0]?.message?.content || "";
        return text
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0 && /^[a-zA-Z]+$/.test(line));
    } catch {
        return simulateNames(industry, keywords);
    }
}

function simulateNames(industry: string, keywords: string[]): string[] {
    const prefixes = ["Neo", "Flux", "Vex", "Zyn", "Qori", "Brio", "Luma", "Aero", "Kova", "Pyre"];
    const suffixes = ["ify", "ly", "ora", "ix", "eo", "ia", "ium", "ar", "en", "os"];
    const bases = ["spark", "drift", "craft", "bloom", "swift", "crest", "forge", "pulse", "wave", "mint"];

    const names: string[] = [];

    // Generate coined names
    for (let i = 0; i < 5; i++) {
        const prefix = prefixes[i % prefixes.length];
        const suffix = suffixes[(i + 3) % suffixes.length];
        names.push(prefix + suffix);
    }

    // Generate from bases
    for (let i = 0; i < 5; i++) {
        const base = bases[i % bases.length];
        names.push(base.charAt(0).toUpperCase() + base.slice(1));
    }

    // Industry-inspired
    const industryWord = industry.toLowerCase().replace(/[^a-z]/g, "").slice(0, 4);
    for (let i = 0; i < 5; i++) {
        const suffix = suffixes[i % suffixes.length];
        const coined = industryWord + suffix;
        if (coined.length >= 4 && coined.length <= 12) {
            names.push(coined.charAt(0).toUpperCase() + coined.slice(1));
        }
    }

    return [...new Set(names)].slice(0, 15);
}

function quickDomainStrength(domains: { com: string; io: string; co: string }): StrengthLevel {
    const available = [domains.com, domains.io, domains.co].filter(
        (d) => d === "available"
    ).length;
    if (domains.com === "available" && available >= 2) return "strong";
    if (available >= 1) return "moderate";
    return "weak";
}
