"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { NameCard } from "@/components/NameCard";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import type { GenerationResponse } from "@/types";

function GenerateContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const industry = searchParams.get("industry") || "";
    const description = searchParams.get("description") || "";
    const keywords = searchParams.get("keywords") || "";
    const region = searchParams.get("region") || "";

    const { data, isLoading, error } = useQuery<GenerationResponse>({
        queryKey: ["generate", industry, description, keywords, region],
        queryFn: async () => {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    industry,
                    description,
                    keywords: keywords
                        ? keywords.split(",").map((k) => k.trim())
                        : undefined,
                    region: region || undefined,
                }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Generation failed");
            }
            return res.json();
        },
        enabled: !!industry && !!description,
        staleTime: 5 * 60 * 1000,
    });

    if (!industry || !description) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <p style={{ color: "var(--text-muted)" }}>
                    Missing industry or description.
                </p>
                <button className="btn-primary" onClick={() => router.push("/")}>
                    ← Go Back
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Header />
            <main
                style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    padding: "40px 24px 80px",
                }}
            >
                <div style={{ marginBottom: "32px" }}>
                    <button
                        onClick={() => router.push("/")}
                        className="btn-secondary"
                        style={{ marginBottom: "16px", fontSize: "13px" }}
                    >
                        ← New Search
                    </button>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontSize: "32px",
                            fontWeight: 700,
                            margin: 0,
                            color: "var(--text-primary)",
                        }}
                    >
                        Generated Names
                    </motion.h1>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "var(--text-muted)",
                            marginTop: "4px",
                        }}
                    >
                        {industry} • {description}
                    </p>
                </div>

                {/* Loading */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card"
                        style={{ padding: "60px 40px", textAlign: "center" }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                border: "3px solid var(--bg-card)",
                                borderTopColor: "var(--accent-blue)",
                                margin: "0 auto 20px",
                                animation: "spin 1s linear infinite",
                            }}
                        />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                        <div
                            style={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                marginBottom: "8px",
                            }}
                        >
                            Generating names...
                        </div>
                        <div
                            style={{
                                fontSize: "14px",
                                color: "var(--text-muted)",
                            }}
                        >
                            Running AI generation, checking domains, and scoring brandability
                        </div>
                    </motion.div>
                )}

                {/* Error */}
                {error && (
                    <div
                        className="card"
                        style={{
                            padding: "32px",
                            textAlign: "center",
                            borderColor: "rgba(239, 68, 68, 0.3)",
                        }}
                    >
                        <p style={{ color: "#ef4444", fontSize: "16px" }}>
                            {(error as Error).message}
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => router.push("/")}
                            style={{ marginTop: "16px" }}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Results */}
                {data && data.names.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
                    >
                        {/* Summary */}
                        <div
                            className="card"
                            style={{
                                padding: "24px",
                                textAlign: "center",
                                fontSize: "15px",
                            }}
                        >
                            <span style={{ color: "var(--accent-blue)", fontWeight: 600 }}>
                                {data.names.length}
                            </span>{" "}
                            <span style={{ color: "var(--text-secondary)" }}>
                                names generated and scored
                            </span>
                        </div>

                        {/* Categories */}
                        {["low-risk", "moderate-risk", "creative"].map((cat) => {
                            const names = data.names.filter((n) => n.category === cat);
                            if (names.length === 0) return null;
                            const label =
                                cat === "low-risk"
                                    ? "🟢 Low Risk"
                                    : cat === "moderate-risk"
                                        ? "🟡 Moderate Risk"
                                        : "🎨 Creative Ideas";

                            return (
                                <div key={cat}>
                                    <h2
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            color: "var(--text-secondary)",
                                            margin: "0 0 12px",
                                        }}
                                    >
                                        {label}
                                    </h2>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "10px",
                                        }}
                                    >
                                        {names.map((n, i) => (
                                            <NameCard
                                                key={n.name}
                                                name={n.name}
                                                risk={n.riskLevel}
                                                confidence={n.confidenceScore}
                                                domainStrength={n.domainStrength}
                                                brandability={n.brandabilityScore}
                                                category={n.category}
                                                delay={i * 0.08}
                                                onClick={() =>
                                                    router.push(
                                                        `/results?name=${encodeURIComponent(n.name)}`
                                                    )
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <LegalDisclaimer />
                    </motion.div>
                )}

                {data && data.names.length === 0 && (
                    <div
                        className="card"
                        style={{ padding: "40px", textAlign: "center" }}
                    >
                        <p style={{ color: "var(--text-muted)" }}>
                            No names could be generated. Try different keywords or industry.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function GeneratePage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        minHeight: "100vh",
                        background: "var(--bg-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-muted)",
                    }}
                >
                    Loading...
                </div>
            }
        >
            <GenerateContent />
        </Suspense>
    );
}
