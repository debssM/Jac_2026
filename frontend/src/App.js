import { useState, useRef } from "react";

const TOKEN = "I3nUcKqg-qHIXnGN41GyhM0ELvx8sAsdsSgtPY67OcU";

const STEPS = [
  { id: 1, label: "Extracting entities", icon: "🔍" },
  { id: 2, label: "Building timeline", icon: "📅" },
  { id: 3, label: "Mapping FCA elements", icon: "⚖️" },
  { id: 4, label: "Calculating damages", icon: "💰" },
];

function ScoreBar({ label, score, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: "#6b7280", fontFamily: "Georgia, serif" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{(score * 100).toFixed(0)}%</span>
      </div>
      <div style={{ height: 6, background: "#f0f0f0", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${score * 100}%`,
            background: color,
            borderRadius: 99,
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files));
  };

  const readFileContent = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsText(file);
    });
  };

  const analyzeCase = async () => {
    if (files.length === 0) return;
    setStatus("analyzing");
    setCurrentStep(0);
    setResult(null);
    setScores(null);
    setError("");

    try {
      const fileData = await Promise.all(
        files.map(async (f) => ({
          filename: f.name,
          doc_type: f.name.endsWith(".csv") ? "billing" : "email",
          content: await readFileContent(f),
        }))
      );

      // Animate steps while API runs
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < 4) return prev + 1;
          clearInterval(stepInterval);
          return prev;
        });
      }, 1500);

      const res = await fetch(`/analyze_case`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ files: fileData }),
      });

      clearInterval(stepInterval);
      setCurrentStep(4);

      const data = await res.json();

      if (data.reports && data.reports.length > 0) {
        setResult(data.reports[0]);
      }

      const scoresRes = await fetch(`/get_scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({}),
      });

      const scoresData = await scoresRes.json();
      if (scoresData.reports && scoresData.reports.length > 0) {
        setScores(scoresData.reports[0]);
      }

      setStatus("done");
    } catch (err) {
      setError("Could not connect to Jac backend. Make sure 'jac start main.jac --port 8000' is running.");
      setStatus("error");
    }
  };

  const reset = () => {
    setFiles([]);
    setStatus("idle");
    setCurrentStep(0);
    setResult(null);
    setScores(null);
    setError("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "Georgia, serif" }}>
      <div style={{ background: "#1a1a2e", padding: "20px 40px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 36, height: 36, background: "#c9a84c", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚖️</div>
        <div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>QuiTam Copilot</div>
          <div style={{ color: "#9ca3af", fontSize: 12, fontFamily: "Arial, sans-serif" }}>False Claims Act case preparation — powered by AI</div>
        </div>
        <div style={{ marginLeft: "auto", background: "#c9a84c22", border: "1px solid #c9a84c44", borderRadius: 20, padding: "4px 12px" }}>
          <span style={{ color: "#c9a84c", fontSize: 11, fontFamily: "Arial, sans-serif" }}>CONFIDENTIAL</span>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px" }}>

        {status === "idle" && (
          <div>
            <h1 style={{ fontSize: 28, color: "#1a1a2e", marginBottom: 8, fontWeight: 700 }}>Upload Evidence Documents</h1>
            <p style={{ color: "#6b7280", fontFamily: "Arial, sans-serif", fontSize: 14, marginBottom: 32 }}>
              Upload billing records, internal emails, or patient records. Our AI will extract evidence and map it to FCA legal elements.
            </p>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current.click()}
              style={{ border: "2px dashed #d1d5db", borderRadius: 16, padding: "60px 40px", textAlign: "center", cursor: "pointer", background: "#fff", marginBottom: 24 }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>📁</div>
              <div style={{ fontSize: 16, color: "#374151", fontWeight: 600, marginBottom: 8 }}>Drop files here or click to upload</div>
              <div style={{ fontSize: 13, color: "#9ca3af", fontFamily: "Arial, sans-serif" }}>Supports CSV, TXT, PDF — billing records, emails, patient records</div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} style={{ display: "none" }} accept=".csv,.txt,.pdf" />
            </div>

            {files.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", marginBottom: 24 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < files.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <span style={{ fontSize: 18 }}>{f.name.endsWith(".csv") ? "📊" : "📧"}</span>
                    <div>
                      <div style={{ fontSize: 14, color: "#111827", fontFamily: "Arial, sans-serif" }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "Arial, sans-serif" }}>{(f.size / 1024).toFixed(1)} KB</div>
                    </div>
                    <div style={{ marginLeft: "auto", background: "#f0fdf4", color: "#16a34a", fontSize: 11, padding: "2px 8px", borderRadius: 12, fontFamily: "Arial, sans-serif" }}>Ready</div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={analyzeCase}
              disabled={files.length === 0}
              style={{ width: "100%", padding: "16px", background: files.length > 0 ? "#1a1a2e" : "#e5e7eb", color: files.length > 0 ? "#fff" : "#9ca3af", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 600, cursor: files.length > 0 ? "pointer" : "not-allowed", fontFamily: "Georgia, serif", letterSpacing: 0.5 }}
            >
              Analyze Case →
            </button>

            <div style={{ marginTop: 16, textAlign: "center" }}>
              <span
                onClick={() => {
                  setFiles([
                    new File(["claim_id,provider,cpt_code,date,amount\nCLM001,Northview Clinic,99215,2022-01-05,173.00\nCLM002,Northview Clinic,99215,2022-01-06,173.00\nCLM003,Northview Clinic,99215,2022-01-07,173.00\nCLM004,Northview Clinic,99215,2022-01-08,173.00\nCLM005,Northview Clinic,99215,2022-01-09,173.00"], "billing_records.csv", { type: "text/csv" }),
                    new File(["From: Office Manager\nTo: All Staff\nDate: Jan 3 2022\n\nTeam - always bill at 99215 level for all visits regardless of complexity. This keeps our revenue up. Do not deviate from this."], "internal_emails.txt", { type: "text/plain" }),
                  ]);
                }}
                style={{ fontSize: 13, color: "#c9a84c", cursor: "pointer", fontFamily: "Arial, sans-serif", textDecoration: "underline" }}
              >
                Load demo data (Northview Clinic fraud scenario)
              </span>
            </div>
          </div>
        )}

        {status === "analyzing" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 24 }}>⚙️</div>
            <h2 style={{ fontSize: 22, color: "#1a1a2e", marginBottom: 8 }}>Analyzing Case...</h2>
            <p style={{ color: "#6b7280", fontFamily: "Arial, sans-serif", fontSize: 14, marginBottom: 48 }}>Four AI agents are working in sequence</p>
            <div style={{ maxWidth: 400, margin: "0 auto" }}>
              {STEPS.map((step) => (
                <div key={step.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderRadius: 12, marginBottom: 8, background: currentStep >= step.id ? "#f0fdf4" : "#fff", border: `1px solid ${currentStep >= step.id ? "#bbf7d0" : "#e5e7eb"}`, transition: "all 0.4s ease" }}>
                  <span style={{ fontSize: 20 }}>{currentStep >= step.id ? "✅" : step.icon}</span>
                  <span style={{ fontSize: 14, fontFamily: "Arial, sans-serif", color: currentStep >= step.id ? "#16a34a" : "#6b7280", fontWeight: currentStep === step.id ? 600 : 400 }}>{step.label}</span>
                  {currentStep === step.id && <div style={{ marginLeft: "auto", width: 16, height: 16, border: "2px solid #16a34a", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                </div>
              ))}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {status === "error" && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 18, marginBottom: 8 }}>⚠️ Connection Error</div>
            <p style={{ color: "#dc2626", fontFamily: "Arial, sans-serif", fontSize: 14, margin: 0 }}>{error}</p>
            <button onClick={reset} style={{ marginTop: 16, padding: "8px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "Arial, sans-serif" }}>Try Again</button>
          </div>
        )}

        {status === "done" && result && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <h1 style={{ fontSize: 26, color: "#1a1a2e", margin: 0, fontWeight: 700 }}>Case Assessment Complete</h1>
                <p style={{ color: "#6b7280", fontFamily: "Arial, sans-serif", fontSize: 14, margin: "4px 0 0" }}>Defendant: {result.defendant}</p>
              </div>
              <button onClick={reset} style={{ padding: "8px 20px", background: "transparent", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 14, fontFamily: "Arial, sans-serif", color: "#374151" }}>New Case</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
              {[
                { label: "False Claims", value: result.total_false_claims, format: (v) => Number(v).toLocaleString(), color: "#1a1a2e" },
                { label: "Treble Damages", value: result.treble_damages, format: (v) => "$" + Number(v).toLocaleString(), color: "#b45309" },
                { label: "Total Exposure", value: result.total_exposure, format: (v) => "$" + Number(v).toLocaleString(), color: "#dc2626" },
              ].map((card) => (
                <div key={card.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 24px" }}>
                  <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "Arial, sans-serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{card.label}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.format(card.value)}</div>
                </div>
              ))}
            </div>

            {scores && (
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, color: "#1a1a2e", marginBottom: 20, fontWeight: 600 }}>FCA Element Strength</h3>
                <ScoreBar label="Falsity" score={scores.falsity} color="#1a1a2e" />
                <ScoreBar label="Scienter (Knowledge)" score={scores.scienter} color="#c9a84c" />
                <ScoreBar label="Materiality" score={scores.materiality} color="#b45309" />
                <ScoreBar label="Causation" score={scores.causation} color="#dc2626" />
              </div>
            )}

            <div style={{ background: "#1a1a2e", borderRadius: 12, padding: 24, marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "Arial, sans-serif", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Case Summary</div>
              <p style={{ color: "#f9fafb", lineHeight: 1.8, fontSize: 15, margin: 0 }}>{result.case_summary}</p>
            </div>

            <button
              onClick={() => {
                const content = `QUITAM COPILOT - CASE ASSESSMENT\n${"=".repeat(50)}\n\nDefendant: ${result.defendant}\nFalse Claims: ${result.total_false_claims}\nBase Damages: $${result.base_damages}\nTreble Damages: $${result.treble_damages}\nTotal Exposure: $${result.total_exposure}\n\nFCA ELEMENT SCORES\n${"-".repeat(30)}\nFalsity:     ${scores ? (scores.falsity * 100).toFixed(0) : "N/A"}%\nScienter:    ${scores ? (scores.scienter * 100).toFixed(0) : "N/A"}%\nMateriality: ${scores ? (scores.materiality * 100).toFixed(0) : "N/A"}%\nCausation:   ${scores ? (scores.causation * 100).toFixed(0) : "N/A"}%\n\nCASE SUMMARY\n${"-".repeat(30)}\n${result.case_summary}\n\n${"=".repeat(50)}\nGenerated by QuiTam Copilot — CONFIDENTIAL`;
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "case_memo.txt";
                a.click();
              }}
              style={{ width: "100%", padding: 16, background: "#c9a84c", color: "#1a1a2e", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: 0.5 }}
            >
              Download Case Memo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}