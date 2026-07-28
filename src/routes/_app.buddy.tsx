import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import {
  Users,
  Sparkles,
  Plus,
  Calendar,
  Clock,
  MessageSquare,
  Check,
  Search,
  Send,
  Building2,
  GraduationCap,
  BookOpen,
  UserPlus,
  AtSign,
} from "lucide-react";
import { buddies as initialBuddies } from "@/lib/mock-data";
import { useAuth, type GradeLevel } from "@/hooks/use-auth";
import { toast } from "sonner";
import { sendBuddyRequest } from "@/lib/notifications-store";
import { SendBuddyModal } from "@/components/send-buddy-modal";

export const Route = createFileRoute("/_app/buddy")({
  head: () => ({
    meta: [
      { title: "Study Buddy & Batchmates — Cortex" },
      {
        name: "description",
        content:
          "Find university batchmates and peers preparing for the same topics or grade level.",
      },
    ],
  }),
  component: BuddyPage,
});

interface BuddyItem {
  id: string;
  name: string;
  username?: string;
  avatar: string;
  uni: string;
  semesterOrYear?: string;
  degreeOrStream?: string;
  tz: string;
  topic: string;
  exam: string;
  match: number;
  gradeLevel?: GradeLevel | string;
  isBatchmate?: boolean;
  requested?: boolean;
}

