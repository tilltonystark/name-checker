"use client";

import { motion } from "framer-motion";

export function ScoreGauge({
    score,
    label,
    size = 80,
    color,
}: {
    score: number;
    label: string;
    size?: number;
    color?: string;
}) {
    const strokeWidth = 5;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const autoColor =
        color || (score >= 70 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444");

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
            }}
        >
            <div style={{ position: "relative", width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="score-ring"
                    viewBox={`0 0 ${size} ${size}`}
                >
                    <circle
                        className="score-ring-bg"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                    />
                    <motion.circle
                        className="score-ring-fill"
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        stroke={autoColor}
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    />
                </svg>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: size > 70 ? "18px" : "14px",
                        fontWeight: 700,
                        color: autoColor,
                    }}
                >
                    {score}
                </div>
            </div>
            <span
                style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    maxWidth: size + 20,
                }}
            >
                {label}
            </span>
        </div>
    );
}
