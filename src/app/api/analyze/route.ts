import { NextRequest, NextResponse } from "next/server";
import { normalize } from "@/lib/engines/normalize";
import { checkDomains } from "@/lib/engines/domain";
import { checkWebPresence } from "@/lib/engines/web-presence";
import { checkRegistry } from "@/lib/engines/registry";
import { calculateRisk } from "@/lib/engines/risk-scoring";
import { scoreBrandability } from "@/lib/engines/brandability";
import { generateVariations } from "@/lib/engines/variations";
import { checkRateLimit, sanitizeInput } from "@/lib/rate-limit";
import type { AnalysisResponse } from "@/types";

export async function POST(request: NextRequest) {
    try {
        // Rate limit
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const rateCheck = checkRateLimit(ip);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Try again tomorrow." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const rawName = body.name;
        const region = body.region;

        if (!rawName || typeof rawName !== "string") {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        const sanitized = sanitizeInput(rawName);
        if (sanitized.length < 2) {
            return NextResponse.json(
                { error: "Name must be at least 2 characters" },
                { status: 400 }
            );
        }

        // Step 1: Normalize
        const input = normalize(sanitized);

        // Step 2: Parallel checks
        const [domains, webPresence, registry] = await Promise.all([
            checkDomains(input.normalized),
            checkWebPresence(input.original),
            checkRegistry(input.original, region),
        ]);

        // Step 3: Risk scoring
        const risk = calculateRisk(domains, webPresence, registry);

        // Step 4: Brandability
        const brandability = scoreBrandability(input.normalized);

        // Step 5: Smart variations (only if risk >= moderate)
        const alternatives = await generateVariations(input.normalized, risk.overallRisk);

        const response: AnalysisResponse = {
            input,
            domains,
            webPresence,
            registry,
            risk,
            brandability,
            alternatives,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, {
            headers: {
                "X-RateLimit-Remaining": rateCheck.remaining.toString(),
            },
        });
    } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