export function BuddyPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [buddyList, setBuddyList] = useState<BuddyItem[]>(() => {
    const userUni = (profile.institution || "Stanford University").toLowerCase();
    return [
      {
        id: "b_1",
        name: "Elena Rostova",
        username: "elena_rostova",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        uni: profile.institution || "Stanford University",
        semesterOrYear: profile.semesterOrYear || "Semester 4",
        degreeOrStream: profile.degreeOrStream || "BS Computer Science",
        tz: "UTC-5 (EST)",
        topic: "Operating Systems & Concurrency",
        exam: "Nov 18 Midterm",
        match: 98,
        gradeLevel: (profile.gradeLevel as GradeLevel) || "Undergraduate",
        isBatchmate: true,
        requested: false,
      },
      {
        id: "b_2",
        name: "Rahul Verma",
        username: "rahul_verma",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        uni: profile.institution || "Stanford University",
        semesterOrYear: "Semester 4",
        degreeOrStream: "BS Computer Science & AI",
        tz: "UTC-5 (EST)",
        topic: "Linear Algebra & Neural Nets",
        exam: "Dec 02 Final",
        match: 95,
        gradeLevel: "Undergraduate",
        isBatchmate: true,
        requested: false,
      },
      ...initialBuddies.map((b, idx) => {
        const uHandles = ["marcus_a", "priya_sharma", "sophia_chen", "david_kim", "aisha_khan"];
        return {
          ...b,
          username: uHandles[idx % uHandles.length],
          semesterOrYear: idx % 2 === 0 ? "Semester 4" : "Class 10 / Matric",
          degreeOrStream: idx % 2 === 0 ? "BS Data Science" : "Science Stream",
          gradeLevel: idx % 2 === 0 ? "Undergraduate" : "Matric",
          isBatchmate:
            b.uni.toLowerCase().includes(userUni) || userUni.includes(b.uni.toLowerCase()),
          requested: false,
        };
      }),
    ];
  });

  // Filter States
  const [searchTopic, setSearchTopic] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [uniFilter, setUniFilter] = useState("all");
  const [tzFilter, setTzFilter] = useState("all");

  // Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<BuddyItem | null>(null);
  const [newTopic, setNewTopic] = useState("");
  const [newUni, setNewUni] = useState(profile.institution || "Stanford University");
  const [newSemester, setNewSemester] = useState(profile.semesterOrYear || "Semester 4");
  const [newDegree, setNewDegree] = useState(profile.degreeOrStream || "BS Computer Science");
  const [newGrade, setNewGrade] = useState<GradeLevel>(
    (profile.gradeLevel as GradeLevel) || "Undergraduate",
  );
  const [newExamDate, setNewExamDate] = useState("");
  const [newTz, setNewTz] = useState(profile.timezone || "UTC-5 (EST)");
  const [newPace, setNewPace] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Quick Message Dialog
  const [selectedBuddyForMsg, setSelectedBuddyForMsg] = useState<BuddyItem | null>(null);
  const [msgText, setMsgText] = useState("");

  const handleCreateBuddyRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) {
      toast.error("Please specify a study topic.");
      return;
    }

    const newBuddy: BuddyItem = {
      id: "b_user_" + Date.now(),
      name: `${profile.displayName || "You"} (Open Request)`,
      avatar:
        profile.avatarUrl ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      uni: newUni.trim() || profile.institution || "Your University",
      semesterOrYear: newSemester,
      degreeOrStream: newDegree,
      tz: newTz,
      topic: newTopic.trim(),
      exam: newExamDate.trim() || "Flexible",
      match: 100,
      gradeLevel: newGrade,
      isBatchmate: true,
      requested: false,
    };

    setBuddyList((prev) => [newBuddy, ...prev]);
    setIsRequestModalOpen(false);
    toast.success("Study buddy request posted! Peers will see your request.");

    setNewTopic("");
    setNewExamDate("");
    setNewNotes("");
  };

  const handleToggleTeamUp = (buddy: BuddyItem) => {
    const nextState = !buddy.requested;
    if (nextState) {
      const res = sendBuddyRequest({
        targetUidOrHandle: buddy.username || buddy.id,
        customNote: `Sent buddy request for studying ${buddy.topic}`,
        senderProfile: profile,
      });
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.info(res.message);
      }
    } else {
      toast.info(`Request to ${buddy.name} cancelled.`);
    }

    setBuddyList((prev) =>
      prev.map((b) => (b.id === buddy.id ? { ...b, requested: nextState } : b)),
    );
  };

  const handleSendQuickMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim() || !selectedBuddyForMsg) return;

    toast.success(`Message sent to ${selectedBuddyForMsg.name}!`);
    setSelectedBuddyForMsg(null);
    setMsgText("");
    navigate({ to: "/messages" });
  };

  const filteredBuddies = buddyList.filter((b) => {
    const q = searchTopic.toLowerCase().trim();
    const matchesTopic =
      !q ||
      b.topic.toLowerCase().includes(q) ||
      b.name.toLowerCase().includes(q) ||
      (b.username && b.username.toLowerCase().includes(q.replace(/^@/, ""))) ||
      b.uni.toLowerCase().includes(q);

    const matchesLevel =
      levelFilter === "all" ||
      (b.gradeLevel && b.gradeLevel.toLowerCase() === levelFilter.toLowerCase());

    const matchesUni =
      uniFilter === "all" ||
      (uniFilter === "batchmate" && b.isBatchmate) ||
      (uniFilter === "same_uni" &&
        profile.institution &&
        b.uni.toLowerCase().includes(profile.institution.toLowerCase()));

    const matchesTz = tzFilter === "all" || b.tz.toLowerCase().includes(tzFilter.toLowerCase());

    return matchesTopic && matchesLevel && matchesUni && matchesTz;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
            Study Buddy
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Match with peers by topic, exam date, timezone and pace.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => {
              setSelectedTargetUser(null);
              setIsSendModalOpen(true);
            }}
            variant="outline"
            className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            Send Request by ID / @username
          </Button>
          <Button
            onClick={() => setIsRequestModalOpen(true)}
            className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Post Open Request
          </Button>
        </div>
      </div>

      <Card className="mb-6 rounded-2xl border-border bg-gradient-mesh p-6 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Peer Matcher
        </div>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          We match you with peers studying similar course topics or preparing for exams in your time
          window.
        </p>
      </Card>

      {/* Search & Filter Bar */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <div className="relative md:col-span-1 sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTopic}
            onChange={(e) => setSearchTopic(e.target.value)}
            placeholder="Search topic or university…"
            className="h-10 rounded-xl pl-9"
          />
        </div>

        <Select value={uniFilter} onValueChange={setUniFilter}>
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="All Universities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Peers</SelectItem>
            <SelectItem value="batchmate">My University Batchmates</SelectItem>
            <SelectItem value="same_uni">Same Institution</SelectItem>
          </SelectContent>
        </Select>

        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="Academic Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Academic Levels</SelectItem>
            <SelectItem value="matric">Matric</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="undergraduate">Undergraduate</SelectItem>
            <SelectItem value="graduate">Graduate</SelectItem>
            <SelectItem value="mphil">Mphil</SelectItem>
            <SelectItem value="phd">PhD</SelectItem>
          </SelectContent>
        </Select>

        <Select value={tzFilter} onValueChange={setTzFilter}>
          <SelectTrigger className="h-10 rounded-xl">
            <SelectValue placeholder="All Timezones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Timezones</SelectItem>
            <SelectItem value="pst">UTC+5 (PST, Pakistan Standard Time)</SelectItem>
            <SelectItem value="utc-5">UTC-5 (EST, Eastern Standard Time)</SelectItem>
            <SelectItem value="utc-8">UTC-8 (PST, Pacific Standard Time)</SelectItem>
            <SelectItem value="utc+0">UTC+0 (GMT, Greenwich Mean Time)</SelectItem>
            <SelectItem value="utc+5.5">UTC+5:30 (IST, Indian Standard Time)</SelectItem>
            <SelectItem value="utc+8">UTC+8 (SGT, Singapore Time)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Buddy Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredBuddies.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            No study buddies found matching your criteria. Try adjusting your search filters or post
            a request!
          </div>
        ) : (
          filteredBuddies.map((b) => (
            <Card
              key={b.id}
              className="rounded-2xl border-border p-5 shadow-soft flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={b.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {b.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-semibold flex items-center gap-1.5">
                        <span className="truncate">{b.name}</span>
                        {b.username && (
                          <span className="font-mono text-[11px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-medium shrink-0">
                            @{b.username}
                          </span>
                        )}
                      </div>
                      <Badge className="rounded-full bg-gradient-primary text-primary-foreground border-0 shrink-0 text-[10px]">
                        {b.match}% match
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Building2 className="h-3 w-3 shrink-0 text-primary" />
                      <span className="truncate">{b.uni}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {b.isBatchmate && (
                        <Badge
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] rounded-md"
                        >
                          Batchmate
                        </Badge>
                      )}
                      {b.gradeLevel && (
                        <Badge variant="outline" className="text-[10px] rounded-md">
                          {b.gradeLevel}
                        </Badge>
                      )}
                      {b.degreeOrStream && (
                        <span className="text-[11px] text-muted-foreground truncate">
                          · {b.degreeOrStream}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    Target Topic
                  </div>
                  <div className="mt-0.5 text-sm font-semibold">{b.topic}</div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {b.exam}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      2h/day
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedBuddyForMsg(b)}
                  className="rounded-xl"
                >
                  <MessageSquare className="mr-1.5 h-4 w-4" /> Message
                </Button>
                <Button
                  onClick={() => handleToggleTeamUp(b)}
                  variant={b.requested ? "secondary" : "default"}
                  className={`rounded-xl transition ${
                    b.requested
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : "bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
                  }`}
                >
                  {b.requested ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4 text-emerald-600" />
                      Teamed Up
                    </>
                  ) : (
                    "Team Up"
                  )}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* New Buddy Request Dialog */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Post Study Buddy Request</DialogTitle>
            <DialogDescription>
              Specify what subject or exam you are studying for to get matched with peers.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBuddyRequest} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Study Topic / Exam *
              </label>
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Organic Chemistry II, TOEFL Prep, React 19"
                required
                className="rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Target Exam / Goal Date
                </label>
                <Input
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  placeholder="e.g. Nov 15"
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Timezone
                </label>
                <Select value={newTz} onValueChange={setNewTz}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC+5 (PST, Pakistan Standard Time)">
                      UTC+5 (PST, Pakistan Standard Time)
                    </SelectItem>
                    <SelectItem value="UTC-5 (EST)">UTC-5 (EST, Eastern)</SelectItem>
                    <SelectItem value="UTC-8 (PST)">UTC-8 (PST, Pacific)</SelectItem>
                    <SelectItem value="UTC+0 (GMT)">UTC+0 (GMT, London)</SelectItem>
                    <SelectItem value="UTC+5:30 (IST)">UTC+5:30 (IST, India)</SelectItem>
                    <SelectItem value="UTC+8 (SGT)">UTC+8 (SGT, Singapore)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Pace / Time Commitment
              </label>
              <Input
                value={newPace}
                onChange={(e) => setNewPace(e.target.value)}
                placeholder="e.g. 1-2 hours daily in the evening"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Additional Goals / Notes
              </label>
              <Textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Describe how you'd like to collaborate (e.g. problem solving sessions, quiz practice)..."
                rows={3}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRequestModalOpen(false)}
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

      {/* Quick Message Modal */}
      <Dialog
        open={!!selectedBuddyForMsg}
        onOpenChange={(open) => !open && setSelectedBuddyForMsg(null)}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Message {selectedBuddyForMsg?.name}</DialogTitle>
            <DialogDescription>
              Start a direct conversation regarding {selectedBuddyForMsg?.topic}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendQuickMessage} className="space-y-4 py-2">
            <Textarea
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              placeholder={`Hi ${selectedBuddyForMsg?.name}, I saw your focus on ${selectedBuddyForMsg?.topic}. Would love to study together!`}
              rows={4}
              required
              className="rounded-xl"
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedBuddyForMsg(null)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
              >
                <Send className="mr-1.5 h-4 w-4" /> Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Buddy Request Modal */}
      <SendBuddyModal
        isOpen={isSendModalOpen}
        onClose={() => {
          setIsSendModalOpen(false);
          setSelectedTargetUser(null);
        }}
      />
    </div>
  );
}
