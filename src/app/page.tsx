"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";

type Mode = "check" | "generate";

const regions = [
  { value: "", label: "All Regions" },
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "in", label: "India" },
  { value: "de", label: "Germany" },
  { value: "ca", label: "Canada" },
  { value: "au", label: "Australia" },
];

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("check");
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheck = () => {
    if (!name.trim()) return;
    const params = new URLSearchParams({ name: name.trim() });
    if (region) params.set("region", region);
    router.push(`/results?${params.toString()}`);
  };

  const handleGenerate = () => {
    if (!industry.trim() || !description.trim()) return;
    const params = new URLSearchParams({
      industry: industry.trim(),
      description: description.trim(),
    });
    if (keywords.trim()) params.set("keywords", keywords.trim());
    if (region) params.set("region", region);
    router.push(`/generate?${params.toString()}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Header />

      <main
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "60px 24px 80px",
        }}
      >
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: "48px" }}
        >
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 700,
              lineHeight: 1.15,
              margin: "0 0 16px",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
            }}
          >
            Is your company name
            <br />
            safe to use?
          </h1>
          <p
            style={{
              fontSize: "17px",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
              maxWidth: "520px",
              margin: "0 auto",
            }}
          >
            Multi-signal conflict detection, domain intelligence, and brandability
            analysis — all in under 5 seconds.
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            marginBottom: "28px",
            padding: "4px",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
            width: "fit-content",
            margin: "0 auto 28px",
          }}
        >
          <button
            className={`tab ${mode === "check" ? "active" : ""}`}
            onClick={() => setMode("check")}
          >
            🔍 Check Name
          </button>
          <button
            className={`tab ${mode === "generate" ? "active" : ""}`}
            onClick={() => setMode("generate")}
          >
            ✨ Generate Names
          </button>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
          style={{ padding: "32px" }}
        >
          <AnimatePresence mode="wait">
            {mode === "check" ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                  }}
                >
                  Company Name
                </label>
                <input
                  id="name-input"
                  className="input-field"
                  type="text"
                  placeholder="e.g. Bright Labs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                  autoFocus
                />

                <div style={{ marginTop: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                    }}
                  >
                    Region{" "}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                      (optional)
                    </span>
                  </label>
                  <select
                    id="region-select"
                    className="input-field"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ cursor: "pointer" }}
                  >
                    {regions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  id="analyze-button"
                  className="btn-primary"
                  onClick={handleCheck}
                  disabled={!name.trim()}
                  style={{ width: "100%", marginTop: "24px" }}
                >
                  Analyze Name →
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="generate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text-secondary)",
                    marginBottom: "8px",
                  }}
                >
                  Industry
                </label>
                <input
                  id="industry-input"
                  className="input-field"
                  type="text"
                  placeholder="e.g. Artificial Intelligence"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />

                <div style={{ marginTop: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                    }}
                  >
                    Description
                  </label>
                  <textarea
                    id="description-input"
                    className="input-field"
                    placeholder="Describe your startup in 1-2 sentences..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                    }}
                  >
                    Keywords{" "}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                      (optional, comma-separated)
                    </span>
                  </label>
                  <input
                    id="keywords-input"
                    className="input-field"
                    type="text"
                    placeholder="e.g. writing, content, creative"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                    }}
                  >
                    Region{" "}
                    <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                      (optional)
                    </span>
                  </label>
                  <select
                    id="generate-region-select"
                    className="input-field"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ cursor: "pointer" }}
                  >
                    {regions.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  id="generate-button"
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={!industry.trim() || !description.trim()}
                  style={{ width: "100%", marginTop: "24px" }}
                >
                  ✨ Generate Names
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <LegalDisclaimer />

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginTop: "48px",
          }}
        >
          {[
            { icon: "🌐", title: "Domain Check", desc: ".com, .io, .co" },
            { icon: "🏢", title: "Registry Scan", desc: "Company databases" },
            { icon: "🔎", title: "Web Presence", desc: "Search analysis" },
            { icon: "🎨", title: "Brandability", desc: "Name quality score" },
          ].map((f, i) => (
            <div
              key={f.title}
              className="card"
              style={{
                padding: "20px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                {f.icon}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
