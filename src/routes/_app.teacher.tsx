import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, Coins, Users, Plus, Star } from "lucide-react";

export const Route = createFileRoute("/_app/teacher")({
  head: () => ({
    meta: [
      { title: "Teacher Studio — Cortex" },
      { name: "description", content: "Manage courses, availability, bookings and earnings." },
    ],
  }),
  component: TeacherPage,
});

function TeacherPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="secondary" className="rounded-full mb-2">
            Verified educator
          </Badge>
          <h1 className="font-display text-4xl tracking-tight flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            Teacher studio
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your bookings, students, courses and earnings — one place.
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" />
          New course
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { icon: Coins, l: "This month", v: "$2,412", s: "+18%" },
          { icon: Users, l: "Active students", v: "84", s: "+6" },
          { icon: Calendar, l: "Sessions", v: "27", s: "this week" },
          { icon: Star, l: "Rating", v: "4.9", s: "214 reviews" },
        ].map((s) => (
          <Card key={s.l} className="rounded-2xl border-border p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
                <s.icon className="h-4 w-4" />
              </div>
              <Badge variant="secondary" className="rounded-full">
                {s.s}
              </Badge>
            </div>
            <div className="mt-3 text-2xl font-bold">{s.v}</div>
            <div className="text-xs text-muted-foreground">{s.l}</div>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Today's sessions</h2>
          {[
            { t: "10:00", s: "1:1 · Deadlocks · Nia K." },
            { t: "13:30", s: "Group · ML Reading Club (8)" },
            { t: "18:00", s: "1:1 · Transformers · James P." },
          ].map((r) => (
            <div
              key={r.t}
              className="flex items-center justify-between rounded-xl border border-border p-3 mb-2"
            >
              <div>
                <div className="font-semibold">{r.t}</div>
                <div className="text-xs text-muted-foreground">{r.s}</div>
              </div>
              <Button
                size="sm"
                className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
              >
                Join
              </Button>
            </div>
          ))}
        </Card>
        <Card className="rounded-2xl border-border p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Your courses</h2>
          {["Machine Learning 101", "Deep Learning: Transformers", "PyTorch Bootcamp"].map((c) => (
            <div
              key={c}
              className="flex items-center justify-between rounded-xl border border-border p-3 mb-2"
            >
              <div>
                <div className="font-semibold">{c}</div>
                <div className="text-xs text-muted-foreground">Published · 128 enrolled</div>
              </div>
              <Button size="sm" variant="outline" className="rounded-xl">
                Manage
              </Button>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
