"use client";

import { cn } from "@/lib/utils";

interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  date: string;
}

interface EmailListProps {
  emails: Email[];
  onSelectEmail: (email: Email) => void;
}

export function EmailList({ emails, onSelectEmail }: EmailListProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <p className="text-sm font-medium">Inbox</p>
          <span className="text-xs text-muted-foreground">
            ({emails.length})
          </span>
        </div>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-2">
        {emails.map((email) => (
          <button
            key={email.id}
            type="button"
            onClick={() => onSelectEmail(email)}
            className={cn(
              "w-full text-left p-4 rounded-xl border transition-all duration-200 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5",
              email.isPhishing
                ? "bg-gradient-to-r from-red-50/80 to-white dark:from-red-950/30 dark:to-card border-red-200/50 dark:border-red-800/30 hover:border-red-300"
                : "bg-card border-border hover:bg-muted/50",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 mb-1">
                  {email.isPhishing ? (
                    <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-red-600 dark:text-red-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-green-600 dark:text-green-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                  )}
                  <p
                    className={cn(
                      "font-medium text-sm truncate",
                      email.isPhishing ? "text-red-900 dark:text-red-200" : "",
                    )}
                  >
                    {email.from}
                  </p>
                </div>
                <p className="text-sm font-semibold mt-1.5 truncate">
                  {email.subject}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                  {email.body}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {email.date}
                </span>
                {email.isPhishing && (
                  <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400">
                    Phishing
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
