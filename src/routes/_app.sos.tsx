import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LifeBuoy, Plus, Clock, Coins, MessageCircle, Bookmark, Send, Check } from "lucide-react";
import { sosRequests as initialSosRequests } from "@/lib/mock-data";
import { toast } from "sonner";

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

interface SosItem {
  id: string;
  title: string;
  author: string;
  avatar?: string;
  subject: string;
  urgency: "Critical" | "High" | "Medium" | "Low" | string;
  status: string;
  posted: string;
  duration: string;
  credits: number;
  offers: number;
  bookmarked?: boolean;
  offered?: boolean;
}

const urgencyColor = (u: string) =>
  u === "Critical"
    ? "bg-destructive/10 text-destructive border-destructive/20"
    : u === "High"
      ? "bg-warning/10 text-warning border-warning/30"
      : u === "Medium"
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-muted text-muted-foreground border-border";

export function SosPage() {
  const [requests, setRequests] = useState<SosItem[]>(
    initialSosRequests.map((s) => ({
      ...s,
      bookmarked: false,
      offered: false,
    })),
  );

  // New Request Modal State
  const [isNewSosModalOpen, setIsNewSosModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Computer Science");
  const [newUrgency, setNewUrgency] = useState<"Critical" | "High" | "Medium">("High");
  const [newDuration, setNewDuration] = useState("15 min");
  const [newCredits, setNewCredits] = useState(100);

  // Offer Help Modal State
  const [selectedSosForOffer, setSelectedSosForOffer] = useState<SosItem | null>(null);
  const [offerNote, setOfferNote] = useState("");

  const handleCreateSos = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a question or problem title.");
      return;
    }

    const newSos: SosItem = {
      id: "sos_user_" + Date.now(),
      title: newTitle.trim(),
      author: "You",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      subject: newSubject,
      urgency: newUrgency,
      status: "Open",
      posted: "Just now",
      duration: newDuration,
      credits: newCredits,
      offers: 0,
      bookmarked: false,
      offered: false,
    };

    setRequests((prev) => [newSos, ...prev]);
    setIsNewSosModalOpen(false);
    toast.success("Urgent SOS request posted! Helpers are notified.");

    // Reset form
    setNewTitle("");
    setNewCredits(100);
  };

  const handleOfferHelp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSosForOffer) return;

    if (!offerNote.trim()) {
      toast.error("Please include a short note on how you can help.");
      return;
    }

    setRequests((prev) =>
      prev.map((s) => {
        if (s.id === selectedSosForOffer.id) {
          return {
            ...s,
            offers: s.offers + 1,
            offered: true,
          };
        }
        return s;
      }),
    );

    toast.success(`Help offer sent for "${selectedSosForOffer.title}"!`);
    setSelectedSosForOffer(null);
    setOfferNote("");
  };

  const toggleBookmark = (id: string) => {
    setRequests((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextBm = !s.bookmarked;
          toast.info(nextBm ? "Saved to bookmarked requests." : "Removed from bookmarks.");
          return { ...s, bookmarked: nextBm };
        }
        return s;
      }),
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight flex items-center gap-3 font-medium">
            <LifeBuoy className="h-8 w-8 text-primary" />
            SOS Urgent Help
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Post urgent academic requests. Get matched with expert helpers in minutes.
          </p>
        </div>
        <Button
          onClick={() => setIsNewSosModalOpen(true)}
          className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create SOS Request
        </Button>
      </div>

      <div className="mb-6 grid gap-3 grid-cols-2 md:grid-cols-4">
        {[
          { label: "Active Requests", value: requests.length.toString() },
          { label: "Avg. Response Time", value: "4 min" },
          { label: "Resolution Rate", value: "96%" },
          { label: "Daily Reward Pool", value: "12.4k cr" },
        ].map((s) => (
          <Card key={s.label} className="rounded-2xl border-border p-4 shadow-soft">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-xl md:text-2xl font-bold">{s.value}</div>
          </Card>
        ))}
      </div>

      {/* SOS List */}
      <div className="space-y-3">
        {requests.map((s) => (
          <Card
            key={s.id}
            className="rounded-2xl border-border p-5 shadow-soft transition hover:shadow-elegant"
          >
            <div className="flex flex-wrap items-start gap-4">
              <Avatar className="h-11 w-11">
                <AvatarImage src={s.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {s.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
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

                <h3 className="mt-2 text-base md:text-lg font-semibold tracking-tight">
                  {s.title}
                </h3>
                <div className="mt-1 text-xs text-muted-foreground">by {s.author}</div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {s.duration}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-primary">
                    <Coins className="h-3.5 w-3.5 text-amber-500" />
                    {s.credits} cr offered
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {s.offers} offers
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={s.bookmarked ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => toggleBookmark(s.id)}
                  className="rounded-xl"
                >
                  <Bookmark
                    className={`h-4 w-4 ${s.bookmarked ? "fill-primary text-primary" : ""}`}
                  />
                </Button>

                <Button
                  onClick={() => setSelectedSosForOffer(s)}
                  disabled={s.offered}
                  className={`rounded-xl transition ${
                    s.offered
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : "bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
                  }`}
                >
                  {s.offered ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> Help Offered
                    </>
                  ) : (
                    "Offer Help"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New SOS Modal */}
      <Dialog open={isNewSosModalOpen} onOpenChange={setIsNewSosModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Post Urgent SOS Request</DialogTitle>
            <DialogDescription>
              Describe your immediate problem. Available tutors or peers will offer help within
              minutes.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSos} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Question / Problem Summary *
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Need help debugging recursion stack overflow before 11 PM"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Subject
                </label>
                <Select value={newSubject} onValueChange={setNewSubject}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Urgency Level
                </label>
                <Select
                  value={newUrgency}
                  onValueChange={(val) => setNewUrgency(val as "Critical" | "High" | "Medium")}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical (&lt; 1 hr)</SelectItem>
                    <SelectItem value="High">High (&lt; 3 hrs)</SelectItem>
                    <SelectItem value="Medium">Medium (Today)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Estimated Duration
                </label>
                <Input
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  placeholder="e.g. 15 min"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Credits Offered
                </label>
                <Input
                  type="number"
                  value={newCredits}
                  onChange={(e) => setNewCredits(Number(e.target.value))}
                  placeholder="100"
                  className="rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewSosModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
              >
                Post Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Offer Help Modal */}
      <Dialog
        open={!!selectedSosForOffer}
        onOpenChange={(open) => !open && setSelectedSosForOffer(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Offer Help for SOS Request</DialogTitle>
            <DialogDescription>
              "{selectedSosForOffer?.title}" — Reward: {selectedSosForOffer?.credits} credits
            </DialogDescription>
          </DialogHeader>

          {selectedSosForOffer && (
            <form onSubmit={handleOfferHelp} className="space-y-4 py-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  How can you assist? *
                </label>
                <Textarea
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  placeholder="e.g. I am online now and specialize in this exact topic. Let's do a quick 10-minute code walkthrough!"
                  rows={4}
                  required
                  className="rounded-xl"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSosForOffer(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
                >
                  <Send className="mr-1.5 h-4 w-4" /> Send Offer
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
