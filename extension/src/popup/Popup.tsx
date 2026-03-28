import { useEffect, useState } from "react";
import { fetchSession, sendOtp, verifyOtp, storeToken } from "../utils/auth";

type EmailData = {
  senderEmail: string;
  subject: string;
  body: string;
  links: string[];
} | null;

export default function Popup() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "verified">("idle");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailData, setEmailData] = useState<EmailData>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await fetchSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          setStatus("verified");
          setMessage(`Logged in as ${session.user.email}`);
        }
      } catch {
        // ignore, not logged in
      }
    })();
  }, []);

  const handleSendOtp = async () => {
    if (!email) {
      setMessage("Please type your email first.");
      return;
    }

    setIsLoading(true);
    setMessage("Sending OTP...");

    try {
      await sendOtp(email);
      setStatus("sent");
      setMessage("OTP sent to your email. Check inbox/spam.");
    } catch (e) {
      setMessage((e as Error).message);
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
      if (result?.token) {
        await storeToken(result.token);
      }
      setStatus("verified");
      setUserEmail(email);
      setMessage("OTP verified. You are logged in.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const extractEmail = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "extractEmailDetails",
      });
      if (response?.success && response.data) {
        setEmailData(response.data);
      }
    } catch (e) {
      console.error("Failed to extract email:", e);
    } finally {
    }
  };

  useEffect(() => {
    extractEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="my-ext"
      className="container"
      data-theme="light"
      style={{ minWidth: "350px" }}
    >
      <h2>Email Details</h2>

      {emailData && (
        <div style={{ marginBottom: "16px", textAlign: "left" }}>
          <p>
            <strong>From:</strong> {emailData.senderEmail}
          </p>
          <p>
            <strong>Subject:</strong> {emailData.subject}
          </p>
          <p>
            <strong>Body:</strong>
          </p>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "12px",
              maxHeight: "150px",
              overflow: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {emailData.body.slice(0, 500)}
            {emailData.body.length > 500 && "..."}
          </pre>
          <p>
            <strong>Links ({emailData.links.length}):</strong>
          </p>
          <ul
            style={{
              fontSize: "11px",
              paddingLeft: "20px",
              maxHeight: "100px",
              overflow: "auto",
            }}
          >
            {emailData.links.slice(0, 10).map((link, i) => (
              <li key={i} style={{ wordBreak: "break-all" }}>
                {link}
              </li>
            ))}
            {emailData.links.length > 10 && (
              <li>...and {emailData.links.length - 10} more</li>
            )}
          </ul>
        </div>
      )}

      <hr />

      <h2>Extension Auth</h2>
      {status === "verified" ? (
        <div>
          <p className="text-success">Logged in as: {userEmail}</p>
        </div>
      ) : (
        <>
          <div className="form-control">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered"
            />
          </div>
          <button
            type="button"
            className="btn btn-primary mt-2"
            onClick={handleSendOtp}
            disabled={isLoading}
          >
            Send OTP
          </button>

          {status === "sent" && (
            <>
              <div className="form-control mt-2">
                <label className="label" htmlFor="otp">
                  OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="input input-bordered"
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary mt-2"
                onClick={handleVerifyOtp}
                disabled={isLoading}
              >
                Verify OTP
              </button>
            </>
          )}
        </>
      )}

      <p className="mt-2">{message}</p>
    </div>
  );
}
