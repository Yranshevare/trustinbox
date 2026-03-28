import { MailCheckIcon } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <MailCheckIcon />
      <h1 className="text-lg font-medium">TrustInBox</h1>
    </div>
  );
}
