import { useState } from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components";
import { Input } from "@/components";
import { healthCheck } from "@/lib/api";

export function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("http://localhost:3000");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleSave = () => {
    setSaving(true);
    chrome.storage.local.set({ apiUrl }, () => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus("idle");
    const isHealthy = await healthCheck();
    setConnectionStatus(isHealthy ? "success" : "error");
    setTesting(false);
  };

  return (
    <div className="mx-auto min-h-screen max-w-2xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">TrustInBox Settings</h1>
        <p className="text-muted-foreground">
          Configure your phishing detection preferences
        </p>
      </header>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label
                htmlFor="api-endpoint"
                className="mb-2 block text-sm font-medium"
              >
                API Endpoint
              </label>
              <Input
                id="api-endpoint"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : saved ? "Saved!" : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={testConnection}
                disabled={testing}
              >
                {testing ? "Testing..." : "Test Connection"}
              </Button>
            </div>
            {connectionStatus !== "idle" && (
              <p
                className={`text-sm ${
                  connectionStatus === "success"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {connectionStatus === "success"
                  ? "✓ Connection successful"
                  : "✗ Connection failed"}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protection Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Auto-analyze emails on open</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Show threat warnings</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">Block suspicious links</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              TrustInBox Phishing Detector v0.1.0
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              AI-powered phishing detection for Gmail
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
