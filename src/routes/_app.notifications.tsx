import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Coins, LifeBuoy, Users, Award, Calendar } from "lucide-react";
import { notifications } from "@/lib/mock-data";

const iconOf: Record<string, React.ComponentType<{ className?: string }>> = {
  credit: Coins,
  sos: LifeBuoy,
  buddy: Users,
  achievement: Award,
  session: Calendar,
};

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Cortex" },
      { name: "description", content: "Bookings, credits, sessions and community activity." },
    ],
  }),
  component: NotifPage,
});

function NotifPage() {
  return (
    <div className="mx-auto max-w-3xl p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-4xl tracking-tight flex items-center gap-3">
          <Bell className="h-7 w-7 text-primary" />
          Notifications
        </h1>
        <Button variant="outline" className="rounded-xl">
          Mark all read
        </Button>
      </div>
      <Card className="rounded-2xl border-border p-2 shadow-soft">
        {notifications.map((n) => {
          const Icon = iconOf[n.type] ?? Bell;
          return (
            <div key={n.id} className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted/60">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="text-sm">{n.text}</div>
                <div className="text-xs text-muted-foreground">{n.time}</div>
              </div>
              <div className="mt-2 h-2 w-2 rounded-full bg-primary" />
            </div>
          );
        })}
      </Card>
    </div>
  );
}
