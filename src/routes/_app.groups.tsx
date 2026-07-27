import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, MessagesSquare } from "lucide-react";
import { groups } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/groups")({
  head: () => ({
    meta: [
      { title: "Study Groups — Cortex" },
      {
        name: "description",
        content: "Persistent study rooms with chat, notes, files and progress.",
      },
    ],
  }),
  component: GroupsPage,
});

function GroupsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight">Study groups</h1>
          <p className="mt-1 text-muted-foreground">
            Chat, notes, calendars and shared progress — one room per goal.
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" />
          Create group
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((g) => (
          <Card
            key={g.id}
            className="group overflow-hidden rounded-2xl border-border p-0 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className={`h-24 bg-gradient-to-br ${g.color}`} />
            <div className="p-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="rounded-full">
                  {g.subject}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  {g.active}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">{g.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {g.members} members
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="rounded-xl flex-1">
                  Preview
                </Button>
                <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90 flex-1">
                  <MessagesSquare className="mr-1.5 h-4 w-4" />
                  Join
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
