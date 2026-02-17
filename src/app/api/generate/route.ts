import { NextRequest, NextResponse } from "next/server";
import { generateNames } from "@/lib/engines/ai-generate";
import { checkRateLimit, sanitizeInput } from "@/lib/rate-limit";
import type { GenerationResponse } from "@/types";

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
        const rateCheck = checkRateLimit(ip);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: "Rate limit exceeded. Try again tomorrow." },
                { status: 429 }
            );
        }

        const body = await request.json();
        const industry = sanitizeInput(body.industry || "");
        const description = sanitizeInput(body.description || "");
        const keywords = (body.keywords || []).map((k: string) => sanitizeInput(k));
        const region = body.region;

        if (!industry || !description) {
            return NextResponse.json(
                { error: "Industry and description are required" },
                { status: 400 }
            );
        }

        const names = await generateNames(industry, description, keywords, region);

        const response: GenerationResponse = {
            names,
            industry,
            description,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(response, {
            headers: {
                "X-RateLimit-Remaining": rateCheck.remaining.toString(),
            },
        });
    } catch (error) {
        console.error("Generation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
