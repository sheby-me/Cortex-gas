import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Users, Sparkles, Plus, Calendar, Clock } from "lucide-react";
import { buddies } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/buddy")({
  head: () => ({
    meta: [
      { title: "Study Buddy — Cortex" },
      { name: "description", content: "Find peers preparing for the same exam or topic." },
    ],
  }),
  component: BuddyPage,
});

function BuddyPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Study buddy</h1>
          <p className="mt-1 text-muted-foreground">
            Match with peers by topic, exam date, timezone and pace.
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" />
          New buddy request
        </Button>
      </div>

      <Card className="mb-6 rounded-2xl border-border bg-gradient-mesh p-6 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          AI matched based on your goals
        </div>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          You're preparing for <b>Data Structures Midterm</b> and <b>React</b>. Here are peers with
          the same window.
        </p>
      </Card>

      <div className="mb-4 grid gap-2 md:grid-cols-[1fr_auto_auto_auto]">
        <Input placeholder="Topic e.g. IELTS, DSA, React…" className="h-10 rounded-xl" />
        <Button variant="outline" className="rounded-xl h-10">
          Exam date
        </Button>
        <Button variant="outline" className="rounded-xl h-10">
          Timezone
        </Button>
        <Button variant="outline" className="rounded-xl h-10">
          Level
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {buddies.map((b) => (
          <Card key={b.id} className="rounded-2xl border-border p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src={b.avatar} />
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate font-semibold">{b.name}</div>
                  <Badge className="rounded-full bg-gradient-primary text-white border-0">
                    {b.match}% match
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {b.uni} · {b.tz}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl bg-muted/50 p-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                Focus
              </div>
              <div className="mt-0.5 text-sm font-semibold">{b.topic}</div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {b.exam}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  2h/day
                </span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" className="rounded-xl">
                Message
              </Button>
              <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
                Team up
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
