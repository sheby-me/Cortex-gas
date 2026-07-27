import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Map, Sparkles, Plus } from "lucide-react";
import { roadmaps } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/roadmaps")({
  head: () => ({
    meta: [
      { title: "Roadmaps — Cortex" },
      { name: "description", content: "Multi-week AI roadmaps for any skill or exam." },
    ],
  }),
  component: RoadmapPage,
});

function RoadmapPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Roadmaps</h1>
          <p className="mt-1 text-muted-foreground">
            Structured, multi-week plans generated for you.
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
          <Sparkles className="mr-1.5 h-4 w-4" />
          Generate roadmap
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roadmaps.map((r) => (
          <Card key={r.id} className="overflow-hidden rounded-2xl border-border p-0 shadow-soft">
            <div className={`flex h-28 items-end bg-gradient-to-br ${r.color} p-4`}>
              <Map className="h-6 w-6 text-white/90" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold tracking-tight">{r.title}</h3>
              <div className="mt-1 text-xs text-muted-foreground">
                {r.weeks} weeks · {r.milestones} milestones
              </div>
              <div className="mt-3">
                <Progress value={r.progress} className="h-1.5" />
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{r.progress}% complete</span>
                  <Badge variant="secondary" className="rounded-full">
                    In progress
                  </Badge>
                </div>
              </div>
              <Button className="mt-4 w-full rounded-xl" variant="outline">
                Continue
              </Button>
            </div>
          </Card>
        ))}
        <Card className="grid place-items-center rounded-2xl border-dashed border-border p-5 text-center shadow-soft">
          <div>
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-accent">
              <Plus className="h-5 w-5" />
            </div>
            <div className="font-semibold">Create custom roadmap</div>
            <div className="mt-1 text-xs text-muted-foreground">
              AI-generated based on your goal.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
