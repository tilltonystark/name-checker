// ─── Input / Normalization ────────────────────────────────────────────
export interface NormalizedInput {
    original: string;
    normalized: string;
    variants: string[];
}

// ─── Domain Intelligence ─────────────────────────────────────────────
export type DomainStatus = "available" | "taken" | "premium" | "error";

export interface DomainResults {
    com: DomainStatus;
    io: DomainStatus;
    co: DomainStatus;
}

// ─── Web Presence ────────────────────────────────────────────────────
export type WebRiskLevel = "low" | "medium" | "high";

export interface WebPresenceResult {
    risk: WebRiskLevel;
    resultCount: number;
    hasCompanyWebsite: boolean;
    sameIndustryPresence: boolean;
    topResults: { title: string; link: string; snippet: string }[];
}

// ─── Company Registry ────────────────────────────────────────────────
export interface RegistryMatch {
    name: string;
    jurisdiction: string;
    status: string;
    similarity: number;
}

export interface RegistryResult {
    exactMatches: RegistryMatch[];
    similarMatches: RegistryMatch[];
    jurisdictionCount: number;
}

// ─── Risk Scoring ────────────────────────────────────────────────────
export type StrengthLevel = "strong" | "moderate" | "weak";
export type RiskLevel = "low" | "medium" | "high";
export type OverallRiskLevel = "low" | "moderate" | "high";

export interface RiskScore {
    domainStrength: StrengthLevel;
    webRisk: RiskLevel;
    registryRisk: RiskLevel;
    overallRisk: OverallRiskLevel;
    confidenceScore: number; // 0-100
}

// ─── Brandability ────────────────────────────────────────────────────
export interface BrandabilityScore {
    brandabilityScore: number;    // 0-100
    pronunciationScore: number;   // 0-100
    memorabilityScore: number;    // 0-100
}

// ─── Smart Variations ────────────────────────────────────────────────
export interface NameVariation {
    name: string;
    confidenceScore: number;
    domainStrength: StrengthLevel;
    riskLevel: OverallRiskLevel;
}

// ─── AI Generated Names ─────────────────────────────────────────────
export interface GeneratedName {
    name: string;
    riskLevel: OverallRiskLevel;
    confidenceScore: number;
    domainStrength: StrengthLevel;
    brandabilityScore: number;
    category: "low-risk" | "moderate-risk" | "creative";
}

// ─── Full Analysis Response ──────────────────────────────────────────
export interface AnalysisResponse {
    input: NormalizedInput;
    domains: DomainResults;
    webPresence: WebPresenceResult;
    registry: RegistryResult;
    risk: RiskScore;
    brandability: BrandabilityScore;
    alternatives: NameVariation[];
    timestamp: string;
}

// ─── Generation Response ─────────────────────────────────────────────
export interface GenerationResponse {
    names: GeneratedName[];
    industry: string;
    description: string;
    timestamp: string;
}

// ─── API Request Bodies ──────────────────────────────────────────────
export interface AnalyzeRequest {
    name: string;
    region?: string;
}

export interface GenerateRequest {
    industry: string;
    description: string;
    keywords?: string[];
    region?: string;
}
