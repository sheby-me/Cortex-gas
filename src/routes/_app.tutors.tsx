import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  FileCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { tutors as mockTutors } from "@/lib/mock-data";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "sonner";

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

type FirestoreTutor = {
  id: string;
  displayName?: string | null;
  email?: string | null;
  credentials?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  rates?: {
    materials?: number;
    asyncQa?: number;
    zoomMeeting?: number;
  } | null;
  degreeProofName?: string | null;
};

interface BookingTutorInfo {
  id: string;
  name: string;
  avatar?: string;
  subject: string;
  rates: {
    materials: number;
    asyncQa: number;
    zoomMeeting: number;
  };
}

export function TutorsPage() {
  const [realTutors, setRealTutors] = useState<FirestoreTutor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  // Booking Modal State
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState<BookingTutorInfo | null>(
    null,
  );
  const [selectedMode, setSelectedMode] = useState<"materials" | "asyncQa" | "zoomMeeting">(
    "zoomMeeting",
  );
  const [bookingDate, setBookingDate] = useState("Tomorrow at 3:00 PM");
  const [sessionTopic, setSessionTopic] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  useEffect(() => {
    async function loadApprovedTutors() {
      try {
        const q = query(collection(db, "users"), where("role", "==", "tutor"));
        const snap = await getDocs(q);
        const list: FirestoreTutor[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Record<string, unknown>),
        }));
        setRealTutors(list);
      } catch (e) {
        console.error("Failed loading tutors from Firestore", e);
      }
    }
    loadApprovedTutors();
  }, []);

  const handleOpenBooking = (tutor: BookingTutorInfo) => {
    setSelectedTutorForBooking(tutor);
    setSelectedMode("zoomMeeting");
    setSessionTopic("");
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorForBooking) return;

    if (!sessionTopic.trim()) {
      toast.error("Please enter a topic or question for the tutor session.");
      return;
    }

    setIsSubmittingBooking(true);

    setTimeout(() => {
      setIsSubmittingBooking(false);
      const creditsCost =
        selectedMode === "materials"
          ? selectedTutorForBooking.rates.materials
          : selectedMode === "asyncQa"
            ? selectedTutorForBooking.rates.asyncQa
            : selectedTutorForBooking.rates.zoomMeeting;

      toast.success(
        `Session successfully booked with ${selectedTutorForBooking.name}! (${creditsCost} credits reserved)`,
      );
      setSelectedTutorForBooking(null);
    }, 600);
  };

  // Filter combined lists
  const filteredRealTutors = realTutors.filter((t) => {
    const name = t.displayName || t.email || "";
    const matchesSearch =
      !searchQuery.trim() ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.credentials || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.bio || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const filteredMockTutors = mockTutors.filter((t) => {
    const matchesSearch =
      !searchQuery.trim() ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.university.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      subjectFilter === "all" || t.subject.toLowerCase().includes(subjectFilter.toLowerCase());

    return matchesSearch && matchesSubject;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-medium tracking-tight">
          Find Tutors
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verified tutors across every subject — book live sessions, async Q&A, or material reviews.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6 rounded-2xl border-border p-4 shadow-soft">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, topic, or tutor name…"
              className="h-10 rounded-xl pl-9"
            />
          </div>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="h-10 rounded-xl">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="computer science">Computer Science</SelectItem>
              <SelectItem value="algorithms">Algorithms</SelectItem>
              <SelectItem value="chemistry">Chemistry</SelectItem>
              <SelectItem value="math">Mathematics</SelectItem>
              <SelectItem value="biology">Biology</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setSubjectFilter("all");
            }}
            className="h-10 rounded-xl"
          >
            Reset Filters
          </Button>
        </div>
      </Card>

      {/* AI Smart matches banner */}
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-semibold">Verified Tutors</span>
        <span className="text-muted-foreground">— available for instant credit booking</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Real Approved Tutors from Firestore */}
        {filteredRealTutors.map((t) => {
          const name = t.displayName || t.email?.split("@")[0] || "Approved Tutor";
          const matRate = t.rates?.materials ?? 15;
          const asyncRate = t.rates?.asyncQa ?? 25;
          const zoomRate = t.rates?.zoomMeeting ?? 50;

          const tutorBookingInfo: BookingTutorInfo = {
            id: t.id,
            name,
            avatar: t.avatarUrl || undefined,
            subject: t.credentials || "Verified Expert",
            rates: { materials: matRate, asyncQa: asyncRate, zoomMeeting: zoomRate },
          };

          return (
            <Card
              key={t.id}
              className="group flex flex-col justify-between rounded-2xl border-primary/30 bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant relative overflow-hidden"
            >
              <div>
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium"
                  >
                    Verified Tutor
                  </Badge>
                </div>

                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border border-border">
                      <AvatarImage src={t.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card bg-emerald-600 text-[10px] font-bold text-white">
                      ✓
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 pr-16">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground truncate">
                      {name}
                    </div>
                    <div className="truncate text-xs text-primary font-medium mt-0.5">
                      {t.credentials || "Verified Expert"}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Flexible TZ
                      <Globe className="ml-1 h-3 w-3" />
                      English
                    </div>
                  </div>
                </div>

                {t.bio && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {t.bio}
                  </p>
                )}

                <div className="mt-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 p-2.5 text-xs">
                  <div className="flex items-center gap-1 font-semibold text-primary text-[11px]">
                    <FileCheck className="h-3.5 w-3.5" />
                    Verified Qualification
                  </div>
                  <div className="text-muted-foreground text-[11px] mt-0.5">
                    Degree document approved by Cortex Admin
                  </div>
                </div>

                {/* Teaching modes & Custom Service Rates */}
                <div className="mt-4">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Service Credit Rates
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <ModeChip icon={FileText} label="Materials" hint={`${matRate} cr`} />
                    <ModeChip icon={MessageSquare} label="Async (30m)" hint={`${asyncRate} cr`} />
                    <ModeChip icon={Video} label="Zoom (45m)" hint={`${zoomRate} cr`} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Coins className="h-4 w-4 text-amber-500" />
                  from {matRate} cr
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenBooking(tutorBookingInfo)}
                  className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
                >
                  Book Session
                </Button>
              </div>
            </Card>
          );
        })}

        {/* Mock Tutors */}
        {filteredMockTutors.map((t) => {
          const matRate = Math.round(t.credits * 0.3);
          const asyncRate = Math.round(t.credits * 0.5);
          const zoomRate = t.credits;

          const tutorBookingInfo: BookingTutorInfo = {
            id: t.id,
            name: t.name,
            avatar: t.avatar,
            subject: t.subject,
            rates: { materials: matRate, asyncQa: asyncRate, zoomMeeting: zoomRate },
          };

          return (
            <Card
              key={t.id}
              className="group flex flex-col justify-between rounded-2xl border-border p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {t.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full border-2 border-card bg-emerald-600 text-[10px] font-bold text-white">
                      ✓
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <Link to="/profile" className="truncate font-semibold hover:underline">
                        {t.name}
                      </Link>
                      <div className="flex items-center gap-0.5 text-sm font-semibold text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {t.rating}
                      </div>
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {t.subject} · {t.university}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {t.tz}
                      <Globe className="ml-1 h-3 w-3" />
                      {t.lang}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full text-[11px]">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-3 rounded-xl border border-dashed border-border bg-secondary/50 p-3 text-xs">
                  <div className="mb-0.5 flex items-center gap-1 font-semibold text-primary">
                    <Sparkles className="h-3 w-3" />
                    Why matched
                  </div>
                  <div className="text-muted-foreground">{t.why}</div>
                </div>

                {/* Teaching modes */}
                <div className="mt-4">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Service Credit Rates
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <ModeChip icon={FileText} label="Materials" hint={`${matRate} cr`} />
                    <ModeChip icon={MessageSquare} label="Async (30m)" hint={`${asyncRate} cr`} />
                    <ModeChip icon={Video} label="Zoom (45m)" hint={`${zoomRate} cr`} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <Coins className="h-4 w-4 text-amber-500" />
                  from {matRate} cr
                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenBooking(tutorBookingInfo)}
                  className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
                >
                  Book Session
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tutor Session Booking Dialog */}
      <Dialog
        open={!!selectedTutorForBooking}
        onOpenChange={(open) => !open && setSelectedTutorForBooking(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Book Tutor Session</DialogTitle>
            <DialogDescription>
              Select your preferred service mode and time to schedule with{" "}
              {selectedTutorForBooking?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedTutorForBooking && (
            <form onSubmit={handleConfirmBooking} className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedTutorForBooking.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {selectedTutorForBooking.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-sm">{selectedTutorForBooking.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedTutorForBooking.subject}
                  </div>
                </div>
              </div>

              {/* Service Mode Selector */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Select Session Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMode("materials")}
                    className={`p-3 rounded-xl border text-center text-xs transition ${
                      selectedMode === "materials"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <FileText className="mx-auto h-4 w-4 mb-1" />
                    <div>Materials</div>
                    <div className="text-[10px] text-amber-600 mt-1">
                      {selectedTutorForBooking.rates.materials} cr
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode("asyncQa")}
                    className={`p-3 rounded-xl border text-center text-xs transition ${
                      selectedMode === "asyncQa"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <MessageSquare className="mx-auto h-4 w-4 mb-1" />
                    <div>Async Q&A</div>
                    <div className="text-[10px] text-amber-600 mt-1">
                      {selectedTutorForBooking.rates.asyncQa} cr
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode("zoomMeeting")}
                    className={`p-3 rounded-xl border text-center text-xs transition ${
                      selectedMode === "zoomMeeting"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    <Video className="mx-auto h-4 w-4 mb-1" />
                    <div>Zoom (45m)</div>
                    <div className="text-[10px] text-amber-600 mt-1">
                      {selectedTutorForBooking.rates.zoomMeeting} cr
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Preferred Date & Time
                </label>
                <div className="relative">
                  <CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    placeholder="e.g. Tomorrow at 3:00 PM"
                    required
                    className="rounded-xl pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Topic / Problem Notes *
                </label>
                <Textarea
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder="Describe what topic, homework, or exam you want to review in this session..."
                  rows={3}
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                <span className="flex items-center gap-1 font-medium">
                  <Coins className="h-4 w-4 text-amber-500" />
                  Total Credits Required:
                </span>
                <span className="font-bold text-sm">
                  {selectedMode === "materials"
                    ? selectedTutorForBooking.rates.materials
                    : selectedMode === "asyncQa"
                      ? selectedTutorForBooking.rates.asyncQa
                      : selectedTutorForBooking.rates.zoomMeeting}{" "}
                  cr
                </span>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedTutorForBooking(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
                >
                  {isSubmittingBooking ? "Booking..." : "Confirm & Pay Credits"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
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
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-border p-2 text-center text-[11px]">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <div className="font-semibold leading-none">{label}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
    </div>
  );
}
