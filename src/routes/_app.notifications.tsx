import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  Coins,
  LifeBuoy,
  Users,
  Award,
  Calendar,
  UserPlus,
  CheckCircle2,
  XCircle,
  Trash2,
  Check,
  MessageSquare,
  Sparkles,
  Search,
} from "lucide-react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  deleteNotification,
  clearAllNotifications,
  respondToBuddyRequest,
  NOTIFICATION_EVENT,
  type CortexNotification,
} from "@/lib/notifications-store";
import { SendBuddyModal } from "@/components/send-buddy-modal";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Requests — Cortex" },
      { name: "description", content: "Buddy requests, study sessions, credits and alerts." },
    ],
  }),
  component: NotifPage,
});

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  buddy_request: UserPlus,
  buddy_accepted: CheckCircle2,
  credit: Coins,
  sos: LifeBuoy,
  buddy: Users,
  achievement: Award,
  session: Calendar,
  group_invite: Sparkles,
};

function NotifPage() {
  const [notifList, setNotifList] = useState<CortexNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "requests" | "sessions" | "credits">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);

  // Load and subscribe to notification store
  useEffect(() => {
    const update = () => {
      setNotifList(getNotifications());
    };

    update();
    window.addEventListener(NOTIFICATION_EVENT, update);
    return () => window.removeEventListener(NOTIFICATION_EVENT, update);
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    toast.success("All notifications marked as read.");
  };

  const handleClearAll = () => {
    if (notifList.length === 0) return;
    clearAllNotifications();
    toast.success("Notification inbox cleared.");
  };

  const handleRespondRequest = (notifId: string, accept: boolean) => {
    const res = respondToBuddyRequest(notifId, accept);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleDeleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(id);
    toast.info("Notification removed.");
  };

  const filteredNotifs = notifList.filter((n) => {
    // Filter tabs
    if (filter === "requests" && n.type !== "buddy_request" && n.type !== "buddy_accepted") {
      return false;
    }
    if (filter === "sessions" && n.type !== "session" && n.type !== "sos") {
      return false;
    }
    if (filter === "credits" && n.type !== "credit" && n.type !== "achievement") {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const textMatch = n.text.toLowerCase().includes(q);
      const titleMatch = n.title?.toLowerCase().includes(q) || false;
      const userMatch =
        n.fromUser?.displayName.toLowerCase().includes(q) ||
        n.fromUser?.username.toLowerCase().includes(q) ||
        n.fromUser?.uid.toLowerCase().includes(q) ||
        false;
      return textMatch || titleMatch || userMatch;
    }

    return true;
  });

  const unreadCount = notifList.filter((n) => !n.read).length;
  const pendingRequestsCount = notifList.filter(
    (n) => n.type === "buddy_request" && n.requestStatus === "pending",
  ).length;

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      {/* Header with Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight flex items-center gap-3">
            <div className="relative">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                <Bell className="h-5 w-5" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            Notifications
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Manage incoming study buddy requests, session reminders, and academic activity.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => setIsSendModalOpen(true)}
            className="rounded-xl text-xs bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 gap-1.5"
          >
            <UserPlus className="h-4 w-4" />
            Send Buddy Request
          </Button>

          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs gap-1.5"
            >
              <Check className="h-3.5 w-3.5 text-primary" />
              Mark all read
            </Button>
          )}

          {notifList.length > 0 && (
            <Button
              onClick={handleClearAll}
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs text-muted-foreground hover:text-destructive gap-1"
              title="Clear all notifications"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/60 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              filter === "all"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.2 rounded-md">
              {notifList.length}
            </Badge>
          </button>

          <button
            onClick={() => setFilter("requests")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              filter === "requests"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Buddy Requests
            {pendingRequestsCount > 0 ? (
              <Badge className="text-[10px] px-1.5 py-0.2 rounded-md bg-primary text-primary-foreground">
                {pendingRequestsCount}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.2 rounded-md">
                {
                  notifList.filter((n) => n.type === "buddy_request" || n.type === "buddy_accepted")
                    .length
                }
              </Badge>
            )}
          </button>

          <button
            onClick={() => setFilter("sessions")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              filter === "sessions"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sessions & SOS
          </button>

          <button
            onClick={() => setFilter("credits")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              filter === "credits"
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Credits & Awards
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search @username or text…"
            className="w-full pl-8 h-9 text-xs rounded-xl border border-border bg-card px-3 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.length === 0 ? (
          <Card className="rounded-2xl border-border p-12 text-center shadow-soft space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted/50 text-muted-foreground">
              <Bell className="h-7 w-7" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="font-semibold text-base">No notifications match your filter</h3>
              <p className="text-xs text-muted-foreground">
                When classmates send you buddy requests, session alerts, or SOS invites, they will
                appear right here.
              </p>
            </div>
            <Button
              onClick={() => setIsSendModalOpen(true)}
              className="rounded-xl text-xs bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              Send a Buddy Request
            </Button>
          </Card>
        ) : (
          filteredNotifs.map((n) => {
            const Icon = iconMap[n.type] ?? Bell;
            const isBuddyRequest = n.type === "buddy_request";
            const from = n.fromUser;

            return (
              <Card
                key={n.id}
                onClick={() => !n.read && markNotificationRead(n.id)}
                className={`rounded-2xl border transition-all p-4 shadow-soft relative group ${
                  !n.read
                    ? "border-primary/40 bg-card/90 shadow-md ring-1 ring-primary/20"
                    : "border-border bg-card/60 hover:bg-card"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Category Icon or Sender Avatar */}
                  {from ? (
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage src={from.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {from.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft">
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
                      <Icon className="h-4 w-4" />
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {n.title && <span className="font-semibold text-xs">{n.title}</span>}
                        {from && (
                          <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-medium">
                            @{from.username}
                          </span>
                        )}
                        {!n.read && (
                          <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {n.time}
                        </span>
                        <Button
                          onClick={(e) => handleDeleteNotif(n.id, e)}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                          title="Remove notification"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-xs text-foreground font-medium leading-relaxed">{n.text}</p>

                    {/* From user detailed specs */}
                    {from && (
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                        {from.institution && <span>🏫 {from.institution}</span>}
                        {from.degreeOrStream && <span>· 📚 {from.degreeOrStream}</span>}
                        <span className="font-mono text-[10px] text-muted-foreground">
                          (ID: {from.uid})
                        </span>
                      </div>
                    )}

                    {/* Custom Note Quote box for requests */}
                    {n.customNote && (
                      <div className="rounded-xl border border-border/80 bg-muted/30 p-2.5 text-xs text-muted-foreground italic font-sans leading-relaxed">
                        &ldquo;{n.customNote}&rdquo;
                      </div>
                    )}

                    {/* Action Bar for Interactive Buddy Request */}
                    {isBuddyRequest && (
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        {n.requestStatus === "pending" ? (
                          <>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRespondRequest(n.id, true);
                              }}
                              size="sm"
                              className="h-8 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft gap-1.5"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Accept Request
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRespondRequest(n.id, false);
                              }}
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive/40"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Decline
                            </Button>
                          </>
                        ) : n.requestStatus === "accepted" ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs py-1 px-2.5 gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              Connected Study Buddy
                            </Badge>
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs rounded-xl text-primary hover:bg-primary/10 gap-1"
                            >
                              <Link to="/messages">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Send Message
                              </Link>
                            </Button>
                          </div>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground text-xs py-1 px-2.5"
                          >
                            Request Declined
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Send Buddy Request Modal */}
      <SendBuddyModal
        isOpen={isSendModalOpen}
        onClose={() => setIsSendModalOpen(false)}
        onSuccess={() => setNotifList(getNotifications())}
      />
    </div>
  );
}
