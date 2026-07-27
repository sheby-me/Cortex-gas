import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Star,
  Sparkles,
  Clock,
  Coins,
  Globe,
  FileText,
  Video,
  MessageSquare,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { tutors } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/tutors")({
  head: () => ({
    meta: [
      { title: "Find Tutors — Cortex" },
      {
        name: "description",
        content: "AI-matched tutors by subject, timezone, language and rating.",
      },
    ],
  }),
  component: TutorsPage,
});

function TutorsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="font-display text-4xl font-medium tracking-tight">Find tutors</h1>
        <p className="mt-1 text-muted-foreground">
          Verified tutors across every subject and grade — pick how you want to learn.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 rounded-lg border-border p-4 shadow-soft">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Subject, topic, teacher…" className="h-10 rounded-md pl-9" />
          </div>
          {["Any subject", "All timezones", "Any language", "4.5★+"].map((f) => (
            <Button key={f} variant="outline" className="h-10 rounded-md">
              {f}
            </Button>
          ))}
        </div>
      </Card>

      {/* AI Smart matches banner */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-semibold">AI Smart Matches</span>
        <span className="text-muted-foreground">— curated from 4,220 verified tutors</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tutors.map((t) => (
          <Card
            key={t.id}
            className="group flex flex-col rounded-lg border-border p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={t.avatar} />
                </Avatar>
                <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card bg-success text-[10px] font-bold text-white">
                  ✓
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Link to="/profile" className="truncate font-semibold hover:underline">
                    {t.name}
                  </Link>
                  <div className="flex items-center gap-0.5 text-sm">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {t.rating}
                  </div>
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {t.subject} · {t.university}
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {t.tz}
                  <Globe className="ml-2 h-3 w-3" />
                  {t.lang}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {t.sessions} sessions ·{" "}
                  <Link to="/profile" className="underline underline-offset-2">
                    Read reviews
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-md text-[11px]">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="mt-3 rounded-md border border-dashed border-border bg-secondary p-3 text-xs">
              <div className="mb-0.5 flex items-center gap-1 font-semibold">
                <Sparkles className="h-3 w-3" />
                Why matched
              </div>
              <div className="text-muted-foreground">{t.why}</div>
            </div>

            {/* Teaching modes */}
            <div className="mt-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                How they teach
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <ModeChip
                  icon={FileText}
                  label="Materials"
                  hint={`${Math.round(t.credits * 0.3)} cr`}
                />
                <ModeChip
                  icon={MessageSquare}
                  label="Async Q&A"
                  hint={`${Math.round(t.credits * 0.5)} cr`}
                />
                <ModeChip icon={Video} label="Zoom (45m)" hint={`${t.credits} cr`} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm font-semibold">
                <Coins className="h-4 w-4" />
                from {Math.round(t.credits * 0.3)} cr
              </div>
              <Button size="sm" className="rounded-md">
                Book
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ModeChip({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-md border border-border p-2 text-center text-[11px]">
      <Icon className="h-3.5 w-3.5" />
      <div className="font-semibold leading-none">{label}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}
