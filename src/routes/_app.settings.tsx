import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Cortex" },
      { name: "description", content: "Account, appearance, notifications and integrations." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      <h1 className="mb-6 font-display text-4xl tracking-tight">Settings</h1>
      <Card className="rounded-2xl border-border p-6 shadow-soft">
        <h2 className="mb-4 font-semibold">Account</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input placeholder="Your name" className="mt-1.5 rounded-md" />
          </div>
          <div>
            <Label>Email</Label>
            <Input placeholder="you@example.com" className="mt-1.5 rounded-md" />
          </div>
          <div>
            <Label>School / Institution</Label>
            <Input placeholder="Where you learn" className="mt-1.5 rounded-md" />
          </div>
          <div>
            <Label>Timezone</Label>
            <Input placeholder="e.g. GMT+1" className="mt-1.5 rounded-md" />
          </div>
        </div>
      </Card>
      <Card className="mt-4 rounded-2xl border-border p-6 shadow-soft">
        <h2 className="mb-4 font-semibold">Preferences</h2>
        {[
          { label: "Dark mode", desc: "Use system theme by default." },
          { label: "Email notifications", desc: "Bookings, messages and credit events." },
          { label: "Show me on leaderboards", desc: "Others can see your ranking." },
          { label: "Available for SOS", desc: "Ping me when a match appears." },
        ].map((p, i) => (
          <div key={p.label}>
            {i > 0 && <Separator className="my-4" />}
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-muted-foreground">{p.desc}</div>
              </div>
              <Switch defaultChecked={i < 2} />
            </div>
          </div>
        ))}
      </Card>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" className="rounded-md">
          Cancel
        </Button>
        <Button className="rounded-md">Save changes</Button>
      </div>
    </div>
  );
}
