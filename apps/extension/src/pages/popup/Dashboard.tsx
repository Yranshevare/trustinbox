import { useState } from "react";
import { signOut } from "@/auth/client";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/components";

interface DashboardProps {
  user: {
    email: string;
    name: string | null;
    image?: string | null;
  };
}

export function Dashboard({ user }: DashboardProps) {
  const [stats] = useState({ analyzed: 0, threats: 0 });

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <span className="text-lg">👤</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">
              {user.name || user.email.split("@")[0]}
            </p>
            <p className="text-muted-foreground text-xs">{user.email}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Sign Out
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Protection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-xl text-green-500">✓</span>
            <span className="text-sm">Active Protection</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{stats.analyzed}</p>
              <p className="text-muted-foreground text-xs">Emails Analyzed</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{stats.threats}</p>
              <p className="text-muted-foreground text-xs">Threats Blocked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs">
        <p>Open Gmail to analyze emails</p>
        <p className="mt-1">🛡️ Powered by TrustInBox</p>
      </div>
    </div>
  );
}
