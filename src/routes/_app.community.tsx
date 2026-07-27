import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Bookmark, Share2, TrendingUp } from "lucide-react";
import { posts } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/community")({
  head: () => ({
    meta: [
      { title: "Community — Cortex" },
      { name: "description", content: "Ask, answer, share notes. Accepted answers earn credits." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl tracking-tight">Community</h1>
        <p className="mt-1 text-muted-foreground">
          Questions, notes and resources from 42,000 learners.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="rounded-2xl border-border p-4 shadow-soft">
            <Input
              placeholder="Share a note, ask a question…"
              className="h-11 rounded-xl border-none bg-muted/50"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                {["Question", "Notes", "Resource", "Poll"].map((t) => (
                  <Button key={t} size="sm" variant="ghost" className="rounded-full">
                    {t}
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90"
              >
                Post
              </Button>
            </div>
          </Card>

          {posts.map((p) => (
            <Card key={p.id} className="rounded-2xl border-border p-5 shadow-soft">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={p.avatar} />
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{p.author}</span>
                    <span className="text-muted-foreground">· {p.time}</span>
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      {p.subject}
                    </Badge>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {p.tag}
                    </Badge>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Heart className="mr-1 h-4 w-4" />
                      {p.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <MessageCircle className="mr-1 h-4 w-4" />
                      {p.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Bookmark className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-full">
                      <Share2 className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Trending topics</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "#dynamic-programming",
                "#transformers",
                "#os-deadlocks",
                "#react-19",
                "#sql-indexing",
                "#ielts-writing",
                "#linear-algebra",
              ].map((t) => (
                <Badge key={t} variant="secondary" className="rounded-full">
                  {t}
                </Badge>
              ))}
            </div>
          </Card>
          <Card className="rounded-2xl border-border p-5 shadow-soft">
            <h3 className="mb-3 font-semibold">Filter by subject</h3>
            <div className="space-y-1.5 text-sm">
              {["Algorithms", "Machine Learning", "Databases", "OS", "Frontend", "Math"].map(
                (s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/60"
                  >
                    <span>{s}</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.floor(Math.random() * 400) + 20}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
