import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  TrendingUp,
  Plus,
  Send,
  Filter,
  CheckCircle,
} from "lucide-react";
import { posts as initialPosts } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/community")({
  head: () => ({
    meta: [
      { title: "Community — Cortex" },
      { name: "description", content: "Ask, answer, share notes. Accepted answers earn credits." },
    ],
  }),
  component: CommunityPage,
});

interface CommentItem {
  id: string;
  author: string;
  time: string;
  body: string;
}

interface PostItem {
  id: string;
  author: string;
  avatar?: string;
  time: string;
  subject: string;
  tag: string;
  title: string;
  body: string;
  likes: number;
  liked?: boolean;
  saved?: boolean;
  commentsCount: number;
  commentsList: CommentItem[];
}

export function CommunityPage() {
  const [postList, setPostList] = useState<PostItem[]>(
    initialPosts.map((p) => ({
      ...p,
      liked: false,
      saved: false,
      commentsCount: p.comments,
      commentsList: [
        {
          id: "c1",
          author: "Alex Rivers",
          time: "1h ago",
          body: "Great point! I recommend checking chapter 4 in the textbook for a similar example.",
        },
      ],
    })),
  );

  // New Post Form State
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [selectedType, setSelectedType] = useState<"Question" | "Notes" | "Resource" | "Poll">(
    "Question",
  );
  const [selectedSubject, setSelectedSubject] = useState("Algorithms");

  // Filters State
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string | null>(null);

  // Expanded Comments State
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState("");

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      toast.error("Please enter a title for your post.");
      return;
    }

    const newPost: PostItem = {
      id: "post_user_" + Date.now(),
      author: "You",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      time: "Just now",
      subject: selectedSubject,
      tag: selectedType,
      title: postTitle.trim(),
      body: postBody.trim() || postTitle.trim(),
      likes: 0,
      liked: false,
      saved: false,
      commentsCount: 0,
      commentsList: [],
    };

    setPostList((prev) => [newPost, ...prev]);
    setPostTitle("");
    setPostBody("");
    toast.success(`Published ${selectedType.toLowerCase()} to the Cortex community!`);
  };

  const handleToggleLike = (postId: string) => {
    setPostList((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.liked;
          return {
            ...p,
            liked: nextLiked,
            likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      }),
    );
  };

  const handleToggleSave = (postId: string) => {
    setPostList((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextSaved = !p.saved;
          toast.info(nextSaved ? "Post saved to your bookmarks." : "Post removed from bookmarks.");
          return { ...p, saved: nextSaved };
        }
        return p;
      }),
    );
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setPostList((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment: CommentItem = {
            id: "c_" + Date.now(),
            author: "You",
            time: "Just now",
            body: newCommentText.trim(),
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            commentsList: [...p.commentsList, newComment],
          };
        }
        return p;
      }),
    );

    setNewCommentText("");
    toast.success("Comment added!");
  };

  const filteredPosts = postList.filter((p) => {
    if (activeTagFilter) {
      const matchTag =
        p.body.toLowerCase().includes(activeTagFilter.toLowerCase()) ||
        p.title.toLowerCase().includes(activeTagFilter.toLowerCase()) ||
        p.tag.toLowerCase().includes(activeTagFilter.toLowerCase());
      if (!matchTag) return false;
    }
    if (activeSubjectFilter) {
      if (p.subject.toLowerCase() !== activeSubjectFilter.toLowerCase()) return false;
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
            Community Hub
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Questions, study notes, and peer discussions from 42,000 learners.
          </p>
        </div>

        {(activeTagFilter || activeSubjectFilter) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveTagFilter(null);
              setActiveSubjectFilter(null);
            }}
            className="rounded-xl text-xs"
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* Post Creation Box */}
          <Card className="rounded-2xl border-border p-5 shadow-soft bg-card">
            <form onSubmit={handleCreatePost} className="space-y-3">
              <Input
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Share a note, ask a question, or post a resource…"
                required
                className="h-11 rounded-xl bg-muted/50 font-medium"
              />

              {postTitle.length > 0 && (
                <Textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder="Add additional details, code snippets, or background context..."
                  rows={3}
                  className="rounded-xl bg-muted/30"
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(["Question", "Notes", "Resource", "Poll"] as const).map((t) => (
                    <Button
                      key={t}
                      type="button"
                      size="sm"
                      variant={selectedType === t ? "default" : "ghost"}
                      onClick={() => setSelectedType(t)}
                      className={`rounded-full text-xs ${
                        selectedType === t
                          ? "bg-gradient-primary text-primary-foreground shadow-soft"
                          : ""
                      }`}
                    >
                      {t}
                    </Button>
                  ))}
                </div>

                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Post to Community
                </Button>
              </div>
            </form>
          </Card>

          {/* Posts List */}
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No community posts found matching your filter criteria.
            </div>
          ) : (
            filteredPosts.map((p) => (
              <Card key={p.id} className="rounded-2xl border-border p-5 shadow-soft">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={p.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {p.author.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold">{p.author}</span>
                      <span className="text-muted-foreground">· {p.time}</span>
                      <Badge variant="secondary" className="rounded-full text-[10px]">
                        {p.subject}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px]">
                        {p.tag}
                      </Badge>
                    </div>

                    <h3 className="mt-2 text-base md:text-lg font-semibold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {p.body}
                    </p>

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground pt-2 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLike(p.id)}
                        className={`rounded-full ${p.liked ? "text-rose-500 font-semibold" : ""}`}
                      >
                        <Heart
                          className={`mr-1.5 h-4 w-4 ${p.liked ? "fill-rose-500 text-rose-500" : ""}`}
                        />
                        {p.likes}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedPostId(expandedPostId === p.id ? null : p.id)}
                        className="rounded-full"
                      >
                        <MessageCircle className="mr-1.5 h-4 w-4" />
                        {p.commentsCount}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSave(p.id)}
                        className={`rounded-full ${p.saved ? "text-primary font-semibold" : ""}`}
                      >
                        <Bookmark
                          className={`mr-1.5 h-4 w-4 ${p.saved ? "fill-primary text-primary" : ""}`}
                        />
                        {p.saved ? "Saved" : "Save"}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard?.writeText(window.location.href);
                          toast.success("Post link copied!");
                        }}
                        className="rounded-full"
                      >
                        <Share2 className="mr-1.5 h-4 w-4" />
                        Share
                      </Button>
                    </div>

                    {/* Expanded Comments Section */}
                    {expandedPostId === p.id && (
                      <div className="mt-4 space-y-3 pt-3 border-t border-border bg-secondary/20 p-4 rounded-xl">
                        <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                          Comments ({p.commentsList.length})
                        </div>

                        {p.commentsList.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-lg bg-background border border-border text-xs"
                          >
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span>{c.author}</span>
                              <span className="text-[10px] text-muted-foreground">{c.time}</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{c.body}</p>
                          </div>
                        ))}

                        <form
                          onSubmit={(e) => handleAddComment(p.id, e)}
                          className="flex items-center gap-2 pt-1"
                        >
                          <Input
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            placeholder="Write a comment or answer..."
                            className="h-9 rounded-xl text-xs bg-background"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            className="h-9 rounded-xl bg-gradient-primary text-primary-foreground"
                          >
                            Reply
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-border p-5 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Trending topics</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "dynamic-programming",
                "transformers",
                "os-deadlocks",
                "react-19",
                "sql-indexing",
                "ielts-writing",
                "linear-algebra",
              ].map((t) => (
                <Badge
                  key={t}
                  variant={activeTagFilter === t ? "default" : "secondary"}
                  onClick={() => setActiveTagFilter(activeTagFilter === t ? null : t)}
                  className={`rounded-full cursor-pointer transition ${
                    activeTagFilter === t
                      ? "bg-gradient-primary text-primary-foreground"
                      : "hover:bg-primary/20"
                  }`}
                >
                  #{t}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border-border p-5 shadow-soft">
            <h3 className="mb-3 font-semibold text-sm">Filter by subject</h3>
            <div className="space-y-1.5 text-xs">
              {["Algorithms", "Machine Learning", "Databases", "OS", "Frontend", "Math"].map(
                (s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveSubjectFilter(activeSubjectFilter === s ? null : s)}
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 transition ${
                      activeSubjectFilter === s
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <span>{s}</span>
                    <span
                      className={`text-[10px] ${activeSubjectFilter === s ? "text-primary-foreground" : "text-muted-foreground"}`}
                    >
                      {Math.floor(Math.random() * 400) + 20}
                    </span>
                  </button>
                ),
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
