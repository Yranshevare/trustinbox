"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth/context";
import { cn } from "@/lib/utils";

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  links: { text: string; url: string; isPhishing: boolean }[];
  isPhishing: boolean;
  date: string;
}

const sampleEmails: Email[] = [
  {
    id: "1",
    from: "security@amaz0n-verify.com",
    subject: "URGENT: Your account has been compromised!",
    body: "We detected suspicious activity on your account. Your account will be suspended within 24 hours unless you verify your information immediately.",
    links: [
      { text: "Verify Now", url: "https://amaz0n-verify.com/secure", isPhishing: true },
      { text: "Learn More", url: "https://amaz0n-verify.com/info", isPhishing: true },
    ],
    isPhishing: true,
    date: "2 min ago",
  },
  {
    id: "2",
    from: "support@paypa1.com",
    subject: "Your PayPal account has been limited",
    body: "We have temporarily limited your account access. Please confirm your identity to restore full access to your account.",
    links: [
      { text: "Confirm Identity", url: "https://paypa1.com/verify", isPhishing: true },
      { text: "View Details", url: "https://paypa1.com/account", isPhishing: true },
    ],
    isPhishing: true,
    date: "15 min ago",
  },
  {
    id: "3",
    from: "noreply@micros0ft.com",
    subject: "Action Required: Verify your email",
    body: "Your Microsoft 365 subscription is about to expire. Update your payment information to continue using our services.",
    links: [
      { text: "Update Payment", url: "https://micros0ft.com/payment", isPhishing: true },
    ],
    isPhishing: true,
    date: "1 hour ago",
  },
  {
    id: "4",
    from: "alert@bankofamerica-secure.com",
    subject: "Unusual sign-in attempt detected",
    body: "We noticed a new device signed into your account from IP Address: 192.168.1.1 in Moscow, Russia. If this wasn't you, secure your account immediately.",
    links: [
      { text: "Secure My Account", url: "https://bankofamerica-secure.com/lock", isPhishing: true },
      { text: "Report Not Me", url: "https://bankofamerica-secure.com/false", isPhishing: true },
    ],
    isPhishing: true,
    date: "2 hours ago",
  },
  {
    id: "5",
    from: "newsletter@github.com",
    subject: "New features coming to GitHub",
    body: "We're excited to announce new features for all developers. Check out what's new and how to get started.",
    links: [
      { text: "Read More", url: "https://github.com/blog", isPhishing: false },
    ],
    isPhishing: false,
    date: "1 day ago",
  },
];

function HackAlertSidebar({ 
  isOpen, 
  onClose, 
  link 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  link?: { text: string; url: string };
}) {
  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close alert"
        className="fixed inset-0 bg-black/60 z-40 animate-fade-in cursor-default"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-red-950 via-red-900 to-black z-50 animate-slide-in overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        
        <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center text-center">
          <div className="mb-6 relative">
            <svg className="w-24 h-24 text-red-500 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 rounded-full animate-ping" aria-hidden="true" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4 tracking-wider animate-pulse">
            ⚠️ DANGER ⚠️
          </h1>
          
          <h2 className="text-2xl text-red-400 font-semibold mb-6 animate-pulse">
            SYSTEM COMPROMISED
          </h2>
          
          <div className="bg-black/40 rounded-xl p-6 mb-6 border border-red-500/30">
            <p className="text-red-300 text-lg font-mono mb-2">
              MALWARE DETECTED
            </p>
            <p className="text-red-200 text-sm">
              Your system has been infected with a remote access trojan (RAT)
            </p>
          </div>

          <div className="space-y-3 text-left w-full max-w-xs">
            <div className="flex items-center gap-3 text-red-300">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              <span className="text-sm">Scanning for vulnerabilities...</span>
            </div>
            <div className="flex items-center gap-3 text-red-300">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ animationDelay: "0.2s" }} aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              <span className="text-sm">Data breach in progress...</span>
            </div>
            <div className="flex items-center gap-3 text-red-300">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ animationDelay: "0.4s" }} aria-hidden="true">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="60" strokeDashoffset="20" />
              </svg>
              <span className="text-sm">Credentials being exfiltrated...</span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg animate-pulse transition-all"
            >
              DISCONNECT IMMEDIATELY
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full py-2 px-6 bg-red-900/50 hover:bg-red-800/50 text-red-200 text-sm rounded-lg transition-all"
            >
              Close (Not Recommended)
            </button>
          </div>

          <p className="mt-6 text-red-400/50 text-xs font-mono">
            IP: 192.168.██.██ | MAC: ██:██:██:██:██:██
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
}

