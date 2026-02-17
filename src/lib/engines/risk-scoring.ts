import type {
    DomainResults,
    WebPresenceResult,
    RegistryResult,
    RiskScore,
    StrengthLevel,
    RiskLevel,
    OverallRiskLevel,
} from "@/types";

/**
 * Module 5: Risk Scoring Engine
 * Combines signals from domain, web presence, and registry checks.
 * Never outputs "available" — always structured intelligence.
 */
export function calculateRisk(
    domains: DomainResults,
    webPresence: WebPresenceResult,
    registry: RegistryResult
): RiskScore {
    let score = 50; // Start neutral

    // ─── Domain Signals ──────────────────────────────────────────────
    const domainStrength = assessDomainStrength(domains);
    if (domainStrength === "strong") score += 30;
    else if (domainStrength === "moderate") score += 10;
    else score -= 10;

    // ─── Web Presence Signals ────────────────────────────────────────
    const webRisk = assessWebRisk(webPresence);
    if (webRisk === "high") score -= 25;
    else if (webRisk === "medium") score -= 10;
    else score += 10;

    // ─── Registry Signals ────────────────────────────────────────────
    const registryRisk = assessRegistryRisk(registry);
    if (registryRisk === "high") score -= 40;
    else if (registryRisk === "medium") score -= 15;
    else score += 10;

    // Clamp to 0-100
    const confidenceScore = Math.max(0, Math.min(100, score));

    // Overall risk
    const overallRisk = deriveOverallRisk(confidenceScore, domainStrength, webRisk, registryRisk);

    return {
        domainStrength,
        webRisk,
        registryRisk,
        overallRisk,
        confidenceScore,
    };
}

function assessDomainStrength(domains: DomainResults): StrengthLevel {
    const available = Object.values(domains).filter(
        (d) => d === "available"
    ).length;

    if (domains.com === "available" && available >= 4) return "strong";
    if (available >= 2) return "moderate";
    return "weak";
}

function assessWebRisk(web: WebPresenceResult): RiskLevel {
    return web.risk;
}

function assessRegistryRisk(registry: RegistryResult): RiskLevel {
    if (registry.exactMatches.length > 0) return "high";
    if (registry.similarMatches.length >= 3) return "high";
    if (registry.similarMatches.length >= 1) return "medium";
    return "low";
}

function deriveOverallRisk(
    confidence: number,
    _domainStrength: StrengthLevel,
    _webRisk: RiskLevel,
    _registryRisk: RiskLevel
): OverallRiskLevel {
    if (confidence >= 70) return "low";
    if (confidence >= 40) return "moderate";
    return "high";
}
