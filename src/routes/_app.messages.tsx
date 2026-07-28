import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Paperclip,
  Smile,
  Search,
  MessageSquarePlus,
  UserCheck,
  FileText,
  Image as ImageIcon,
  X,
  Download,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileUp,
} from "lucide-react";
import { messages as initialMessages } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Cortex" },
      { name: "description", content: "Private chats, tutors, study buddies, and groups." },
    ],
  }),
  component: MsgPage,
});

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "file";
  size: string;
}

interface ChatMessage {
  me: boolean;
  text: string;
  time: string;
  attachments?: Attachment[];
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  last: string;
  time: string;
  unread: number;
  status: "accepted" | "pending_request";
  chatHistory: ChatMessage[];
}

const SUGGESTED_CONTACTS = [
  {
    name: "Dr. Aris Thorne",
    role: "Quantum Physics Tutor",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    online: true,
  },
  {
    name: "Sarah Jenkins",
    role: "Calculus & Linear Algebra",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    online: true,
  },
  {
    name: "Liam Chen",
    role: "AI & CS Study Partner",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    online: true,
  },
  {
    name: "Elena Rostova",
    role: "Organic Chemistry Peer",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    online: false,
  },
  {
    name: "Cortex AI Assistant",
    role: "24/7 AI Tutor",
    avatar:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    online: true,
  },
];

