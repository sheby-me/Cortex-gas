import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal } from "lucide-react";
import { leaderboard } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Cortex" },
      { name: "description", content: "Top teachers, top learners, top helpers." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-muted-foreground">Weekly ranking · resets Sundays 00:00 UTC</p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {["Credits", "Teaching hours", "Community help", "Streak", "Ratings"].map((t, i) => (
          <Button
            key={t}
            variant={i === 0 ? "default" : "outline"}
            className={`rounded-xl ${i === 0 ? "bg-gradient-primary text-white shadow-elegant" : ""}`}
          >
            {t}
          </Button>
        ))}
      </div>
      {/* Podium */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {leaderboard.slice(0, 3).map((u, i) => (
          <Card
            key={u.rank}
            className={`rounded-2xl border-border p-6 text-center shadow-soft ${i === 0 ? "md:order-2 md:scale-105 bg-gradient-mesh" : "md:order-" + (i === 1 ? 1 : 3)}`}
          >
            <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-white shadow-elegant">
              {i === 0 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
            </div>
            <Avatar className="mx-auto mt-3 h-20 w-20 ring-4 ring-primary/20">
              <AvatarImage src={u.avatar} />
            </Avatar>
            <div className="mt-3 font-semibold">{u.name}</div>
            <Badge variant="secondary" className="mt-1 rounded-full">
              {u.badge}
            </Badge>
            <div className="mt-3 text-2xl font-bold text-gradient">
              {u.credits.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">credits</div>
          </Card>
        ))}
      </div>
      <Card className="rounded-2xl border-border p-2 shadow-soft">
        {leaderboard.map((u) => {
          const you = u.name.includes("You");
          return (
            <div
              key={u.rank}
              className={`flex items-center gap-4 rounded-xl p-3 ${you ? "bg-gradient-mesh" : ""}`}
            >
              <div className="w-8 text-center text-sm font-bold text-muted-foreground">
                #{u.rank}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={u.avatar} />
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{u.name}</div>
                <div className="text-xs text-muted-foreground">
                  {u.hours}h taught · {u.badge}
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Trophy className="h-4 w-4 text-primary" />
                {u.credits.toLocaleString()}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
