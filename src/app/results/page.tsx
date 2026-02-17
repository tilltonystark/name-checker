"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { RiskBadge } from "@/components/RiskBadge";
import { DomainCard } from "@/components/DomainCard";
import { ScoreGauge } from "@/components/ScoreGauge";
import { ProgressSteps } from "@/components/ProgressSteps";
import { NameCard } from "@/components/NameCard";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import type { AnalysisResponse } from "@/types";

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const name = searchParams.get("name") || "";
    const region = searchParams.get("region") || "";

    const { data, isLoading, error } = useQuery<AnalysisResponse>({
        queryKey: ["analyze", name, region],
        queryFn: async () => {
            const res = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, region: region || undefined }),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Analysis failed");
            }
            return res.json();
        },
        enabled: !!name,
        staleTime: 5 * 60 * 1000,
    });

    if (!name) {
        return (
            <div style={{ textAlign: "center", marginTop: "100px" }}>
                <p style={{ color: "var(--text-muted)" }}>No name specified.</p>
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
                {/* Back + Title */}
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
                        Analysis: &quot;{name}&quot;
                    </motion.h1>
                    {region && (
                        <p
                            style={{
                                fontSize: "14px",
                                color: "var(--text-muted)",
                                marginTop: "4px",
                            }}
                        >
                            Region: {region.toUpperCase()}
                        </p>
                    )}
                </div>

                {/* Loading State */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="card"
                        style={{ padding: "40px", textAlign: "center" }}
                    >
                        <div
                            style={{
                                fontSize: "20px",
                                fontWeight: 600,
                                marginBottom: "24px",
                                color: "var(--text-primary)",
                            }}
                        >
                            Analyzing &quot;{name}&quot;...
                        </div>
                        <ProgressSteps
                            steps={[
                                { label: "Checking domain availability", done: false },
                                { label: "Scanning company registries", done: false },
                                { label: "Analyzing web presence", done: false },
                                { label: "Calculating risk scores", done: false },
                            ]}
                        />
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
                {data && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{ display: "flex", flexDirection: "column", gap: "24px" }}
                    >
                        {/* Risk Overview */}
                        <div
                            className="card"
                            style={{
                                padding: "32px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "20px",
                            }}
                        >
                            <RiskBadge
                                risk={data.risk.overallRisk}
                                size="lg"
                                showScore
                                score={data.risk.confidenceScore}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    gap: "32px",
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                }}
                            >
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "var(--text-muted)",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Domain Strength
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            color:
                                                data.risk.domainStrength === "strong"
                                                    ? "#22c55e"
                                                    : data.risk.domainStrength === "moderate"
                                                        ? "#eab308"
                                                        : "#ef4444",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {data.risk.domainStrength}
                                    </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "var(--text-muted)",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Web Risk
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            color:
                                                data.risk.webRisk === "low"
                                                    ? "#22c55e"
                                                    : data.risk.webRisk === "medium"
                                                        ? "#eab308"
                                                        : "#ef4444",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {data.risk.webRisk}
                                    </div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: "12px",
                                            color: "var(--text-muted)",
                                            marginBottom: "4px",
                                        }}
                                    >
                                        Registry Risk
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "15px",
                                            fontWeight: 600,
                                            color:
                                                data.risk.registryRisk === "low"
                                                    ? "#22c55e"
                                                    : data.risk.registryRisk === "medium"
                                                        ? "#eab308"
                                                        : "#ef4444",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {data.risk.registryRisk}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Domains */}
                        <div className="card" style={{ padding: "24px" }}>
                            <h2
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    margin: "0 0 16px",
                                    color: "var(--text-primary)",
                                }}
                            >
                                🌐 Domain Availability
                            </h2>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "10px",
                                }}
                            >
                                <DomainCard
                                    extension="com"
                                    status={data.domains.com}
                                    name={data.input.normalized}
                                    delay={0.1}
                                />
                                <DomainCard
                                    extension="io"
                                    status={data.domains.io}
                                    name={data.input.normalized}
                                    delay={0.2}
                                />
                                <DomainCard
                                    extension="co"
                                    status={data.domains.co}
                                    name={data.input.normalized}
                                    delay={0.3}
                                />
                            </div>
                        </div>

                        {/* Registry */}
                        <div className="card" style={{ padding: "24px" }}>
                            <h2
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    margin: "0 0 16px",
                                    color: "var(--text-primary)",
                                }}
                            >
                                🏢 Company Registry
                            </h2>
                            {data.registry.exactMatches.length === 0 &&
                                data.registry.similarMatches.length === 0 ? (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "16px",
                                        background: "rgba(34, 197, 94, 0.06)",
                                        borderRadius: "var(--radius-md)",
                                        fontSize: "14px",
                                        color: "#22c55e",
                                    }}
                                >
                                    ✓ No matching companies found in registries
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {data.registry.exactMatches.length > 0 && (
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#ef4444",
                                                    fontWeight: 500,
                                                    marginBottom: "8px",
                                                }}
                                            >
                                                Exact Matches ({data.registry.exactMatches.length})
                                            </div>
                                            {data.registry.exactMatches.map((m, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        padding: "10px 14px",
                                                        background: "rgba(239, 68, 68, 0.06)",
                                                        borderRadius: "var(--radius-sm)",
                                                        fontSize: "13px",
                                                        marginBottom: "4px",
                                                    }}
                                                >
                                                    <strong>{m.name}</strong>
                                                    <span style={{ color: "var(--text-muted)", marginLeft: "8px" }}>
                                                        {m.jurisdiction.toUpperCase()} • {m.status} •{" "}
                                                        {Math.round(m.similarity * 100)}% match
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {data.registry.similarMatches.length > 0 && (
                                        <div>
                                            <div
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#eab308",
                                                    fontWeight: 500,
                                                    marginBottom: "8px",
                                                    marginTop: "8px",
                                                }}
                                            >
                                                Similar Matches ({data.registry.similarMatches.length})
                                            </div>
                                            {data.registry.similarMatches.map((m, i) => (
                                                <div
                                                    key={i}
                                                    style={{
                                                        padding: "10px 14px",
                                                        background: "rgba(234, 179, 8, 0.06)",
                                                        borderRadius: "var(--radius-sm)",
                                                        fontSize: "13px",
                                                        marginBottom: "4px",
                                                    }}
                                                >
                                                    <strong>{m.name}</strong>
                                                    <span style={{ color: "var(--text-muted)", marginLeft: "8px" }}>
                                                        {m.jurisdiction.toUpperCase()} • {m.status} •{" "}
                                                        {Math.round(m.similarity * 100)}% match
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Brandability */}
                        <div className="card" style={{ padding: "24px" }}>
                            <h2
                                style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    margin: "0 0 20px",
                                    color: "var(--text-primary)",
                                }}
                            >
                                🎨 Brandability Score
                            </h2>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-around",
                                    flexWrap: "wrap",
                                    gap: "16px",
                                }}
                            >
                                <ScoreGauge
                                    score={data.brandability.brandabilityScore}
                                    label="Overall"
                                    size={90}
                                />
                                <ScoreGauge
                                    score={data.brandability.pronunciationScore}
                                    label="Pronunciation"
                                    size={90}
                                    color="#06b6d4"
                                />
                                <ScoreGauge
                                    score={data.brandability.memorabilityScore}
                                    label="Memorability"
                                    size={90}
                                    color="#8b5cf6"
                                />
                            </div>
                        </div>

                        {/* Alternatives */}
                        {data.alternatives.length > 0 && (
                            <div className="card" style={{ padding: "24px" }}>
                                <h2
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        margin: "0 0 16px",
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    ✨ Safer Alternatives
                                </h2>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "10px",
                                    }}
                                >
                                    {data.alternatives.map((alt, i) => (
                                        <NameCard
                                            key={alt.name}
                                            name={alt.name}
                                            risk={alt.riskLevel}
                                            confidence={alt.confidenceScore}
                                            domainStrength={alt.domainStrength}
                                            delay={i * 0.1}
                                            onClick={() =>
                                                router.push(`/results?name=${encodeURIComponent(alt.name)}`)
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        <LegalDisclaimer />
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default function ResultsPage() {
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
            <ResultsContent />
        </Suspense>
    );
}
