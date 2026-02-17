"use client";

import Link from "next/link";

export function Header() {
    return (
        <header
            style={{
                position: "sticky",
                top: 0,
                zIndex: 50,
                padding: "14px 24px",
                background: "var(--bg-primary)",
                borderBottom: "1px solid var(--border-primary)",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Link
                    href="/"
                    style={{
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <div
                        style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            background: "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "var(--bg-primary)",
                        }}
                    >
                        N
                    </div>
                    <span
                        style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Name
                        <span style={{ color: "var(--text-secondary)" }}>Check</span>
                    </span>
                </Link>

                <nav style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span
                        style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            padding: "5px 12px",
                            border: "1px solid var(--border-primary)",
                            borderRadius: "var(--radius-sm)",
                        }}
                    >
                        Free Tier · 10 checks/day
                    </span>
                </nav>
            </div>
        </header>
    );
}
