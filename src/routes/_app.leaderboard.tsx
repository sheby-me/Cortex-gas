import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Flame, Star, Clock, Heart, Coins } from "lucide-react";
import { leaderboard as initialLeaderboard } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Cortex" },
      { name: "description", content: "Top teachers, top learners, top helpers across Cortex." },
    ],
  }),
  component: LeaderboardPage,
});

type LeaderboardTab = "Credits" | "Teaching hours" | "Community help" | "Streak" | "Ratings";

interface LeaderboardUser {
  rank: number;
  name: string;
  avatar: string;
  credits: number;
  hours: number;
  helpCount: number;
  streak: number;
  rating: number;
  badge: string;
}

export function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("Credits");

  // Enrich initial leaderboard items with metrics
  const fullLeaderboard: LeaderboardUser[] = initialLeaderboard.map((u, i) => ({
    rank: u.rank,
    name: u.name,
    avatar: u.avatar,
    credits: u.credits,
    hours: u.hours || 100 - i * 8,
    helpCount: 150 - i * 12,
    streak: 42 - i * 3,
    rating: Number((4.98 - i * 0.05).toFixed(2)),
    badge: u.badge,
  }));

  // Sort based on selected tab
  const sortedLeaderboard = [...fullLeaderboard]
    .sort((a, b) => {
      if (activeTab === "Credits") return b.credits - a.credits;
      if (activeTab === "Teaching hours") return b.hours - a.hours;
      if (activeTab === "Community help") return b.helpCount - a.helpCount;
      if (activeTab === "Streak") return b.streak - a.streak;
      if (activeTab === "Ratings") return b.rating - a.rating;
      return 0;
    })
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const topThree = sortedLeaderboard.slice(0, 3);

  const getMetricDisplay = (user: LeaderboardUser) => {
    switch (activeTab) {
      case "Credits":
        return { value: `${user.credits.toLocaleString()} cr`, icon: Coins };
      case "Teaching hours":
        return { value: `${user.hours} hrs`, icon: Clock };
      case "Community help":
        return { value: `${user.helpCount} solved`, icon: Heart };
      case "Streak":
        return { value: `${user.streak} days`, icon: Flame };
      case "Ratings":
        return { value: `${user.rating.toFixed(2)} ★`, icon: Star };
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
          Global Leaderboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Weekly rankings updated live · resets Sundays 00:00 UTC
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {(["Credits", "Teaching hours", "Community help", "Streak", "Ratings"] as const).map(
          (tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? "default" : "outline"}
              className={`rounded-xl transition ${
                activeTab === tab
                  ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                  : ""
              }`}
            >
              {tab === "Streak" && <Flame className="mr-1.5 h-4 w-4 text-amber-500" />}
              {tab === "Ratings" && (
                <Star className="mr-1.5 h-4 w-4 text-amber-500 fill-amber-500" />
              )}
              {tab === "Community help" && <Heart className="mr-1.5 h-4 w-4 text-rose-500" />}
              {tab === "Teaching hours" && <Clock className="mr-1.5 h-4 w-4 text-primary" />}
              {tab === "Credits" && <Coins className="mr-1.5 h-4 w-4 text-amber-500" />}
              {tab}
            </Button>
          ),
        )}
      </div>

      {/* Podium Top 3 */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {topThree.map((u, i) => {
          const metric = getMetricDisplay(u);
          const MetricIcon = metric.icon;

          return (
            <Card
              key={u.name}
              className={`rounded-2xl border-border p-6 text-center shadow-soft transition hover:shadow-elegant ${
                i === 0
                  ? "md:order-2 md:scale-105 bg-gradient-mesh border-primary/30"
                  : i === 1
                    ? "md:order-1"
                    : "md:order-3"
              }`}
            >
              <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant mb-2">
                {i === 0 ? <Crown className="h-4 w-4" /> : <Medal className="h-4 w-4" />}
              </div>

              <Avatar className="mx-auto h-20 w-20 ring-4 ring-primary/20">
                <AvatarImage src={u.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {u.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="mt-3 font-semibold text-base">{u.name}</div>
              <Badge variant="secondary" className="mt-1 rounded-full text-xs">
                {u.badge}
              </Badge>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-2xl font-bold text-gradient">
                <MetricIcon className="h-5 w-5 text-primary" />
                {metric.value}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">
                {activeTab}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard Table List */}
      <Card className="rounded-2xl border-border p-2 shadow-soft">
        {sortedLeaderboard.map((u) => {
          const you = u.name.includes("You");
          const metric = getMetricDisplay(u);
          const MetricIcon = metric.icon;

          return (
            <div
              key={u.name}
              className={`flex items-center gap-4 rounded-xl p-3 transition ${
                you ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50"
              }`}
            >
              <div className="w-8 text-center text-sm font-bold text-muted-foreground shrink-0">
                #{u.rank}
              </div>

              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={u.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {u.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{u.name}</div>
                <div className="text-xs text-muted-foreground">
                  {u.hours}h taught · {u.badge}
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-bold text-foreground shrink-0">
                <MetricIcon className="h-4 w-4 text-primary" />
                {metric.value}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
