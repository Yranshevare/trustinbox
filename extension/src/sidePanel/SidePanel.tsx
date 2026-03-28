import { useEffect, useState, useRef } from "react";
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
  status: "pending" | "running" | "completed" | "error";
  details?: string;
  data?: Record<string, unknown>;
};

type AiVerdict = {
  verdict: "SAFE" | "SUSPICIOUS" | "PHISHING";
  confidence: number;
  reasons: string[];
  recommendation: string;
};

export default function SidePanel() {
  const [, setStatus] = useState<string>("Ready");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [authStatus, setAuthStatus] = useState<
    "unknown" | "logged-out" | "otp-sent" | "logged-in"
  >("unknown");
  const [message, setMessage] = useState("");
  const [emailData, setEmailData] = useState<EmailData>(null);
  const [userId, setUserId] = useState<string>("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzingDomain, setAnalyzingDomain] = useState<string | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([
    { id: "dns", title: "DNS Analysis", status: "pending" },
    { id: "safebrowsing", title: "Safe Browsing Check", status: "pending" },
    { id: "ai", title: "AI Verdict", status: "pending" },
  ]);
  const [finalVerdict, setFinalVerdict] = useState<AiVerdict | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await fetchSession();
        if (session?.user?.email) {
          setAuthStatus("logged-in");
          setUserId(session.user.id || session.user.email);
          setMessage(`Logged in as ${session.user.email}`);
        } else {
          setAuthStatus("logged-out");
        }
      } catch {
        setAuthStatus("logged-out");
      }
    })();
  }, []);

  useEffect(() => {
    if (authStatus === "logged-in" && !emailData && !isLoading) {
      extractEmail();
    }
  }, [authStatus]);

  const extractDomain = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      const match = url.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      return match ? match[0] : null;
    }
  };

  const extractEmail = async () => {
    setIsLoading(true);
    setStatus("Extracting...");

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.id) {
        setStatus("Error: No active tab");
        setIsLoading(false);
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractEmailDetails",
      });

      if (response.success && response.data) {
        setEmailData(response.data);
        setStatus("✓ Ready to analyze");
      } else {
        setStatus("✗ No email detected");
      }
    } catch {
      setStatus("✗ Open an email in Gmail");
      setIsLoading(false);
    }

    setIsLoading(false);
  };

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Please provide email address");
      return;
    }

    setIsLoading(true);
    setMessage("Sending OTP...");

    try {
      await sendOtp(email);
      setAuthStatus("otp-sent");
      setMessage("OTP sent. Check your email.");
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email || !otp) {
      setMessage("Email and OTP are required.");
      return;
    }

    setIsLoading(true);
    setMessage("Verifying OTP...");

    try {
      const result = await verifyOtp(email, otp);
      if (result?.success) {
        setAuthStatus("logged-in");
        setUserId(email);
        setMessage("Verified!");
      } else {
        setMessage("Verification failed.");
      }
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyseEmail = async () => {
    if (!emailData || !emailData.links.length || !userId) {
      console.log("Missing data:", {
        emailData: !!emailData,
        links: emailData?.links.length,
        userId,
      });
      return;
    }

    const domain = extractDomain(emailData.links[0]);
    if (!domain) {
      console.log("Could not extract domain from:", emailData.links[0]);
      return;
    }

    console.log("Starting analysis for:", { domain, userId });

    setAnalyzingDomain(domain);
    setShowAnalysis(true);
    setFinalVerdict(null);
    setAnalysisSteps([
      { id: "dns", title: "DNS Analysis", status: "running" },
      { id: "safebrowsing", title: "Safe Browsing Check", status: "pending" },
      { id: "ai", title: "AI Verdict", status: "pending" },
    ]);

    setTimeout(() => {
      analysisRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const response = await fetch("http://localhost:3000/api/ai-verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, userId }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.log("No reader available");
        return;
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        console.log("Chunk received:", chunk);
        buffer += chunk;

        // Split by double newlines to get complete events
        const events = buffer.split("\n\n");

        // Keep the last incomplete event in the buffer
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          try {
            // Parse SSE format: event: <type>\ndata: <json>
            const eventMatch = eventBlock.match(/event:\s*(\S+)/);
            const dataMatch = eventBlock.match(/data:\s*(\{.*\})/s);

            if (!eventMatch || !dataMatch) continue;

            const eventType = eventMatch[1];
            const rawData = dataMatch[1].trim();

            console.log("Event type:", eventType, "Data:", rawData);

            if (!rawData || rawData === "[DONE]") {
              setAnalyzingDomain(null);
              continue;
            }

            const data = JSON.parse(rawData);
            console.log("Parsed event:", data);

            if (eventType === "dns") {
              setAnalysisSteps((prev) =>
                prev.map((s) =>
                  s.id === "dns"
                    ? {
                        ...s,
                        status: "completed",
                        data: { ...data.result, domain: data.domain },
                      }
                    : s,
                ),
              );
              setAnalysisSteps((prev) =>
                prev.map((s) =>
                  s.id === "safebrowsing" ? { ...s, status: "running" } : s,
                ),
              );
            } else if (eventType === "safebrowsing") {
              setAnalysisSteps((prev) =>
                prev.map((s) =>
                  s.id === "safebrowsing"
                    ? { ...s, status: "completed", data: data }
                    : s,
                ),
              );
              setAnalysisSteps((prev) =>
                prev.map((s) =>
                  s.id === "ai" ? { ...s, status: "running" } : s,
                ),
              );
            } else if (eventType === "ai_final") {
              setFinalVerdict(data);
              setAnalysisSteps((prev) =>
                prev.map((s) =>
                  s.id === "ai" ? { ...s, status: "completed", data: data } : s,
                ),
              );
              setAnalyzingDomain(null);
            } else if (eventType === "error") {
              setAnalysisSteps((prev) =>
                prev.map((s) =>
                  s.status === "running"
                    ? {
                        ...s,
                        status: "error",
                        details: data?.error || "Unknown error",
                      }
                    : s,
                ),
              );
              setAnalyzingDomain(null);
            } else if (eventType === "done") {
              setAnalyzingDomain(null);
            }
          } catch (e) {
            console.log("Parse error:", e, "Event block:", eventBlock);
          }
        }
      }

      // Process any remaining data in buffer
      if (buffer.trim()) {
        console.log("Processing remaining buffer:", buffer);
        try {
          const eventMatch = buffer.match(/event:\s*(\S+)/);
          const dataMatch = buffer.match(/data:\s*(\{.*\})/s);

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1];
            const rawData = dataMatch[1].trim();

            if (eventType === "ai_final" && rawData) {
              const data = JSON.parse(rawData);
              setFinalVerdict(data);
              setAnalysisSteps((prev) =>
                prev.map((s) =>
                  s.id === "ai" ? { ...s, status: "completed", data: data } : s,
                ),
              );
            }
          }
        } catch (e) {
          console.log("Final buffer parse error:", e);
        }
      }
    } catch (error) {
      console.log("Analysis error:", error);
      setAnalysisSteps((prev) =>
        prev.map((s) =>
          s.status === "running"
            ? { ...s, status: "error", details: (error as Error).message }
            : s,
        ),
      );
      setAnalyzingDomain(null);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "SAFE":
        return "bg-green-500";
      case "SUSPICIOUS":
        return "bg-yellow-500";
      case "PHISHING":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStepIcon = (step: AnalysisStep) => {
    switch (step.status) {
      case "completed":
        return (
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        );
      case "running":
        return (
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        );
      case "error":
        return (
          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 border-2 border-slate-300 rounded-full" />
        );
    }
  };

  return (
    <div
      id="my-ext"
      className="h-full w-full bg-slate-50 dark:bg-slate-900 p-3 flex flex-col overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-800 dark:text-white">
            TrustInbox
          </h1>
        </div>
      </div>

      {authStatus !== "logged-in" && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white mb-2">
            Sign In
          </h2>

          <div className="space-y-2">
            <input
              id="sideEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white"
              placeholder="you@example.com"
              disabled={isLoading}
            />

            <button
              type="button"
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-400 text-white font-medium rounded-lg text-sm"
              onClick={handleSendOtp}
              disabled={isLoading || authStatus === "otp-sent"}
            >
              {isLoading && authStatus === "logged-out"
                ? "Sending..."
                : "Send Code"}
            </button>

            {authStatus === "otp-sent" && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                <input
                  id="sideOtp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-800 dark:text-white mb-2"
                  placeholder="123456"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="w-full py-2 bg-slate-800 dark:bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg text-sm"
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Verify"}
                </button>
              </div>
            )}
          </div>

          {message && (
            <p
              className={`text-xs mt-2 ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}
            >
              {message}
            </p>
          )}
        </div>
      )}

      {authStatus === "logged-in" && (
        <>
          {!emailData ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                No email detected
              </p>
              <p className="text-xs text-slate-400">
                Open an email in Gmail to analyze its links
              </p>
            </div>
          ) : (
            <>
              {emailData.links.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-200 dark:border-slate-700 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Links Found
                    </h3>
                    <span className="text-xs text-slate-400">
                      {emailData.links.length}
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-auto">
                    {emailData.links.map((link, i) => (
                      <a
                        key={i}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-indigo-600 dark:text-indigo-400 hover:underline truncate py-1 px-2 bg-slate-50 dark:bg-slate-700/50 rounded"
                      >
                        {extractDomain(link) || link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {emailData.links.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-3 text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                    No links found in this email
                  </p>
                </div>
              )}
            </>
          )}

          {showAnalysis && (
            <div
              ref={analysisRef}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-3 p-3"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                  Analysis
                </h3>
                {analyzingDomain && (
                  <span className="text-xs text-slate-500">
                    {analyzingDomain}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {analysisSteps.map((step) => (
                  <div
                    key={step.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getStepIcon(step)}
                      <span
                        className={`text-sm font-medium ${step.status === "completed" ? "text-green-600 dark:text-green-400" : step.status === "error" ? "text-red-600" : step.status === "running" ? "text-indigo-600" : "text-slate-400"}`}
                      >
                        {step.title}
                      </span>
                    </div>

                    {step.data && step.id === "dns" && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 ml-7">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Domain:</span>
                          <span className="font-medium">
                            {(step.data as any).domain}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Age:</span>
                          <span className="font-medium">
                            {(step.data as any).age_days} days
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">DNSSEC:</span>
                          <span
                            className={`font-medium ${(step.data as any).dnssec_valid ? "text-green-600" : "text-yellow-600"}`}
                          >
                            {(step.data as any).dnssec_valid
                              ? "Valid"
                              : "Not Signed"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Flux Score:</span>
                          <span className="font-medium">
                            {(step.data as any).flux_score}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">VT Malicious:</span>
                          <span
                            className={`font-medium ${(step.data as any).vt_malicious > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {(step.data as any).vt_malicious}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">VT Reputation:</span>
                          <span className="font-medium">
                            {(step.data as any).vt_reputation}
                          </span>
                        </div>
                      </div>
                    )}

                    {step.data && step.id === "safebrowsing" && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 ml-7">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">Status:</span>
                          <span
                            className={`font-medium px-2 py-0.5 rounded-full ${(step.data as any).isSafe ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-red-100 text-red-700"}`}
                          >
                            {(step.data as any).isSafe
                              ? "Safe"
                              : "Threats Found"}
                          </span>
                        </div>
                        {(step.data as any).matches &&
                        (step.data as any).matches.length > 0 ? (
                          <div>
                            <span className="text-slate-500">Threats:</span>
                            <ul className="mt-1 list-disc list-inside">
                              {((step.data as any).matches as any[]).map(
                                (match, i) => (
                                  <li key={i} className="text-red-600">
                                    {match.threat || match}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-slate-500">
                            No threats detected
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {finalVerdict && (
                <div
                  className={`mt-3 p-3 rounded-lg ${getVerdictColor(finalVerdict.verdict)} bg-opacity-10`}
                  style={{
                    backgroundColor:
                      finalVerdict.verdict === "SAFE"
                        ? "rgba(34,197,94,0.1)"
                        : finalVerdict.verdict === "SUSPICIOUS"
                          ? "rgba(234,179,8,0.1)"
                          : "rgba(239,68,68,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getVerdictColor(finalVerdict.verdict)}`}
                    >
                      {finalVerdict.verdict}
                    </span>
                    <span className="text-xs text-slate-500">
                      {Math.round(finalVerdict.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
                    {finalVerdict.recommendation}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Reasons:
                    </p>
                    <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {finalVerdict.reasons.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleAnalyseEmail}
            disabled={
              !emailData || !emailData.links.length || analyzingDomain !== null
            }
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            {analyzingDomain ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Analyse Email
              </>
            )}
          </button>
        </>
      )}

      <div className="mt-auto pt-2 border-t border-slate-200 dark:border-slate-700">
        <p className="text-xs text-slate-400 text-center">TrustInbox © 2026</p>
      </div>
    </div>
  );
}
