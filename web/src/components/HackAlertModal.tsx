"use client";

interface HackAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  link?: { text: string; url: string };
}

export function HackAlertModal({ isOpen, onClose, link }: HackAlertModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close alert"
        className="fixed inset-0 bg-black/70 z-40 cursor-default backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-red-950 via-red-900 to-black z-50 overflow-hidden shadow-2xl">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-32 left-1/2 -translate-x-1/2 w-56 h-56 bg-red-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <div className="absolute top-1/2 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 p-8 h-full flex flex-col items-center justify-center text-center">
          <div className="mb-8 relative">
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-2xl shadow-red-500/30">
              <svg
                className="w-14 h-14 text-white"
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
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
              <span className="text-xl">⚠️</span>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 tracking-wide">
            THREAT DETECTED
          </h1>

          <p className="text-red-300 text-lg font-medium mb-8">
            Phishing Link Blocked
          </p>

          {link && (
            <div className="bg-black/50 rounded-xl p-4 mb-6 border border-red-500/30 w-full max-w-xs">
              <p className="text-red-400 text-xs uppercase tracking-wider mb-2">
                Malicious URL
              </p>
              <p className="text-white text-sm font-mono break-all">
                {link.url}
              </p>
            </div>
          )}

          <div className="space-y-4 w-full max-w-xs">
            <div className="flex items-center gap-3 text-red-300">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    strokeWidth="2"
                    strokeDasharray="60"
                    strokeDashoffset="20"
                    className="opacity-50"
                  />
                </svg>
              </div>
              <span className="text-sm">Analyzing URL...</span>
            </div>
            <div className="flex items-center gap-3 text-red-300">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="text-sm">Protection active</span>
            </div>
            <div className="flex items-center gap-3 text-green-400">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-sm">You&apos;re protected</span>
            </div>
          </div>

          <div className="mt-10 space-y-3 w-full max-w-xs">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Continue Safely
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-6 bg-white/5 hover:bg-white/10 text-red-200 text-sm rounded-xl transition-all"
            >
              View Details
            </button>
          </div>

          <p className="mt-8 text-red-400/40 text-xs font-mono">
            TrustInBox Protected
          </p>
        </div>
      </div>
    </>
  );
}
