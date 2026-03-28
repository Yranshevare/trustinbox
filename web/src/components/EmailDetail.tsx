"use client";

import { cn } from "@/lib/utils";

interface EmailLink {
  text: string;
  url: string;
  isPhishing: boolean;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  links: EmailLink[];
  isPhishing: boolean;
  date: string;
}

interface EmailDetailProps {
  email: Email;
  onBack: () => void;
  onLinkClick: (link: EmailLink) => void;
}

export function EmailDetail({ email, onBack, onLinkClick }: EmailDetailProps) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors group"
      >
        <svg
          className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to inbox
      </button>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-lg shadow-black/5">
        <div
          className={cn(
            "px-6 py-4 border-b",
            email.isPhishing
              ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-card"
              : "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-card",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {email.isPhishing ? (
                <>
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-red-600 dark:text-red-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
                    ⚠️ Phishing Detected
                  </span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                    ✓ Safe Email
                  </span>
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{email.date}</span>
          </div>
        </div>

        <div className="p-6">
          <div className="border-b pb-4 mb-4">
            <h3 className="text-xl font-semibold">{email.subject}</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-medium">
                  {email.from.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                From: {email.from}
              </p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="text-sm leading-relaxed">{email.body}</p>

            {email.links.length > 0 && (
              <div className="mt-6 pt-5 border-t space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Links in this email ({email.links.length})
                </p>
                {email.links.map((link, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onLinkClick(link)}
                    className={cn(
                      "block w-full text-left p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-lg",
                      link.isPhishing
                        ? "bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-card border-red-200 dark:border-red-800/30 hover:border-red-400 hover:shadow-red-500/10"
                        : "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-card border-green-200 dark:border-green-800/30 hover:border-green-400 hover:shadow-green-500/10",
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <span
                        className={cn(
                          "font-semibold",
                          link.isPhishing
                            ? "text-red-700 dark:text-red-300"
                            : "text-green-700 dark:text-green-300",
                        )}
                      >
                        {link.text}
                      </span>
                      {link.isPhishing ? (
                        <svg
                          className="w-5 h-5 text-red-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15,3 21,3 21,9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-green-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                          <polyline points="15,3 21,3 21,9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-2 truncate">
                      {link.url}
                    </span>
                    {link.isPhishing && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
                          />
                        </svg>
                        Suspicious - May steal your information
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
