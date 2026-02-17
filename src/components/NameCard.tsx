"use client";

import { motion } from "framer-motion";
import { RiskBadge } from "./RiskBadge";
import type { GeneratedName, NameVariation } from "@/types";

export function NameCard({
    name,
    risk,
    confidence,
    domainStrength,
    brandability,
    category,
    delay = 0,
    onClick,
}: {
    name: string;
    risk: "low" | "moderate" | "high";
    confidence: number;
    domainStrength: string;
    brandability?: number;
    category?: string;
    delay?: number;
    onClick?: () => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            onClick={onClick}
            style={{
                padding: "20px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-lg)",
                cursor: onClick ? "pointer" : "default",
                transition: "all 0.2s ease",
            }}
            whileHover={
                onClick
                    ? {
                        borderColor: "rgba(79, 125, 252, 0.3)",
                        y: -2,
                        boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
                    }
                    : undefined
            }
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                }}
            >
                <h3
                    style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                    }}
                >
                    {name}
                </h3>
                <RiskBadge risk={risk} size="sm" />
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    fontSize: "13px",
                    color: "var(--text-secondary)",
                }}
            >
                <span>
                    Confidence: <strong style={{ color: "var(--text-primary)" }}>{confidence}</strong>
                </span>
                <span>
                    Domains:{" "}
                    <strong
                        style={{
                            color:
                                domainStrength === "strong"
                                    ? "#22c55e"
                                    : domainStrength === "moderate"
                                        ? "#eab308"
                                        : "#ef4444",
                        }}
                    >
                        {domainStrength}
                    </strong>
                </span>
                {brandability !== undefined && (
                    <span>
                        Brand: <strong style={{ color: "var(--text-primary)" }}>{brandability}</strong>
                    </span>
                )}
                {category && (
                    <span
                        style={{
                            padding: "2px 8px",
                            background: "rgba(79, 125, 252, 0.1)",
                            borderRadius: "4px",
                            fontSize: "11px",
                            color: "var(--accent-blue)",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        {category}
                    </span>
                )}
            </div>
        </motion.div>
    );
}
