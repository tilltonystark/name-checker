"use client";

import { motion } from "framer-motion";
import type { OverallRiskLevel } from "@/types";

const config: Record<
    OverallRiskLevel,
    { label: string; color: string; bg: string; border: string; icon: string }
> = {
    low: {
        label: "Low Risk",
        color: "#22c55e",
        bg: "rgba(34, 197, 94, 0.1)",
        border: "rgba(34, 197, 94, 0.3)",
        icon: "✓",
    },
    moderate: {
        label: "Moderate Risk",
        color: "#eab308",
        bg: "rgba(234, 179, 8, 0.1)",
        border: "rgba(234, 179, 8, 0.3)",
        icon: "⚠",
    },
    high: {
        label: "High Risk",
        color: "#ef4444",
        bg: "rgba(239, 68, 68, 0.1)",
        border: "rgba(239, 68, 68, 0.3)",
        icon: "✕",
    },
};

export function RiskBadge({
    risk,
    size = "md",
    showScore,
    score,
}: {
    risk: OverallRiskLevel;
    size?: "sm" | "md" | "lg";
    showScore?: boolean;
    score?: number;
}) {
    const c = config[risk];

    const sizeClasses = {
        sm: { padding: "6px 14px", fontSize: "13px", iconSize: "14px" },
        md: { padding: "10px 20px", fontSize: "15px", iconSize: "18px" },
        lg: { padding: "16px 32px", fontSize: "20px", iconSize: "24px" },
    };

    const s = sizeClasses[size];

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: s.padding,
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: "var(--radius-xl)",
                color: c.color,
                fontSize: s.fontSize,
                fontWeight: 600,
            }}
        >
            <span style={{ fontSize: s.iconSize }}>{c.icon}</span>
            <span>{c.label}</span>
            {showScore && score !== undefined && (
                <span
                    style={{
                        marginLeft: "4px",
                        opacity: 0.7,
                        fontSize: "0.85em",
                    }}
                >
                    {score}/100
                </span>
            )}
        </motion.div>
    );
}
