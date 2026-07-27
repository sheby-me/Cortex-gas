import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Play,
  Plus,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { quizzes as initialQuizzes } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/quizzes")({
  head: () => ({
    meta: [
      { title: "Quizzes — Cortex" },
      { name: "description", content: "Adaptive AI-generated quizzes for every subject." },
    ],
  }),
  component: QuizPage,
});

interface QuizItem {
  id: string;
  title: string;
  subject: string;
  questions: number;
  difficulty: string;
  ai: boolean;
  content?: string;
}

export function QuizPage() {
  const [quizList, setQuizList] = useState<QuizItem[]>(
    initialQuizzes.map((q) => ({
      ...q,
      content: `Sample AI Quiz Content for ${q.title}:\n\nQuestion 1: What is the primary characteristic of this topic?\nA) High efficiency\nB) High complexity\nC) Low overhead\nD) Dynamic allocation\n\nCorrect Answer: A\nExplanation: High efficiency is central to ${q.title}.`,
    })),
  );

  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [showGenerator, setShowGenerator] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("Medium");
  const [loading, setLoading] = useState<boolean>(false);
  const [aiQuizResponse, setAiQuizResponse] = useState<string | null>(null);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a topic or subject for the quiz.");
      return;
    }

    setLoading(true);
    setAiQuizResponse(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a 5-question multiple choice quiz on '${topic}' in subject '${
            subject || "General Science"
          }' with difficulty '${difficulty}'.`,
          toolId: "quiz",
          toolName: "Quiz Generator",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI quiz.");
      }

      const newQuiz: QuizItem = {
        id: "q_ai_" + Date.now(),
        title: topic.trim(),
        subject: subject.trim() || "AI Generated",
        questions: 5,
        difficulty,
        ai: true,
        content: data.text,
      };

      setQuizList((prev) => [newQuiz, ...prev]);
      setActiveQuiz(newQuiz);
      setAiQuizResponse(data.text);
      setShowGenerator(false);
      toast.success(`Generated quiz for "${topic}"!`);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error creating AI quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight font-medium">Quizzes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Practice, generate AI tests on any topic, and test your knowledge.
          </p>
        </div>
        <Button
          onClick={() => setShowGenerator(!showGenerator)}
          className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90"
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          {showGenerator ? "Close Generator" : "Generate AI Quiz"}
        </Button>
      </div>

      {/* AI Quiz Generator Panel */}
      {showGenerator && (
        <Card className="mb-8 overflow-hidden rounded-2xl border-primary/30 p-6 shadow-soft bg-gradient-mesh">
          <div className="flex items-center gap-2 mb-4">
            <Badge className="bg-gradient-primary text-white border-0">AI Generator</Badge>
            <h2 className="text-lg font-semibold">Generate Custom Quiz with Gemini</h2>
          </div>

          <form onSubmit={handleGenerateQuiz} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Topic / Subtopic *
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Binary Search Trees, Organic Chemistry, World War II"
                  required
                  className="rounded-xl bg-background"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Subject Name
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="rounded-xl bg-background"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Difficulty:</span>
                {["Easy", "Medium", "Hard"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                      difficulty === d
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-gradient-primary text-white shadow-elegant"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" /> Build Quiz
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Active Quiz View */}
      {activeQuiz && (
        <Card className="mb-8 rounded-2xl border-border p-6 shadow-soft bg-background">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveQuiz(null)}
                  className="h-8 rounded-lg text-xs"
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Quizzes
                </Button>
                <Badge variant="secondary">{activeQuiz.subject}</Badge>
                {activeQuiz.ai && (
                  <Badge className="bg-gradient-primary text-white border-0">
                    <Sparkles className="mr-1 h-3 w-3" /> AI Generated
                  </Badge>
                )}
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">{activeQuiz.title}</h2>
            </div>
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert text-foreground whitespace-pre-wrap leading-relaxed font-sans bg-secondary/20 p-5 rounded-2xl border border-border/60">
            {activeQuiz.content || "Loading quiz content..."}
          </div>
        </Card>
      )}

      {/* Quiz Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quizList.map((q) => (
          <Card
            key={q.id}
            className="rounded-2xl border-border p-5 shadow-soft hover:shadow-elegant transition"
          >
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
            <Button
              onClick={() => setActiveQuiz(q)}
              className="mt-4 w-full rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90"
            >
              <Play className="mr-1.5 h-4 w-4" />
              {activeQuiz?.id === q.id ? "Viewing Quiz" : "Start Quiz"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
