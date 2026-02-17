"use client";

export function LegalDisclaimer() {
    return (
        <div className="legal-notice" style={{ marginTop: "32px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>⚖️</span>
                <div>
                    <p style={{ margin: 0 }}>
                        This tool provides automated risk analysis and does not constitute
                        legal advice. Always consult a trademark attorney before finalizing
                        your company name.
                    </p>
                    <p
                        style={{
                            margin: "8px 0 0",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                        }}
                    >
                        Confidence score reflects data signals, not legal clearance.
                    </p>
                </div>
            </div>
        </div>
    );
}
