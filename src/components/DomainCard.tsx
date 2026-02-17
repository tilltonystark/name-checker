"use client";

import { motion } from "framer-motion";
import type { DomainStatus } from "@/types";

const statusConfig: Record<
    DomainStatus,
    { label: string; color: string; icon: string }
> = {
    available: { label: "Available", color: "#22c55e", icon: "✓" },
    taken: { label: "Taken", color: "#ef4444", icon: "✕" },
    premium: { label: "Premium", color: "#eab308", icon: "★" },
    error: { label: "Unknown", color: "#6b6f8a", icon: "?" },
};

export function DomainCard({
    extension,
    status,
    name,
    delay = 0,
}: {
    extension: string;
    status: DomainStatus;
    name: string;
    delay?: number;
}) {
    const c = statusConfig[status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.3 }}
            style={{
                padding: "16px 20px",
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                    style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {name}.{extension}
                </span>
            </div>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: c.color,
                    fontSize: "13px",
                    fontWeight: 500,
                }}
            >
                <span>{c.icon}</span>
                <span>{c.label}</span>
            </div>
        </motion.div>
    );
}
