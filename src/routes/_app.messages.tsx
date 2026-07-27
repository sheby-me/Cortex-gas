import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile, Search } from "lucide-react";
import { messages } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Cortex" },
      { name: "description", content: "Private chats, tutors, buddies and groups." },
    ],
  }),
  component: MsgPage,
});

function MsgPage() {
  const active = messages[0];
  return (
    <div className="grid h-[calc(100vh-4rem)] lg:grid-cols-[340px_1fr]">
      <aside className="flex flex-col border-r border-border">
        <div className="border-b border-border p-4">
          <h2 className="mb-3 font-display text-2xl tracking-tight">Messages</h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-9 rounded-xl pl-9" placeholder="Search chats…" />
          </div>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {messages.map((m, i) => (
            <button
              key={m.id}
              className={`w-full rounded-xl p-3 text-left ${i === 0 ? "bg-accent" : ""} hover:bg-muted/60`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={m.avatar} />
                  </Avatar>
                  {m.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-success" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="truncate text-sm font-semibold">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground">{m.time}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="truncate text-xs text-muted-foreground">{m.last}</div>
                    {m.unread > 0 && (
                      <Badge className="rounded-full bg-gradient-primary text-white border-0 h-4 min-w-[16px] px-1 text-[10px]">
                        {m.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>
      <section className="hidden flex-col lg:flex">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={active.avatar} />
          </Avatar>
          <div>
            <div className="text-sm font-semibold">{active.name}</div>
            <div className="text-xs text-success">Online · typing…</div>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-auto bg-muted/20 p-6">
          {[
            { me: false, t: "Hey! Ready for the DP session?" },
            { me: true, t: "Yes, just finishing my coffee ☕" },
            { me: false, t: "Sending the DP cheatsheet now!" },
            { me: true, t: "Amazing, I'll open the whiteboard." },
          ].map((b, i) => (
            <div key={i} className={`flex ${b.me ? "justify-end" : ""}`}>
              <Card
                className={`max-w-md rounded-2xl border-none p-3 text-sm shadow-soft ${b.me ? "bg-gradient-primary text-white" : "bg-background"}`}
              >
                {b.t}
              </Card>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-soft">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input className="border-none focus-visible:ring-0" placeholder="Type a message…" />
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Smile className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="rounded-xl bg-gradient-primary text-white shadow-elegant hover:opacity-90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
