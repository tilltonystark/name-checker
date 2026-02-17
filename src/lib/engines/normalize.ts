import type { NormalizedInput } from "@/types";

/**
 * Module 1: Input Normalization Engine
 * Normalizes and generates variants for company name analysis.
 */
export function normalize(input: string): NormalizedInput {
    const trimmed = input.trim();
    const lower = trimmed.toLowerCase();
    const stripped = lower.replace(/[^a-z0-9\s]/g, "");
    const normalized = stripped.replace(/\s+/g, "");

    const variants = generateVariants(stripped, normalized);

    return {
        original: trimmed,
        normalized,
        variants: [...new Set(variants)],
    };
}

function generateVariants(cleaned: string, normalized: string): string[] {
    const variants: string[] = [normalized];

    // With spaces preserved
    const withSpaces = cleaned.replace(/\s+/g, " ").trim();
    if (withSpaces !== normalized) variants.push(withSpaces);

    // Plural form
    if (!normalized.endsWith("s")) {
        variants.push(normalized + "s");
    }

    // Singular form (if ends with s)
    if (normalized.endsWith("s") && normalized.length > 2) {
        variants.push(normalized.slice(0, -1));
    }

    // Common suffixes
    const suffixes = ["inc", "co", "llc", "ltd", "corp"];
    for (const suffix of suffixes) {
        if (!normalized.endsWith(suffix)) {
            variants.push(normalized + suffix);
        }
    }

    // ASCII equivalent (remove accents)
    const ascii = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (ascii !== normalized) variants.push(ascii);

    return variants;
}
