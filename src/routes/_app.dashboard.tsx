import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Coins,
  Flame,
  Trophy,
  Target,
  Sparkles,
  FileText,
  ListChecks,
  Users,
  LifeBuoy,
  BookOpen,
  ArrowRight,
  Star,
  Calendar,
  MessagesSquare,
} from "lucide-react";
import { currentUser, tutors, buddies, upcomingExams } from "@/lib/mock-data";
import {
  getNotifications,
  NOTIFICATION_EVENT,
  type CortexNotification,
} from "@/lib/notifications-store";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Cortex" },
      { name: "description", content: "Your credits, streak, sessions and AI recommendations." },
    ],
  }),
  component: Dashboard,
});

function Stat({
  icon: Icon,
  label,
  value,
  sub,
  tint = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tint?: string;
}) {
  return (
    <Card className="rounded-2xl border-border p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl ${tint === "primary" ? "bg-gradient-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
      <div className="mt-4 text-3xl font-bold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </Card>
  );
}

function Dashboard() {
  const goalPct = Math.round((currentUser.todayMin / currentUser.dailyGoalMin) * 100);
  const [notifList, setNotifList] = useState<CortexNotification[]>([]);

  useEffect(() => {
    const update = () => {
      setNotifList(getNotifications());
    };
    update();

    if (typeof window !== "undefined") {
      window.addEventListener(NOTIFICATION_EVENT, update);
      return () => window.removeEventListener(NOTIFICATION_EVENT, update);
    }
  }, []);

  return (
    <div className="p-6 md:p-8">
      {/* Greeting */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1 className="font-display text-4xl font-medium tracking-tight md:text-5xl">
            Welcome back.
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your credits, sessions and progress — in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link to="/sos">
              <LifeBuoy className="mr-1.5 h-4 w-4" />
              Create SOS
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
          >
            <Link to="/ai">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Ask AI
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          icon={Coins}
          label="Credits"
          value={currentUser.credits.toLocaleString()}
          sub="+45 today"
        />
        <Stat
          icon={Flame}
          label="Streak"
          value={`${currentUser.streak}d`}
          sub="Personal best"
          tint="accent"
        />
        <Stat icon={Trophy} label="Leaderboard" value="#12" sub="Top 2%" tint="accent" />
        <Stat
          icon={Target}
          label="Daily Goal"
          value={`${currentUser.todayMin}/${currentUser.dailyGoalMin}m`}
          sub={`${goalPct}%`}
          tint="accent"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left col */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today progress */}
          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Weekly progress</h2>
                <p className="text-sm text-muted-foreground">
                  {currentUser.weeklyHours}h of your 20h goal
                </p>
              </div>
              <Badge variant="secondary" className="rounded-full">
                On track
              </Badge>
            </div>
            <div className="flex items-end gap-2">
              {[3, 4, 2, 6, 5, 8, 4].map((h, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="rounded-lg bg-gradient-primary"
                    style={{ height: `${h * 14}px` }}
                  />
                  <div className="mt-2 text-center text-[10px] text-muted-foreground">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Quick actions
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { icon: FileText, label: "Generate notes", to: "/ai" },
                { icon: ListChecks, label: "Generate quiz", to: "/quizzes" },
                { icon: Users, label: "Find tutor", to: "/tutors" },
                { icon: LifeBuoy, label: "Create SOS", to: "/sos" },
                { icon: BookOpen, label: "Join a group", to: "/groups" },
                { icon: MessagesSquare, label: "Ask community", to: "/community" },
              ].map((a) => (
                <Link
                  key={a.label}
                  to={a.to}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-sm font-semibold">{a.label}</div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended tutors */}
          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Recommended tutors</h2>
                <p className="text-sm text-muted-foreground">
                  Matched by your goals · timezone · past ratings
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-xl">
                <Link to="/tutors">
                  See all
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {tutors.slice(0, 4).map((t) => (
                <div key={t.id} className="flex gap-3 rounded-xl border border-border p-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={t.avatar} />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold">{t.name}</div>
                      <div className="flex items-center gap-0.5 text-xs">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        {t.rating}
                      </div>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {t.subject} · {t.university}
                    </div>
                    <div className="mt-1 text-[11px] italic text-muted-foreground line-clamp-1">
                      ✦ {t.why}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right col */}
        <div className="space-y-6">
          {/* Exams */}
          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Upcoming exams</h2>
            </div>
            <div className="space-y-4">
              {upcomingExams.map((e) => (
                <div key={e.subject}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <div className="font-semibold">{e.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {e.date} · {e.daysLeft}d
                    </div>
                  </div>
                  <Progress value={e.readiness} className="h-1.5" />
                  <div className="mt-1 text-xs text-muted-foreground">{e.readiness}% ready</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Buddies */}
          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Study buddies</h2>
              <Button asChild variant="ghost" size="sm" className="rounded-xl">
                <Link to="/buddy">Explore</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {buddies.slice(0, 3).map((b) => (
                <div key={b.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={b.avatar} />
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{b.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{b.topic}</div>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {b.match}%
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Activity */}
          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Recent activity</h2>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-primary hover:bg-primary/10"
              >
                <Link to="/notifications">View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {notifList.slice(0, 4).map((n) => (
                <div key={n.id} className="flex items-start gap-3 text-sm">
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.read ? "bg-primary" : "bg-muted-foreground/40"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 text-xs font-medium">{n.text}</div>
                    <div className="text-[10px] text-muted-foreground">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
