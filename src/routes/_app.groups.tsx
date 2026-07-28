import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Users, MessagesSquare, Check, Calendar, FileText, Lock, Globe } from "lucide-react";
import { groups as initialGroups } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/groups")({
  head: () => ({
    meta: [
      { title: "Study Groups — Cortex" },
      {
        name: "description",
        content: "Persistent study rooms with chat, notes, files and progress.",
      },
    ],
  }),
  component: GroupsPage,
});

interface GroupItem {
  id: string;
  name: string;
  subject: string;
  members: number;
  active: string;
  color: string;
  joined?: boolean;
  description?: string;
  schedule?: string;
}

export function GroupsPage() {
  const navigate = useNavigate();
  const [groupList, setGroupList] = useState<GroupItem[]>(
    initialGroups.map((g) => ({
      ...g,
      joined: false,
      description: `Collaborative study group for ${g.name}. Join us to share lecture notes, solve problem sets together, and study for upcoming exams.`,
      schedule: "Weekly on Tuesdays & Thursdays at 7:00 PM",
    })),
  );

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("Computer Science");
  const [newDesc, setNewDesc] = useState("");
  const [newSchedule, setNewSchedule] = useState("Weekly on Mondays at 6:00 PM");

  // Preview Modal
  const [previewGroup, setPreviewGroup] = useState<GroupItem | null>(null);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter a group name.");
      return;
    }

    const newGroup: GroupItem = {
      id: "g_user_" + Date.now(),
      name: newName.trim(),
      subject: newSubject,
      members: 1,
      active: "Just created",
      color: "from-blue-600 to-indigo-700",
      joined: true,
      description: newDesc.trim() || `Study room for ${newName}.`,
      schedule: newSchedule,
    };

    setGroupList((prev) => [newGroup, ...prev]);
    setIsCreateModalOpen(false);
    toast.success(`Study group "${newName}" created successfully!`);

    setNewName("");
    setNewDesc("");
  };

  const handleToggleJoin = (groupId: string, groupName: string) => {
    setGroupList((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const nextJoined = !g.joined;
          if (nextJoined) {
            toast.success(`You joined "${groupName}"!`);
          } else {
            toast.info(`Left group "${groupName}".`);
          }
          return {
            ...g,
            joined: nextJoined,
            members: nextJoined ? g.members + 1 : Math.max(1, g.members - 1),
          };
        }
        return g;
      }),
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
            Study Groups
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chat, notes, calendars and shared progress — one dedicated room per goal.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groupList.map((g) => (
          <Card
            key={g.id}
            className="group flex flex-col justify-between overflow-hidden rounded-2xl border-border p-0 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div>
              <div
                className={`h-24 bg-gradient-to-br ${g.color} p-4 flex items-start justify-between text-white`}
              >
                <Badge className="bg-white/20 text-white backdrop-blur-md border-0 rounded-full text-xs">
                  {g.subject}
                </Badge>
                <span className="flex items-center gap-1.5 text-xs font-medium bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {g.active}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-semibold tracking-tight">{g.name}</h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {g.members} active members
                </div>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {g.description}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="mt-2 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewGroup(g)}
                  className="rounded-xl flex-1"
                >
                  Preview
                </Button>
                <Button
                  onClick={() => handleToggleJoin(g.id, g.name)}
                  className={`rounded-xl flex-1 transition ${
                    g.joined
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20"
                      : "bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
                  }`}
                >
                  {g.joined ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4 text-emerald-600" /> Joined
                    </>
                  ) : (
                    <>
                      <MessagesSquare className="mr-1.5 h-4 w-4" /> Join
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Group Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Study Group</DialogTitle>
            <DialogDescription>
              Set up a persistent study room for your course, exam, or project team.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateGroup} className="space-y-4 py-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Group Name *
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Advanced Operating Systems Sprint"
                required
                className="rounded-xl"
              />
            </div>

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
                  <SelectItem value="Data Science">Data Science</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Medical & Bio">Medical & Bio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Meeting / Study Schedule
              </label>
              <Input
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                placeholder="e.g. Weekly on Tuesdays at 7:00 PM"
                className="rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Group Description
              </label>
              <Textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe what your group will focus on (e.g. practice problems, weekly mock tests)..."
                rows={3}
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
              >
                Create Room
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Group Preview Modal */}
      <Dialog open={!!previewGroup} onOpenChange={(open) => !open && setPreviewGroup(null)}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{previewGroup?.name}</span>
            </DialogTitle>
            <DialogDescription>
              {previewGroup?.subject} · {previewGroup?.members} members
            </DialogDescription>
          </DialogHeader>

          {previewGroup && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-secondary/30 border border-border text-sm leading-relaxed">
                <div className="font-semibold text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                  About Group
                </div>
                {previewGroup.description}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-border bg-background">
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    Regular Schedule
                  </div>
                  <div className="text-muted-foreground">{previewGroup.schedule}</div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-background">
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    <FileText className="h-4 w-4 text-primary" />
                    Shared Assets
                  </div>
                  <div className="text-muted-foreground">
                    Class Notes, Practice Sets, Quiz Banks
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewGroup(null)}
                  className="rounded-xl"
                >
                  Close
                </Button>
                {previewGroup.joined ? (
                  <Button
                    onClick={() => {
                      setPreviewGroup(null);
                      navigate({ to: "/messages" });
                    }}
                    className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
                  >
                    <MessagesSquare className="mr-1.5 h-4 w-4" /> Enter Group Chat
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      handleToggleJoin(previewGroup.id, previewGroup.name);
                      setPreviewGroup(null);
                    }}
                    className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
                  >
                    Join Study Group
                  </Button>
                )}
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
