import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import * as Icons from "lucide-react";
import { aiTools } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({
    meta: [
      { title: "AI Study Assistant — Cortex" },
      { name: "description", content: "14 AI tools built for real studying." },
    ],
  }),
  component: AiPage,
});

interface GenerationItem {
  id: string;
  toolId: string;
  toolName: string;
  prompt: string;
  response: string;
  timestamp: string;
}

const TOOL_PLACEHOLDERS: Record<string, string> = {
  study: "e.g. Explain semaphores with a real-world analogy, then quiz me on 5 questions.",
  lecture: "e.g. Turn 'Distributed Systems Deadlocks' into a 30-minute structured lecture outline.",
  pdf: "e.g. Summarize the key concepts from my Operating Systems notes on paging and virtual memory.",
  flash: "e.g. Generate 5 spaced-repetition flashcards for React Hooks and state management.",
  mind: "e.g. Outline a concept mind map connecting Database Indexing, B-Trees, and Query Optimization.",
  quiz: "e.g. Create a 5-question multiple choice quiz on Machine Learning Gradient Descent with explanations.",
  weak: "e.g. Analyze my struggle with Graph Traversal (DFS vs BFS) and recommend review steps.",
  plan: "e.g. Build a balanced 7-day study schedule for my upcoming Calculus & Physics exams.",
  road: "e.g. Design an 8-week learning roadmap to master Full-Stack Web Development.",
  rec: "e.g. I need help with Data Structures in C++. What mentor skills and topics should I look for?",
  hw: "e.g. Give me hints to solve the Two-Pointer LeetCode problem without giving away the full answer.",
  code: "e.g. Debug why my Async/Await promise queue is causing race conditions in TypeScript.",
  mock: "e.g. Conduct a mock behavioral & technical interview round for a Junior Software Engineer position.",
  exam: "e.g. Predict the high-yield topics and practice questions for a System Design final exam.",
};

