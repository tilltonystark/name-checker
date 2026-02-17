import type { BrandabilityScore } from "@/types";

/**
 * Module 6: Brandability Intelligence Layer
 * Evaluates name quality across multiple heuristics.
 */
export function scoreBrandability(name: string): BrandabilityScore {
    const cleaned = name.toLowerCase().replace(/[^a-z0-9]/g, "");

    return {
        brandabilityScore: calculateOverallBrandability(cleaned),
        pronunciationScore: calculatePronunciation(cleaned),
        memorabilityScore: calculateMemorability(cleaned),
    };
}

function calculateOverallBrandability(name: string): number {
    let score = 50;

    // Length score — sweet spot is 5-8 characters
    const len = name.length;
    if (len >= 5 && len <= 8) score += 25;
    else if (len >= 4 && len <= 10) score += 15;
    else if (len >= 3 && len <= 12) score += 5;
    else score -= 15;

    // Character simplicity — all lowercase alpha is best
    if (/^[a-z]+$/.test(name)) score += 10;
    if (name.length <= 2) score -= 20;

    // Avoid dictionary word penalty for very common words
    const commonWords = [
        "the", "and", "for", "are", "but", "not", "you", "all", "can", "her",
        "was", "one", "our", "out", "get", "has", "him", "his", "how", "its",
    ];
    if (commonWords.includes(name)) score -= 15;

    return Math.max(0, Math.min(100, score));
}

function calculatePronunciation(name: string): number {
    let score = 50;

    const vowels = (name.match(/[aeiouy]/g) || []).length;
    const consonants = (name.match(/[bcdfghjklmnpqrstvwxz]/g) || []).length;
    const total = vowels + consonants;

    if (total === 0) return 30;

    // Good vowel ratio (30-50%)
    const vowelRatio = vowels / total;
    if (vowelRatio >= 0.3 && vowelRatio <= 0.5) score += 25;
    else if (vowelRatio >= 0.2 && vowelRatio <= 0.6) score += 10;
    else score -= 15;

    // Syllable-friendly check: alternating consonant/vowel patterns
    const cvPattern = name.replace(/[aeiouy]/g, "V").replace(/[bcdfghjklmnpqrstvwxz]/g, "C");
    const alternations = (cvPattern.match(/CV|VC/g) || []).length;
    if (alternations >= name.length * 0.4) score += 15;

    // Penalize consonant clusters > 3
    const clusters = name.match(/[bcdfghjklmnpqrstvwxz]{4,}/g);
    if (clusters) score -= 20;

    return Math.max(0, Math.min(100, score));
}

function calculateMemorability(name: string): number {
    let score = 50;

    // Short names are more memorable
    if (name.length <= 6) score += 20;
    else if (name.length <= 8) score += 10;
    else if (name.length > 12) score -= 20;

    // Unique-sounding (not a common word)
    const commonWords = [
        "tech", "labs", "digital", "cloud", "global", "solutions", "services",
        "systems", "group", "network", "online", "media", "soft", "ware",
    ];
    const hasCommon = commonWords.some((w) => name.includes(w));
    if (hasCommon) score -= 10;

    // Repeating patterns are catchy
    if (/(.)\1/.test(name)) score += 5;

    // Starts with a strong consonant
    if (/^[bcdgkpst]/.test(name)) score += 5;

    return Math.max(0, Math.min(100, score));
}
