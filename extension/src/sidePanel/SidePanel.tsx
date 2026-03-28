import { useEffect, useState } from "react";
import { fetchSession, sendOtp, verifyOtp } from "../utils/auth";

type EmailData = {
  senderEmail: string;
  subject: string;
  body: string;
  links: string[];
} | null;

type AnalysisStep = {
  id: string;
  title: string;
  desc: string;
  status: "pending" | "running" | "completed" | "error";
  details?: string;
  data?: Record<string, any>;
};

type AiVerdict = {
  verdict: "SAFE" | "SUSPICIOUS" | "PHISHING";
  confidence: number;
  reasons: string[];
  recommendation: string;
};

type UrlAnalysisResult = {
  url: string;
  domain: string;
  steps: AnalysisStep[];
  verdict: AiVerdict | null;
  status: "pending" | "analyzing" | "completed" | "error";
};

const THEME = {
  primary: "#6366f1",
  primaryHover: "#4f46e5",
  bg: "#f8fafc",
  surface: "#ffffff",
  border: "#e2e8f0",
  textMain: "#0f172a",
  textSec: "#475569",
  textMute: "#94a3b8",
  safe: "#10b981",
  safeBg: "rgba(16,185,129,0.08)",
  warn: "#f59e0b",
  warnBg: "rgba(245,158,11,0.08)",
  danger: "#ef4444",
  dangerBg: "rgba(239,68,68,0.08)",
};

const verdictStyles = {
  SAFE: { color: THEME.safe, bg: THEME.safeBg, icon: "🛡️" },
  SUSPICIOUS: { color: THEME.warn, bg: THEME.warnBg, icon: "⚠️" },
  PHISHING: { color: THEME.danger, bg: THEME.dangerBg, icon: "🚨" },
};

function Spinner({ size = 18, color = THEME.primary }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `2.5px solid ${color}22`,
      borderTopColor: color,
      borderRadius: "50%",
      animation: "ti-spin 0.8s linear infinite",
    }} />
  );
}

