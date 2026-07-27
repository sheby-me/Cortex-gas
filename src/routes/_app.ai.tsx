import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import * as Icons from "lucide-react";
import { aiTools } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({
    meta: [
      { title: "AI Study Assistant — Cortex" },
      { name: "description", content: "14 AI tools built for real studying." },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-elegant">
          <Icons.Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-4xl tracking-tight">AI study assistant</h1>
          <p className="text-muted-foreground">Powered by your notes, your goals, your history.</p>
        </div>
      </div>

      <Card className="mb-8 overflow-hidden rounded-3xl border-border p-0 shadow-elegant">
        <div className="bg-gradient-mesh p-6">
          <Badge variant="secondary" className="rounded-full bg-background/70 backdrop-blur">
            Ask anything
          </Badge>
          <Textarea
            placeholder="e.g. Explain semaphores with a real-world analogy, then quiz me on 5 questions."
            className="mt-4 min-h-24 rounded-2xl border-border bg-background/80 text-base shadow-soft backdrop-blur"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {["Summarize my notes", "Make flashcards", "Quiz me", "Plan my week"].map((c) => (
                <Button
                  key={c}
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-background/70 backdrop-blur"
                >
                  {c}
                </Button>
              ))}
            </div>
            <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
              <Icons.Send className="mr-1.5 h-4 w-4" />
              Generate
            </Button>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        All tools
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {aiTools.map((t) => {
          const Icon =
            (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
              t.icon
            ] ?? Icons.Sparkles;
          return (
            <Card
              key={t.id}
              className="group cursor-pointer rounded-2xl border-border p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground transition group-hover:bg-gradient-primary group-hover:text-white">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-semibold tracking-tight">{t.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
