import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as Icons from "lucide-react";
import { achievements } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — Cortex" },
      { name: "description", content: "Badges, milestones, and shareable credentials." },
    ],
  }),
  component: AchPage,
});

function AchPage() {
  const earned = achievements.filter((a) => a.earned).length;
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Achievements</h1>
          <p className="mt-1 text-muted-foreground">
            {earned} of {achievements.length} unlocked · Keep going
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {achievements.map((a) => {
          const Icon =
            (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
              a.icon
            ] ?? Icons.Award;
          return (
            <Card
              key={a.id}
              className={`relative overflow-hidden rounded-2xl border-border p-5 text-center shadow-soft ${a.earned ? "" : "opacity-60"}`}
            >
              {a.earned && <div className="absolute inset-0 bg-gradient-mesh opacity-40" />}
              <div className="relative">
                <div
                  className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl ${a.earned ? "bg-gradient-primary text-white shadow-elegant" : "bg-muted text-muted-foreground"}`}
                >
                  <Icon className="h-7 w-7" />
                </div>
                <div className="mt-3 font-semibold tracking-tight">{a.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">{a.desc}</div>
                <Badge variant={a.earned ? "secondary" : "outline"} className="mt-3 rounded-full">
                  {a.earned ? "Unlocked" : "Locked"}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