export default function SidePanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authStatus, setAuthStatus] = useState<"unknown" | "logged-out" | "otp-sent" | "logged-in">("unknown");
  const [message, setMessage] = useState("");
  const [emailData, setEmailData] = useState<EmailData>(null);
  const [userId, setUserId] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzingDomain, setAnalyzingDomain] = useState<string | null>(null);
  const [urlResults, setUrlResults] = useState<UrlAnalysisResult[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const session = await fetchSession();
        if (session?.user?.email) {
          setAuthStatus("logged-in");
          setUserId(session.user.id || session.user.email);
        } else setAuthStatus("logged-out");
      } catch {
        setAuthStatus("logged-out");
      }
    })();
  }, []);

  useEffect(() => {
    if (authStatus === "logged-in" && !emailData && !isLoading) extractEmail();
  }, [authStatus]);

  useEffect(() => {
    if (authStatus === "logged-in" && emailData && emailData.links?.length > 0 && !showAnalysis && !analyzingDomain) {
      handleAnalyseEmail();
    }
  }, [authStatus, emailData]);

  const extractDomain = (url: string): string | null => {
    try {
      return new URL(url).hostname;
    } catch {
      return url.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ?? null;
    }
  };

  const extractEmail = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        const response = await chrome.tabs.sendMessage(tab.id, { action: "extractEmailDetails" });
        if (response.success && response.data) setEmailData(response.data);
      }
    } catch { /* ignore */ }
    setIsLoading(false);
  };

  const handleSendOtp = async () => {
    if (!email) return setMessage("Email is required");
    setIsLoading(true);
    try {
      await sendOtp(email);
      setAuthStatus("otp-sent");
      setMessage("Check your email");
    } catch (e) { setMessage((e as Error).message); }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setIsLoading(true);
    try {
      const result = await verifyOtp(email, otp);
      if (result?.success) {
        setAuthStatus("logged-in");
        setUserId(email);
      } else setMessage("Invalid code");
    } catch (e) { setMessage((e as Error).message); }
    setIsLoading(false);
  };

  const analyzeSingleUrl = async (url: string, index: number) => {
    const domain = extractDomain(url);
    if (!domain) return;

    setUrlResults(prev => prev.map((r, i) => i === index ? {
      ...r, domain, status: "analyzing",
      steps: [
        { id: "dns", title: "Infrastructure", desc: "Verifying website age & records", status: "running" },
        { id: "safebrowsing", title: "Reputation", desc: "Checking against threat databases", status: "pending" },
        { id: "ml", title: "Pattern Analysis", desc: "AI scanning for phishing behaviors", status: "pending" },
        { id: "ai", title: "Risk Verdict", desc: "Synthesizing final security level", status: "pending" },
      ]
    } : r));
    setAnalyzingDomain(domain);

    try {
      const response = await fetch("http://localhost:3000/api/ai-verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain, userId,
          senderEmail: emailData?.senderEmail,
          emailSubject: emailData?.subject,
          emailBody: emailData?.body,
          links: emailData?.links,
        }),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const block of events) {
          try {
            const eType = block.match(/event:\s*(\S+)/)?.[1];
            const raw = block.match(/data:\s*(\{.*\})/s)?.[1]?.trim();
            if (!eType || !raw || raw === "[DONE]") continue;
            const data = JSON.parse(raw);

            setUrlResults(prev => prev.map((r, i) => {
              if (i !== index) return r;
              let nextSteps = [...r.steps];
              if (eType === "dns") {
                nextSteps = nextSteps.map(s => s.id === "dns" ? { ...s, status: "completed", data: { ...data.result, domain: data.domain } } : s.id === "safebrowsing" ? { ...s, status: "running" } : s);
              } else if (eType === "safebrowsing") {
                nextSteps = nextSteps.map(s => s.id === "safebrowsing" ? { ...s, status: "completed", data } : s.id === "ml" ? { ...s, status: "running" } : s);
              } else if (eType === "ml") {
                nextSteps = nextSteps.map(s => s.id === "ml" ? { ...s, status: "completed", data } : s.id === "ai" ? { ...s, status: "running" } : s);
              } else if (eType === "ai_final") {
                nextSteps = nextSteps.map(s => s.id === "ai" ? { ...s, status: "completed", data } : s);
                return { ...r, verdict: data, steps: nextSteps, status: "completed" };
              } else if (eType === "error") {
                return { ...r, status: "error" };
              }
              return { ...r, steps: nextSteps };
            }));
            if (eType === "ai_final" || eType === "error") setAnalyzingDomain(null);
          } catch { /* ignore */ }
        }
      }
    } catch { setAnalyzingDomain(null); }
  };

  const handleAnalyseEmail = async () => {
    if (!emailData?.links?.length || !userId) return;
    const initialResults: UrlAnalysisResult[] = emailData.links.map(link => ({
      url: link, domain: extractDomain(link) || "", steps: [], verdict: null, status: "pending"
    }));
    setUrlResults(initialResults);
    setShowAnalysis(true);
    for (let i = 0; i < emailData.links.length; i++) {
      await analyzeSingleUrl(emailData.links[i], i);
    }
  };

  const Header = () => (
    <div style={{ padding: "24px 20px", background: THEME.surface, borderBottom: `1px solid ${THEME.border}`, display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 42, height: 42, background: `linear-gradient(135deg, ${THEME.primary} 0%, ${THEME.primaryHover} 100%)`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 22, boxShadow: `0 4px 12px ${THEME.primary}33` }}>T</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 18, color: THEME.textMain, lineHeight: 1.2, letterSpacing: "-0.02em" }}>TrustInbox</div>
        <div style={{ fontSize: 12, color: THEME.textMute, fontWeight: 500 }}>AI Email Defense</div>
      </div>
    </div>
  );

  const StepDataDisplay = ({ step }: { step: AnalysisStep }) => {
    if (!step.data || step.status !== "completed") return null;

    if (step.id === "dns") {
      const d = step.data;
      return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 14px", marginTop: 10, padding: "12px", background: THEME.bg, borderRadius: 12, border: `1px solid ${THEME.border}` }}>
          <div>
            <div style={{ fontSize: 10, color: THEME.textMute, textTransform: "uppercase", fontWeight: 800, marginBottom: 2 }}>Domain Age</div>
            <div style={{ fontSize: 13, color: THEME.textMain, fontWeight: 700 }}>{d.age_days ? `${d.age_days}d` : "N/A"}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: THEME.textMute, textTransform: "uppercase", fontWeight: 800, marginBottom: 2 }}>Global Reputation</div>
            <div style={{ fontSize: 13, color: d.vt_reputation >= 0 ? THEME.safe : THEME.danger, fontWeight: 700 }}>{d.vt_reputation ?? 0}</div>
          </div>
        </div>
      );
    }

    if (step.id === "safebrowsing") {
      return (
        <div style={{ marginTop: 8, padding: "10px 14px", background: step.data.isSafe ? THEME.safeBg : THEME.dangerBg, borderRadius: 12, border: `1px solid ${step.data.isSafe ? THEME.safe : THEME.danger}22` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: step.data.isSafe ? THEME.safe : THEME.danger }}>
            {step.data.isSafe ? "✅ Safe: No known threats found" : `❌ Flagged: ${step.data.threatType || "Phishing Content"}`}
          </div>
        </div>
      );
    }

    if (step.id === "ml") {
      const isGood = step.data.prediction === "good";
      const confidence = Math.round((step.data.raw?.[step.data.prediction] || 0) * 100);
      return (
        <div style={{ marginTop: 8, padding: "10px 14px", background: isGood ? THEME.safeBg : THEME.dangerBg, borderRadius: 12, border: `1px solid ${isGood ? THEME.safe : THEME.danger}22` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: isGood ? THEME.safe : THEME.danger }}>
              {isGood ? "Clean: Trusted Patterns" : "Suspect: Anomalous Behavior"}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: THEME.textMute }}>{confidence}%</span>
          </div>
          <div style={{ height: 4, background: `${isGood ? THEME.safe : THEME.danger}22`, borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
            <div style={{ width: `${confidence}%`, height: "100%", background: isGood ? THEME.safe : THEME.danger }} />
          </div>
        </div>
      );
    }

    return null;
  };

  if (authStatus !== "logged-in") {
    return (
      <div style={{ height: "100vh", background: THEME.bg, fontFamily: "'Inter', sans-serif" }}>
        <Header />
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: THEME.textMain, marginBottom: 12 }}>Inbox Shield</h2>
          <p style={{ color: THEME.textSec, fontSize: 14, marginBottom: 32 }}>Login to analyze links and attachments with AI.</p>
          <input
            style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: `1.5px solid ${THEME.border}`, marginBottom: 14, outline: "none" }}
            placeholder="Work Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          {authStatus === "otp-sent" && (
            <input
              style={{ width: "100%", padding: "14px 18px", borderRadius: 14, border: `1.5px solid ${THEME.primary}`, marginBottom: 14, textAlign: "center", fontSize: 18, letterSpacing: 8 }}
              placeholder="000000"
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />
          )}
          <button
            style={{ width: "100%", padding: "16px", background: THEME.primary, color: "white", borderRadius: 14, fontWeight: 700, border: "none" }}
            onClick={authStatus === "otp-sent" ? handleVerifyOtp : handleSendOtp}
          >
            {authStatus === "otp-sent" ? "Verify Code" : "Continue"}
          </button>
          {message && (
            <div style={{ marginTop: 16, fontSize: 13, color: message.toLowerCase().includes("invalid") || message.toLowerCase().includes("required") ? THEME.danger : THEME.primary, fontWeight: 600 }}>
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: THEME.bg, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`@keyframes ti-spin { to { transform: rotate(360deg); } }`}</style>
      <Header />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>
        {!emailData ? (
          <div style={{ padding: "60px 24px", textAlign: "center", background: THEME.surface, borderRadius: 24, border: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>📬</div>
            <h2 style={{ fontWeight: 800, color: THEME.textMain, fontSize: 18, marginBottom: 8 }}>Awaiting Email</h2>
            <p style={{ color: THEME.textSec, fontSize: 14 }}>Open an email in Gmail to trigger the security scan.</p>
          </div>
        ) : (
          <>
            {/* Context Card */}
            <div style={{ background: THEME.surface, padding: "24px", borderRadius: 24, border: `1px solid ${THEME.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: 10, color: THEME.textMute, textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 12 }}>Analysis Context</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: THEME.textMain, marginBottom: 6, lineHeight: 1.3 }}>
                {emailData.subject ? (emailData.subject.length > 50 ? emailData.subject.substring(0, 50) + "..." : emailData.subject) : "No Subject"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: THEME.primary }} />
                <div style={{ fontSize: 14, color: THEME.textSec, fontWeight: 600 }}>{emailData.senderEmail || "Sender Unknown"}</div>
              </div>
            </div>

            {/* Analysis List */}
            {urlResults.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, paddingLeft: 4 }}>Embedded Links Found ({urlResults.length})</div>

                {urlResults.map((res, idx) => (
                  <div key={idx} style={{ background: THEME.surface, borderRadius: 24, border: `1.5px solid ${res.status === 'analyzing' ? THEME.primary + '33' : THEME.border}`, overflow: "hidden", transition: "all 0.3s ease" }}>
                    <div style={{ padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: THEME.textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{res.domain || res.url}</div>
                        <div style={{ fontSize: 12, color: THEME.textMute, marginTop: 4, fontWeight: 600 }}>{res.status === "completed" ? "Deep Intelligence Report" : res.status === "analyzing" ? "Analyzing with AI..." : "Pending Scan"}</div>
                      </div>
                      {res.verdict ? (
                        <div style={{ padding: "8px 14px", borderRadius: 12, background: verdictStyles[res.verdict.verdict].bg, color: verdictStyles[res.verdict.verdict].color, fontWeight: 800, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                          {res.verdict.verdict}
                        </div>
                      ) : res.status === "analyzing" ? <Spinner size={18} /> : null}
                    </div>

                    {res.status !== "pending" && res.steps.length > 0 && (
                      <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ height: 1.5, background: THEME.bg }} />
                        
                        {res.steps.map(step => (
                          <div key={step.id}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div>
                                <div style={{ fontSize: 13, color: THEME.textMain, fontWeight: 800 }}>{step.title}</div>
                                <div style={{ fontSize: 11, color: THEME.textMute, fontWeight: 500 }}>{step.desc}</div>
                              </div>
                              {step.status === "running" ? <Spinner size={12} /> : step.status === "completed" ? <span style={{ color: THEME.safe }}>✓</span> : null}
                            </div>
                            <StepDataDisplay step={step} />
                          </div>
                        ))}

                        {res.verdict && (
                          <div style={{ marginTop: 10, padding: "18px", background: THEME.bg, borderRadius: 20, border: `1.5px solid ${THEME.border}` }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.textMain, marginBottom: 10 }}>🛡️ AI Security Recommendation</div>
                            <div style={{ fontSize: 13, color: THEME.textSec, lineHeight: 1.6, fontWeight: 600 }}>{res.verdict.recommendation}</div>
                            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                              {res.verdict.reasons.map((reason, rIdx) => (
                                <div key={rIdx} style={{ fontSize: 12, color: THEME.textMute, display: "flex", gap: 10, lineHeight: 1.4 }}>
                                  <span style={{ color: THEME.primary }}>•</span> {reason}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ padding: "20px", textAlign: "center", borderTop: `1px solid ${THEME.border}`, background: THEME.surface }}>
        <div style={{ fontSize: 11, color: THEME.textMute, fontWeight: 700, letterSpacing: "0.1em" }}>PROTECTED BY TRUSTINBOX CORE</div>
      </div>
    </div>
  );
}