function Simulation() {
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showHackAlert, setShowHackAlert] = useState(false);
  const [clickedLink, setClickedLink] = useState<{ text: string; url: string } | null>(null);

  const handleLinkClick = (link: { text: string; url: string }) => {
    setClickedLink(link);
    setShowHackAlert(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Simulation</h2>
        <p className="text-sm text-muted-foreground">Click on links in emails to test detection</p>
      </div>

      {!selectedEmail ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-4">Inbox (5)</p>
          {sampleEmails.map((email) => (
            <button
              key={email.id}
              type="button"
              onClick={() => setSelectedEmail(email)}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all hover:shadow-md",
                email.isPhishing 
                  ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 hover:border-red-300" 
                  : "bg-card border-border hover:bg-muted"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      email.isPhishing ? "bg-red-500" : "bg-green-500"
                    )} />
                    <p className="font-medium text-sm truncate">{email.from}</p>
                  </div>
                  <p className="text-sm font-medium mt-1 truncate">{email.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{email.body}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{email.date}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setSelectedEmail(null)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to inbox
          </button>

          <div className="rounded-lg border bg-card p-6">
            <div className="border-b pb-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={cn(
                  "px-2 py-0.5 text-xs rounded-full",
                  selectedEmail.isPhishing 
                    ? "bg-red-100 text-red-700" 
                    : "bg-green-100 text-green-700"
                )}>
                  {selectedEmail.isPhishing ? "⚠️ Phishing" : "✓ Safe"}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
              <p className="text-sm text-muted-foreground mt-1">From: {selectedEmail.from}</p>
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-sm">{selectedEmail.body}</p>
              
              {selectedEmail.links.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <p className="text-xs text-muted-foreground">Links in this email:</p>
                  {selectedEmail.links.map((link, i) => (
                    <button
                      key={`${link.url}-${i}`}
                      type="button"
                      onClick={() => handleLinkClick(link)}
                      className={cn(
                        "block w-full text-left p-3 rounded-lg border transition-all hover:shadow-md",
                        "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800",
                        "hover:bg-red-100 dark:hover:bg-red-900/30",
                        "text-blue-600 hover:text-blue-700 underline"
                      )}
                    >
                      <span className="flex items-center justify-between">
                        <span className="font-medium">{link.text}</span>
                        <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15,3 21,3 21,9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </span>
                      <span className="text-xs text-muted-foreground block mt-1 truncate">{link.url}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <HackAlertSidebar 
        isOpen={showHackAlert} 
        onClose={() => setShowHackAlert(false)}
        link={clickedLink || undefined}
      />
    </div>
  );
}

function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSession();

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      
      try {
        const res = await fetch(`/api/history?userId=${user.id}`);
        const data = await res.json();
        if (res.ok) {
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <p className="text-sm text-muted-foreground">Your analyzed domains</p>
        </div>
        <p className="text-sm text-muted-foreground">No history yet. Run a simulation first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">History</h2>
        <p className="text-sm text-muted-foreground">Your analyzed domains</p>
      </div>

      <div className="space-y-2">
        {history.map((item) => {
          let verdict = "UNKNOWN";
          try {
            const parsed = JSON.parse(item.finalAiVerdict || "{}");
            verdict = parsed.verdict || "UNKNOWN";
          } catch {}

          return (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.senderEmail || "N/A"}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(item.id).toLocaleDateString()}
                </p>
              </div>
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded ml-2",
                verdict === "SAFE" && "bg-green-100 text-green-700",
                verdict === "SUSPICIOUS" && "bg-yellow-100 text-yellow-700",
                verdict === "PHISHING" && "bg-red-100 text-red-700"
              )}>
                {verdict}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useSession();
  const [activeTab, setActiveTab] = useState<"simulation" | "history">("simulation");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please log in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <h1 className="font-semibold text-lg">TrustInBox</h1>
        </div>
        
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground">Free Plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2">
          <button
            type="button"
            onClick={() => setActiveTab("simulation")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              activeTab === "simulation"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Simulation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              activeTab === "history"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
        </nav>

        <div className="p-4 border-t">
          <button type="button" className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        {activeTab === "simulation" ? <Simulation /> : <History />}
      </main>
    </div>
  );
}
