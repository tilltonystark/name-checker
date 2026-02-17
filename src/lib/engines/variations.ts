import type { NameVariation, OverallRiskLevel, StrengthLevel, DomainResults } from "@/types";
import { checkDomains } from "./domain";
import { calculateRisk } from "./risk-scoring";
import { scoreBrandability } from "./brandability";

/**
 * Module 7: Smart Variation Engine
 * Generates safer alternatives when risk is moderate or high.
 */
export async function generateVariations(
    name: string,
    currentRisk: OverallRiskLevel
): Promise<NameVariation[]> {
    if (currentRisk === "low") return [];

    const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const variations = createVariants(normalized);

    // Run lightweight checks on each
    const checked = await Promise.all(
        variations.map(async (variant) => {
            try {
                const domains = await checkDomains(variant);
                const domainStrength = assessQuickDomainStrength(domains);
                const brandability = scoreBrandability(variant);

                // Quick confidence estimate
                let confidence = 50;
                if (domains.com === "available") confidence += 25;
                if (domainStrength === "strong") confidence += 10;
                confidence += Math.floor(brandability.brandabilityScore * 0.15);

                const riskLevel: OverallRiskLevel =
                    confidence >= 70 ? "low" : confidence >= 40 ? "moderate" : "high";

                return {
                    name: variant,
                    confidenceScore: Math.min(100, confidence),
                    domainStrength,
                    riskLevel,
                };
            } catch {
                return null;
            }
        })
    );

    return checked
        .filter((v): v is NameVariation => v !== null)
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, 5);
}

function createVariants(name: string): string[] {
    const variants: string[] = [];

    // Suffixes
    const suffixes = ["labs", "tech", "ai", "hq", "app", "io"];
    for (const suffix of suffixes) {
        if (!name.endsWith(suffix)) variants.push(name + suffix);
    }

    // Prefixes
    const prefixes = ["get", "try", "use", "go", "my"];
    for (const prefix of prefixes) {
        if (!name.startsWith(prefix)) variants.push(prefix + name);
    }

    // Shortened form (if > 6 chars)
    if (name.length > 6) {
        variants.push(name.slice(0, Math.ceil(name.length * 0.6)));
    }

    // Double vowel removal
    const shortened = name.replace(/([aeiou])\1+/g, "$1");
    if (shortened !== name) variants.push(shortened);

    return [...new Set(variants)].slice(0, 12);
}

function assessQuickDomainStrength(domains: DomainResults): StrengthLevel {
    const available = Object.values(domains).filter(
        (d) => d === "available"
    ).length;
    if (domains.com === "available" && available >= 4) return "strong";
    if (available >= 2) return "moderate";
    return "weak";
}

