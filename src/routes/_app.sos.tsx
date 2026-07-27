import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { LifeBuoy, Plus, Clock, Coins, MessageCircle, Bookmark } from "lucide-react";
import { sosRequests } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/sos")({
  head: () => ({
    meta: [
      { title: "SOS Help — Cortex" },
      {
        name: "description",
        content: "Urgent academic help from verified peers, matched in minutes.",
      },
    ],
  }),
  component: SosPage,
});

const urgencyColor = (u: string) =>
  u === "Critical"
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : u === "High"
      ? "bg-warning/10 text-warning border-warning/30"
      : u === "Medium"
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-muted text-muted-foreground border-border";

function SosPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl tracking-tight flex items-center gap-3">
            <LifeBuoy className="h-8 w-8 text-primary" />
            SOS help
          </h1>
          <p className="mt-1 text-muted-foreground">
            Post urgent requests. Get matched in minutes.
          </p>
        </div>
        <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
          <Plus className="mr-1.5 h-4 w-4" />
          Create SOS request
        </Button>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        {[
          { label: "Open now", value: "38" },
          { label: "Avg. response", value: "4 min" },
          { label: "Success rate", value: "96%" },
          { label: "Credits pool today", value: "12.4k" },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border-border p-4 shadow-soft">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-2xl font-bold">{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {sosRequests.map((s) => (
          <Card
            key={s.id}
            className="rounded-2xl border-border p-5 shadow-soft transition hover:shadow-elegant"
          >
            <div className="flex flex-wrap items-start gap-4">
              <Avatar className="h-11 w-11">
                <AvatarImage src={s.avatar} />
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className={`rounded-full ${urgencyColor(s.urgency)}`}>
                    {s.urgency}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {s.subject}
                  </Badge>
                  <Badge variant="outline" className="rounded-full">
                    {s.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">· {s.posted}</span>
                </div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{s.title}</h3>
                <div className="mt-1 text-sm text-muted-foreground">by {s.author}</div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {s.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-primary" />
                    {s.credits} offered
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {s.offers} offers
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90">
                  Offer help
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
