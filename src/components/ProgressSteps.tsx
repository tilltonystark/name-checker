"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Step {
    label: string;
    done: boolean;
}

export function ProgressSteps({ steps }: { steps: Step[] }) {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "20px",
            }}
        >
            {steps.map((step, i) => (
                <motion.div
                    key={step.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontSize: "14px",
                    }}
                >
                    <AnimatePresence mode="wait">
                        {step.done ? (
                            <motion.div
                                key="done"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    background: "rgba(34, 197, 94, 0.15)",
                                    border: "1.5px solid #22c55e",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "#22c55e",
                                    fontSize: "12px",
                                    flexShrink: 0,
                                }}
                            >
                                ✓
                            </motion.div>
                        ) : (
                            <motion.div
                                key="pending"
                                style={{
                                    width: "22px",
                                    height: "22px",
                                    borderRadius: "50%",
                                    border: "1.5px solid var(--text-muted)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <div
                                    className="pulse-dot"
                                    style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        background: "var(--accent-blue)",
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <span
                        style={{
                            color: step.done ? "var(--text-primary)" : "var(--text-muted)",
                            fontWeight: step.done ? 500 : 400,
                        }}
                    >
                        {step.label}
                    </span>
                </motion.div>
            ))}
        </div>
    );
}
