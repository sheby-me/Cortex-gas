import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, Coins, Clock, GraduationCap } from "lucide-react";
import { creditsHistory, achievements } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Cortex" },
      { name: "description", content: "Your credentials, history, credits and reviews." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile, role } = useAuth();
  const displayName =
    profile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Your profile";
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <div className="p-6 md:p-8">
      <Card className="mb-6 overflow-hidden rounded-lg border-border p-0 shadow-soft">
        <div className="h-32 bg-secondary" />
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-end">
          <Avatar className="h-24 w-24 -mt-16 border-4 border-card shadow-soft">
            <AvatarImage src={profile?.avatarUrl || user?.photoURL || undefined} />
            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-lg font-semibold">
              {initials}
            </div>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-4xl font-medium tracking-tight">{displayName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="rounded-md capitalize">
                {role ?? "member"}
              </Badge>
              <span>·</span>
              <span>Public profile — visible to everyone on Cortex.</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-md">
              Share
            </Button>
            <Button className="rounded-md">Edit profile</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border p-6 md:grid-cols-4">
          {[
            { icon: Coins, l: "Credits", v: "100" },
            { icon: Clock, l: "Hours taught", v: "—" },
            { icon: Star, l: "Rating", v: "—" },
            { icon: GraduationCap, l: "Sessions", v: "—" },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-3 rounded-md bg-secondary p-3">
              <div className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-lg font-bold">{s.v}</div>
                <div className="text-xs text-muted-foreground">{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="rounded-md">
          <TabsTrigger value="overview" className="rounded-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="credits" className="rounded-sm">
            Credits
          </TabsTrigger>
          <TabsTrigger value="teaching" className="rounded-sm">
            Teaching
          </TabsTrigger>
          <TabsTrigger value="badges" className="rounded-sm">
            Badges
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-sm">
            Public reviews
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 grid gap-4 md:grid-cols-2">
          <Card className="rounded-lg border-border p-5 shadow-soft">
            <h3 className="mb-3 font-semibold">Subjects I can teach</h3>
            <p className="text-sm text-muted-foreground">
              Add subjects from Settings — anything from algebra to guitar.
            </p>
          </Card>
          <Card className="rounded-lg border-border p-5 shadow-soft">
            <h3 className="mb-3 font-semibold">Topics I want to learn</h3>
            <p className="text-sm text-muted-foreground">
              List what you're working on so peers can find you.
            </p>
          </Card>
        </TabsContent>
        <TabsContent value="credits" className="mt-4">
          <Card className="rounded-lg border-border p-2 shadow-soft">
            {creditsHistory.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-md p-3 hover:bg-secondary"
              >
                <div>
                  <div className="text-sm font-medium">{c.reason}</div>
                  <div className="text-xs text-muted-foreground">{c.time}</div>
                </div>
                <div
                  className={`text-sm font-bold ${c.type === "earn" ? "text-success" : "text-destructive"}`}
                >
                  {c.type === "earn" ? "+" : ""}
                  {c.amount}
                </div>
              </div>
            ))}
          </Card>
        </TabsContent>
        <TabsContent value="teaching" className="mt-4">
          <Card className="rounded-lg border-border p-8 text-center text-muted-foreground shadow-soft">
            Teaching history will appear here.
          </Card>
        </TabsContent>
        <TabsContent value="badges" className="mt-4 grid gap-3 sm:grid-cols-3">
          {achievements
            .filter((a) => a.earned)
            .map((a) => (
              <Card key={a.id} className="rounded-lg border-border p-4 text-center shadow-soft">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-md bg-primary text-primary-foreground">
                  ✦
                </div>
                <div className="mt-2 text-sm font-semibold">{a.name}</div>
              </Card>
            ))}
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <PublicReviews />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PublicReviews() {
  const reviews = [
    {
      id: "r1",
      name: "Learner",
      role: "student",
      rating: 5,
      text: "Cleared up transformers in one session. Kept the pace right and shared great notes.",
      time: "3d",
    },
    {
      id: "r2",
      name: "Learner",
      role: "student",
      rating: 5,
      text: "Patient with the basics. Zoom session was well-prepared with slides and exercises.",
      time: "1w",
    },
    {
      id: "r3",
      name: "Peer",
      role: "tutor",
      rating: 4,
      text: "Asked thoughtful questions in async Q&A — enjoyable to teach.",
      time: "2w",
    },
  ];
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <div className="space-y-4">
      <Card className="rounded-lg border-border p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="font-display text-3xl font-medium">{avg.toFixed(1)}</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-4 w-4 ${n <= Math.round(avg) ? "fill-warning text-warning" : "text-muted-foreground/40"}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {reviews.length} public reviews · visible to every learner and tutor on Cortex
            </div>
          </div>
          <Button variant="outline" className="rounded-md">
            Leave a review
          </Button>
        </div>
      </Card>
      {reviews.map((r) => (
        <Card key={r.id} className="rounded-lg border-border p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-secondary text-xs font-semibold">
                {r.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-semibold">{r.name}</div>
                <div className="text-[11px] text-muted-foreground capitalize">
                  {r.role} · {r.time} ago
                </div>
              </div>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-warning text-warning" : "text-muted-foreground/40"}`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{r.text}</p>
        </Card>
      ))}
    </div>
  );
}
