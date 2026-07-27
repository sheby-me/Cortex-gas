import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Play, Plus } from "lucide-react";
import { quizzes } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/quizzes")({
  head: () => ({
    meta: [
      { title: "Quizzes — Cortex" },
      { name: "description", content: "Adaptive AI-generated quizzes for every subject." },
    ],
  }),
  component: QuizPage,
});

function QuizPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Quizzes</h1>
          <p className="mt-1 text-muted-foreground">Practice, track weaknesses, and level up.</p>
        </div>
        <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" />
          New quiz
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quizzes.map((q) => (
          <Card key={q.id} className="rounded-2xl border-border p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="rounded-full">
                {q.subject}
              </Badge>
              {q.ai && (
                <Badge className="rounded-full border-0 bg-gradient-primary text-white">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI
                </Badge>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">{q.title}</h3>
            <div className="mt-1 text-sm text-muted-foreground">
              {q.questions} questions · {q.difficulty}
            </div>
            <Button className="mt-4 w-full rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
              <Play className="mr-1.5 h-4 w-4" />
              Start quiz
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