export function MsgPage() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const defaultChats: Conversation[] = initialMessages.map((m) => ({
      ...m,
      status: "accepted",
      chatHistory: [
        { me: false, text: "Hey! Ready for our study session?", time: "10:30 AM" },
        { me: true, text: "Yes! Just finishing my coffee and notes ☕", time: "10:32 AM" },
        {
          me: false,
          text: `Sending over the ${m.name} review materials now!`,
          time: "10:35 AM",
          attachments: [
            {
              id: `att_init_${m.id}`,
              name: `${m.name.replace(/\s+/g, "_")}_StudyGuide.pdf`,
              url: "#",
              type: "file",
              size: "1.4 MB",
            },
          ],
        },
        { me: true, text: "Awesome, I've got the whiteboard open.", time: "10:36 AM" },
      ],
    }));

    // Add a pending message request from Dr. Aris Thorne
    const pendingRequest: Conversation = {
      id: "req_dr_thorn",
      name: "Dr. Aris Thorne",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      online: true,
      last: "Hello! Would love to invite you to collaborate on our Quantum Physics lab.",
      time: "10:15 AM",
      unread: 1,
      status: "pending_request",
      chatHistory: [
        {
          me: false,
          text: "Hello! I saw your Quantum Physics post on Cortex. I'm looking for dedicated students to join our lab project on Quantum Entanglement simulations. Let me know if you'd like to collaborate!",
          time: "10:15 AM",
          attachments: [
            {
              id: "att_lab_syllabus",
              name: "Quantum_Lab_Syllabus.pdf",
              url: "#",
              type: "file",
              size: "2.4 MB",
            },
          ],
        },
      ],
    };

    return [pendingRequest, ...defaultChats];
  });

  const [activeChatId, setActiveChatId] = useState<string>("req_dr_thorn");
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "requests">("all");

  // Attachments State
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Chat Modal state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<
    (typeof SUGGESTED_CONTACTS)[number] | null
  >(null);
  const [customContactName, setCustomContactName] = useState("");
  const [initialMessage, setInitialMessage] = useState("");

  const activeChat = conversations.find((c) => c.id === activeChatId) || conversations[0];

  const handleStartNewChat = () => {
    const name = selectedContact ? selectedContact.name : customContactName.trim();
    if (!name) {
      toast.error("Please select or enter a contact name.");
      return;
    }

    // Check if chat already exists
    const existing = conversations.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setActiveChatId(existing.id);
      if (initialMessage.trim()) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  last: initialMessage.trim(),
                  time: "Just now",
                  chatHistory: [
                    ...c.chatHistory,
                    { me: true, text: initialMessage.trim(), time: "Just now" },
                  ],
                }
              : c,
          ),
        );
      }
      toast.success(`Switched to existing chat with ${existing.name}`);
    } else {
      const avatar = selectedContact
        ? selectedContact.avatar
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
      const newId = `chat_${Date.now()}`;
      const newChat: Conversation = {
        id: newId,
        name,
        avatar,
        online: true,
        last: initialMessage.trim() || "Message request sent",
        time: "Just now",
        unread: 0,
        status: "accepted", // Sent by current user, auto-accepted for self
        chatHistory: initialMessage.trim()
          ? [{ me: true, text: initialMessage.trim(), time: "Just now" }]
          : [
              {
                me: false,
                text: `Hi! Thanks for reaching out on Cortex. Excited to connect and study together!`,
                time: "Just now",
              },
            ],
      };
      setConversations((prev) => [newChat, ...prev]);
      setActiveChatId(newId);
      toast.success(`New chat started with ${name}`);
    }

    // Reset & Close
    setSelectedContact(null);
    setCustomContactName("");
    setInitialMessage("");
    setContactSearch("");
    setIsNewChatOpen(false);
  };

  // Attachment Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = Array.from(files).map((f, idx) => {
      const isImage = f.type.startsWith("image/");
      const sizeStr =
        f.size > 1024 * 1024
          ? `${(f.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(f.size / 1024)} KB`;
      return {
        id: `att_${Date.now()}_${idx}`,
        name: f.name,
        url: isImage ? URL.createObjectURL(f) : "#",
        type: isImage ? "image" : "file",
        size: sizeStr,
      };
    });

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    toast.success(`${newAttachments.length} file(s) attached`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddSampleAttachment = (type: "image" | "file") => {
    if (type === "image") {
      const sampleImage: Attachment = {
        id: `att_img_${Date.now()}`,
        name: "Physics_Diagram_Notes.png",
        url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
        type: "image",
        size: "1.2 MB",
      };
      setPendingAttachments((prev) => [...prev, sampleImage]);
      toast.success("Sample diagram attached!");
    } else {
      const sampleDoc: Attachment = {
        id: `att_doc_${Date.now()}`,
        name: "Cortex_Study_Summary.pdf",
        url: "#",
        type: "file",
        size: "850 KB",
      };
      setPendingAttachments((prev) => [...prev, sampleDoc]);
      toast.success("Sample document attached!");
    }
  };

  // Accept / Decline Request
  const handleAcceptRequest = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "accepted", unread: 0 } : c)),
    );
    toast.success(`Message request from ${activeChat?.name || "sender"} accepted!`);
  };

  const handleDeclineRequest = (id: string) => {
    const chatName = activeChat?.name || "sender";
    setConversations((prev) => prev.filter((c) => c.id !== id));
    toast.info(`Message request from ${chatName} declined.`);
    const remaining = conversations.filter((c) => c.id !== id);
    if (remaining.length > 0) {
      setActiveChatId(remaining[0].id);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && pendingAttachments.length === 0) || !activeChat) return;

    const newMsgText = inputText.trim();
    const attachmentsToSend = [...pendingAttachments];

    setInputText("");
    setPendingAttachments([]);

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          const newMsg: ChatMessage = {
            me: true,
            text: newMsgText || (attachmentsToSend.length > 0 ? "Sent attachments" : ""),
            time: "Just now",
            attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined,
          };
          return {
            ...c,
            last: newMsgText || "Sent attachment",
            time: "Just now",
            chatHistory: [...c.chatHistory, newMsg],
          };
        }
        return c;
      }),
    );

    // Simulate friendly auto-reply after 1.5 seconds
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeChat.id) {
            const autoReply: ChatMessage = {
              me: false,
              text: `Got it! Thanks for the update on ${activeChat.name}.`,
              time: "Just now",
            };
            return {
              ...c,
              last: autoReply.text,
              time: "Just now",
              chatHistory: [...c.chatHistory, autoReply],
            };
          }
          return c;
        }),
      );
    }, 1500);
  };

  const pendingCount = conversations.filter((c) => c.status === "pending_request").length;

  const filteredChats = conversations.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterTab === "requests") {
      return matchesSearch && c.status === "pending_request";
    }
    return matchesSearch;
  });

  return (
    <div className="grid h-[calc(100vh-4rem)] lg:grid-cols-[340px_1fr]">
      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip"
      />

      {/* Sidebar Chat List */}
      <aside className="flex flex-col border-r border-border bg-card">
        <div className="border-b border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl tracking-tight font-medium">Messages</h2>
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="rounded-xl gap-1.5 bg-gradient-primary text-primary-foreground shadow-soft"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  New Chat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-display">
                    <MessageSquarePlus className="h-5 w-5 text-primary" />
                    Start New Chat
                  </DialogTitle>
                  <DialogDescription>
                    Connect with any peer or tutor on Cortex. New messages will arrive as a message
                    request for first-time senders.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Search / Filter Contacts */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                      Select Contact
                    </label>
                    <div className="relative mb-2">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder="Filter suggested contacts…"
                        className="pl-8 h-9 text-xs rounded-xl"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-xl p-1.5 bg-muted/20">
                      {SUGGESTED_CONTACTS.filter(
                        (c) =>
                          c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                          c.role.toLowerCase().includes(contactSearch.toLowerCase()),
                      ).map((c) => {
                        const isSelected = selectedContact?.name === c.name;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setSelectedContact(isSelected ? null : c);
                              setCustomContactName("");
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition text-xs ${
                              isSelected
                                ? "bg-primary/10 border border-primary/30 text-primary font-medium"
                                : "hover:bg-muted/80 text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8 shrink-0">
                                <AvatarImage src={c.avatar} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                  {c.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold">{c.name}</div>
                                <div className="text-[10px] text-muted-foreground">{c.role}</div>
                              </div>
                            </div>
                            {isSelected && <UserCheck className="h-4 w-4 text-primary shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Name fallback if not selecting from list */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Or type custom name / username
                    </label>
                    <Input
                      value={customContactName}
                      onChange={(e) => {
                        setCustomContactName(e.target.value);
                        if (e.target.value) setSelectedContact(null);
                      }}
                      placeholder="e.g. Prof. Miller or Classmate Alex"
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  {/* Optional initial message */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                      Initial Message (Optional)
                    </label>
                    <Textarea
                      value={initialMessage}
                      onChange={(e) => setInitialMessage(e.target.value)}
                      placeholder="Hi! Would you like to study together or discuss review topics?"
                      className="text-xs rounded-xl min-h-[70px] resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsNewChatOpen(false)}
                    className="rounded-xl text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleStartNewChat}
                    className="rounded-xl text-xs bg-gradient-primary text-primary-foreground shadow-soft"
                  >
                    Start Chat
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 rounded-xl pl-9 bg-muted/50 text-xs"
              placeholder="Search chats…"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setFilterTab("all")}
              className={`flex-1 py-1 rounded-lg font-medium transition text-center ${
                filterTab === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Chats
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("requests")}
              className={`flex-1 py-1 rounded-lg font-medium transition text-center flex items-center justify-center gap-1 ${
                filterTab === "requests"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Requests</span>
              {pendingCount > 0 && (
                <Badge className="h-4 px-1.5 text-[9px] bg-amber-500 text-white border-0 font-bold rounded-full">
                  {pendingCount}
                </Badge>
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground text-xs">
              No conversations found.
            </div>
          ) : (
            filteredChats.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveChatId(m.id);
                  // clear unread
                  setConversations((prev) =>
                    prev.map((c) => (c.id === m.id ? { ...c, unread: 0 } : c)),
                  );
                }}
                className={`w-full rounded-xl p-3 text-left transition ${
                  activeChatId === m.id
                    ? "bg-accent text-accent-foreground font-medium"
                    : "hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {m.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {m.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-emerald-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="truncate text-sm font-semibold flex items-center gap-1.5">
                        <span className="truncate">{m.name}</span>
                        {m.status === "pending_request" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-700 shrink-0"
                          >
                            Request
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground shrink-0">{m.time}</div>
                    </div>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <div className="truncate text-xs text-muted-foreground">{m.last}</div>
                      {m.unread > 0 && (
                        <Badge className="rounded-full bg-gradient-primary text-primary-foreground border-0 h-4 min-w-[16px] px-1 text-[10px] shrink-0">
                          {m.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main Active Chat Area */}
      <section className="flex flex-col h-full bg-background min-w-0">
        <div className="flex items-center justify-between border-b border-border p-4 bg-card">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activeChat.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {activeChat.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <span>{activeChat.name}</span>
                {activeChat.status === "pending_request" && (
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-700"
                  >
                    Pending Message Request
                  </Badge>
                )}
              </div>
              <div className="text-xs text-emerald-600 font-medium">
                {activeChat.online ? "Online · Active now" : "Offline"}
              </div>
            </div>
          </div>
        </div>

        {/* Message Bubble History */}
        <div className="flex-1 space-y-3 overflow-auto bg-muted/20 p-6">
          {activeChat.chatHistory.map((b, i) => (
            <div key={i} className={`flex ${b.me ? "justify-end" : "justify-start"}`}>
              <div className="max-w-md">
                <Card
                  className={`rounded-2xl border-none p-3.5 text-sm shadow-soft ${
                    b.me
                      ? "bg-gradient-primary text-primary-foreground"
                      : "bg-card text-foreground border border-border"
                  }`}
                >
                  {b.text && <p className="whitespace-pre-wrap">{b.text}</p>}

                  {/* Attachment Cards in Message */}
                  {b.attachments && b.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {b.attachments.map((att) =>
                        att.type === "image" ? (
                          <div
                            key={att.id}
                            className="relative group overflow-hidden rounded-xl border border-white/20"
                          >
                            <img
                              src={att.url}
                              alt={att.name}
                              className="max-h-52 w-full object-cover rounded-xl transition duration-200 group-hover:scale-105"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                              {att.size}
                            </div>
                          </div>
                        ) : (
                          <div
                            key={att.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs gap-3 ${
                              b.me
                                ? "bg-white/15 text-white border border-white/20"
                                : "bg-muted/80 text-foreground border border-border"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`p-2 rounded-lg shrink-0 ${
                                  b.me ? "bg-white/20" : "bg-primary/10 text-primary"
                                }`}
                              >
                                <FileText className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold truncate">{att.name}</p>
                                <p className="text-[10px] opacity-80">{att.size}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => toast.success(`Downloading ${att.name}`)}
                              className="h-7 w-7 rounded-lg hover:bg-white/20 shrink-0"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </Card>
                <div
                  className={`text-[10px] text-muted-foreground mt-1 px-1 ${
                    b.me ? "text-right" : "text-left"
                  }`}
                >
                  {b.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Request Accept Banner OR Input Box */}
        {activeChat.status === "pending_request" ? (
          <div className="border-t border-border bg-card p-4 shadow-soft">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={activeChat.avatar} />
                  <AvatarFallback className="bg-amber-500/20 text-amber-700 font-bold">
                    {activeChat.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                    <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>Message Request from {activeChat.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Do you want to allow {activeChat.name} to message you? Once accepted, you can
                    chat freely on Cortex.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeclineRequest(activeChat.id)}
                  className="rounded-xl text-xs flex-1 sm:flex-initial text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Decline
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAcceptRequest(activeChat.id)}
                  className="rounded-xl text-xs flex-1 sm:flex-initial bg-gradient-primary text-primary-foreground shadow-soft"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Accept Request
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-border p-4 bg-card space-y-2">
            {/* Pending Attachments Preview List */}
            {pendingAttachments.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {pendingAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 bg-muted/80 border border-border px-2.5 py-1.5 rounded-xl text-xs shrink-0"
                  >
                    {att.type === "image" ? (
                      <ImageIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                    ) : (
                      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                    <div className="max-w-[120px] truncate font-medium">{att.name}</div>
                    <span className="text-[10px] text-muted-foreground">({att.size})</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePendingAttachment(att.id)}
                      className="text-muted-foreground hover:text-destructive p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2 shadow-soft"
            >
              {/* Paperclip button with Dropdown for Upload file or Sample Attachment */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon" className="rounded-xl shrink-0">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 rounded-xl">
                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2 text-xs"
                  >
                    <FileUp className="h-4 w-4 text-primary" />
                    Upload File / Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAddSampleAttachment("image")}
                    className="gap-2 text-xs"
                  >
                    <ImageIcon className="h-4 w-4 text-emerald-500" />
                    Attach Diagram Photo
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleAddSampleAttachment("file")}
                    className="gap-2 text-xs"
                  >
                    <FileText className="h-4 w-4 text-blue-500" />
                    Attach Study PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="border-none focus-visible:ring-0 text-sm"
                placeholder={`Message ${activeChat.name}…`}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setInputText((prev) => prev + " 😊")}
                className="rounded-xl shrink-0"
              >
                <Smile className="h-4 w-4 text-muted-foreground" />
              </Button>

              <Button
                type="submit"
                size="icon"
                className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