export function AiPage() {
  const [selectedToolId, setSelectedToolId] = useState<string>("study");
  const [prompt, setPrompt] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [showContext, setShowContext] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");

  const currentTool = aiTools.find((t) => t.id === selectedToolId) || aiTools[0];

  const handleQuickChip = (chipText: string) => {
    if (chipText === "Summarize my notes") {
      setSelectedToolId("pdf");
      setPrompt("Summarize my study notes and highlight key definitions and takeaways.");
    } else if (chipText === "Make flashcards") {
      setSelectedToolId("flash");
      setPrompt("Generate 5 front-and-back flashcards for my study material.");
    } else if (chipText === "Quiz me") {
      setSelectedToolId("quiz");
      setPrompt("Create a 5-question multiple choice quiz with answer explanations.");
    } else if (chipText === "Plan my week") {
      setSelectedToolId("plan");
      setPrompt("Build a structured weekly study plan for my upcoming exams.");
    } else {
      setPrompt(chipText);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a question or prompt for the AI assistant.");
      return;
    }

    setLoading(true);
    setActiveTab("current");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          toolId: currentTool.id,
          toolName: currentTool.name,
          context: context.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate AI response.");
      }

      const newItem: GenerationItem = {
        id: Date.now().toString(),
        toolId: currentTool.id,
        toolName: currentTool.name,
        prompt: prompt.trim(),
        response: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setGenerations((prev) => [newItem, ...prev]);
      toast.success(`${currentTool.name} response generated!`);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Error connecting to AI service.");
    } finally {
      setLoading(false);
    }
  };

  const latestGeneration = generations[0];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-primary shadow-elegant">
            <Icons.Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
              AI Study Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Powered by Google Gemini 3.6 Flash · 14 specialized academic tools.
            </p>
          </div>
        </div>

        {generations.length > 0 && (
          <div className="flex rounded-lg border border-border bg-secondary/50 p-1">
            <button
              onClick={() => setActiveTab("current")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                activeTab === "current"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Latest Result
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                activeTab === "history"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Session History ({generations.length})
            </button>
          </div>
        )}
      </div>

      {/* Main Input Card */}
      <Card className="mb-8 overflow-hidden rounded-3xl border-border shadow-soft">
        <div className="bg-gradient-mesh p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-full bg-background/80 backdrop-blur font-medium"
              >
                Tool: <span className="text-foreground font-semibold ml-1">{currentTool.name}</span>
              </Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {currentTool.desc}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowContext(!showContext)}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Icons.Paperclip className="h-3.5 w-3.5" />
              {showContext ? "Hide study material input" : "+ Add study material / notes context"}
            </button>
          </div>

          {showContext && (
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Paste study notes, lecture transcript, or context text here (optional):
              </label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Paste your course notes or material here to ground the AI's response..."
                className="min-h-20 rounded-xl border-border bg-background/90 text-sm shadow-xs"
              />
            </div>
          )}

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              TOOL_PLACEHOLDERS[currentTool.id] || "Ask anything or specify your learning goal..."
            }
            className="min-h-28 rounded-2xl border-border bg-background/90 text-base shadow-soft backdrop-blur focus-visible:ring-primary"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {["Summarize my notes", "Make flashcards", "Quiz me", "Plan my week"].map((c) => (
                <Button
                  key={c}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickChip(c)}
                  className="rounded-full bg-background/70 backdrop-blur text-xs hover:bg-background"
                >
                  {c}
                </Button>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90 px-5"
            >
              {loading ? (
                <>
                  <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Icons.Sparkles className="mr-2 h-4 w-4" />
                  Generate with Gemini
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Results View */}
      {activeTab === "current" && latestGeneration && (
        <Card className="mb-8 rounded-2xl border-border p-6 shadow-soft bg-background">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-primary text-white border-0">
                {latestGeneration.toolName}
              </Badge>
              <span className="text-xs text-muted-foreground">{latestGeneration.timestamp}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(latestGeneration.response)}
                className="rounded-lg h-8 text-xs"
              >
                <Icons.Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={loading}
                className="rounded-lg h-8 text-xs"
              >
                <Icons.RotateCw className="mr-1.5 h-3.5 w-3.5" />
                Regenerate
              </Button>
            </div>
          </div>

          <div className="mb-3 rounded-lg bg-secondary/50 p-3 text-xs font-medium text-foreground">
            <span className="text-muted-foreground">Prompt: </span>
            {latestGeneration.prompt}
          </div>

          <div className="prose prose-sm max-w-none dark:prose-invert text-foreground whitespace-pre-wrap leading-relaxed font-sans border-t border-border/40 pt-4">
            {latestGeneration.response}
          </div>
        </Card>
      )}

      {/* History View */}
      {activeTab === "history" && (
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Session History</h2>
          {generations.map((gen) => (
            <Card key={gen.id} className="rounded-2xl border-border p-5 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{gen.toolName}</Badge>
                  <span className="text-xs text-muted-foreground">{gen.timestamp}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(gen.response)}
                  className="h-7 text-xs"
                >
                  <Icons.Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </Button>
              </div>
              <p className="text-xs font-semibold text-foreground mb-2">Q: {gen.prompt}</p>
              <div className="text-xs text-muted-foreground whitespace-pre-wrap line-clamp-6 bg-secondary/30 p-3 rounded-xl border border-border/50">
                {gen.response}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tool Cards Grid */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          All AI Study Tools ({aiTools.length})
        </h2>
        <span className="text-xs text-muted-foreground">Click a tool to switch mode</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {aiTools.map((t) => {
          const Icon =
            (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[
              t.icon
            ] ?? Icons.Sparkles;
          const isSelected = t.id === selectedToolId;

          return (
            <Card
              key={t.id}
              onClick={() => {
                setSelectedToolId(t.id);
                toast.info(`Switched to ${t.name}`);
              }}
              className={`group cursor-pointer rounded-2xl border p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant ${
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                    isSelected
                      ? "bg-gradient-primary text-white"
                      : "bg-accent text-accent-foreground group-hover:bg-gradient-primary group-hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {isSelected && (
                  <Badge className="bg-primary text-primary-foreground text-[10px]">Active</Badge>
                )}
              </div>
              <div className="text-sm font-semibold tracking-tight">{t.name}</div>
              <div className="mt-1 text-xs text-muted-foreground leading-snug">{t.desc}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
