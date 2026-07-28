import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, CheckCircle2, AtSign, Building2, Sparkles } from "lucide-react";
import { searchNetworkUsers, cleanHandle, type NetworkUser } from "@/lib/user-network";
import { sendBuddyRequest, isConnectedBuddy } from "@/lib/notifications-store";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface SendBuddyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTarget?: NetworkUser | null;
  onSuccess?: () => void;
}

export function SendBuddyModal({
  isOpen,
  onClose,
  defaultTarget = null,
  onSuccess,
}: SendBuddyModalProps) {
  const { profile } = useAuth();
  const [query, setQuery] = useState(defaultTarget ? defaultTarget.username : "");
  const [selectedUser, setSelectedUser] = useState<NetworkUser | null>(defaultTarget);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  // Live matching network users
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    return searchNetworkUsers(query, profile?.uid).slice(0, 5);
  }, [query, profile?.uid]);

  const handleSelectUser = (user: NetworkUser) => {
    setSelectedUser(user);
    setQuery(user.username);
  };

  const handleSend = () => {
    const rawTarget = selectedUser ? selectedUser.uid : query.trim();
    if (!rawTarget) {
      toast.error("Please enter a Unique ID or @username handle.");
      return;
    }

    setSending(true);
    try {
      const res = sendBuddyRequest({
        targetUidOrHandle: rawTarget,
        customNote: note,
        senderProfile: profile,
      });

      if (res.success) {
        toast.success(res.message);
        onSuccess?.();
        handleClose();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to send buddy request. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setQuery("");
    setSelectedUser(null);
    setNote("");
    onClose();
  };

  const isAlreadyConnected = selectedUser ? isConnectedBuddy(selectedUser.uid) : false;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl border-border bg-card p-6 shadow-elegant">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-soft">
              <UserPlus className="h-5 w-5" />
            </div>
            Send Study Buddy Request
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Connect with peers across institutions using their Unique ID or @username handle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Target Handle or Unique ID Search */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center justify-between">
              <span>Target Unique ID or @username</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                e.g. aditi_sharma or b1
              </span>
            </label>
            <div className="relative">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedUser(null);
                }}
                placeholder="Type unique ID (e.g. b2) or @handle (e.g. rahul_verma)..."
                className="pl-9 h-10 text-xs rounded-xl font-mono focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Quick Suggestions List if typing */}
          {!selectedUser && searchResults.length > 0 && (
            <div className="border border-border rounded-xl p-1.5 bg-muted/20 max-h-44 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Matching Network Users
              </div>
              {searchResults.map((u) => (
                <button
                  key={u.uid}
                  type="button"
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center justify-between p-2 rounded-lg text-left transition text-xs hover:bg-muted/80"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={u.avatarUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {u.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <span className="truncate">{u.displayName}</span>
                        <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded shrink-0">
                          @{u.username}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        ID: {u.uid} · {u.institution || "Cortex Network"}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] rounded-full shrink-0">
                    Select
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* Selected User Profile Card */}
          {selectedUser && (
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-2 relative">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    <AvatarImage src={selectedUser.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {selectedUser.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-1.5">
                      {selectedUser.displayName}
                      <span className="font-mono text-xs text-primary bg-primary/15 px-1.5 py-0.5 rounded font-medium">
                        @{selectedUser.username}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Building2 className="h-3 w-3" />
                      {selectedUser.institution || "Cortex Global"} · Unique ID:{" "}
                      <span className="font-mono text-foreground font-semibold">
                        {selectedUser.uid}
                      </span>
                    </div>
                  </div>
                </div>
                {isAlreadyConnected ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">
                    Network User
                  </Badge>
                )}
              </div>

              {selectedUser.about && (
                <p className="text-xs text-muted-foreground line-clamp-2 italic pt-1">
                  &ldquo;{selectedUser.about}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Custom Introduction Note */}
          <div>
            <label className="text-xs font-semibold text-foreground mb-1 block flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Intro Note / Study Goals (Optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Hi! Saw you are studying Operating Systems. Let's practice deadlock questions together!"
              className="min-h-[80px] text-xs rounded-xl focus-visible:ring-primary"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} className="rounded-xl text-xs">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || (!selectedUser && !query.trim()) || isAlreadyConnected}
            className="rounded-xl text-xs bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
          >
            {sending ? "Sending Request..." : "Send Buddy Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
