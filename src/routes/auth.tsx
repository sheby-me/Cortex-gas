import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Mail, Lock, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/integrations/firebase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Cortex" },
      { name: "description", content: "Sign in to Cortex as a student, verified tutor, or admin." },
    ],
  }),
  component: AuthPage,
});

type Role = "student" | "tutor";

const ROLE_META: Record<
  Role,
  {
    title: string;
    blurb: string;
    icon: React.ComponentType<{ className?: string }>;
    allowSignup: boolean;
  }
> = {
  student: {
    title: "Student",
    blurb: "Learn from peers and tutors. Earn credits by helping others.",
    icon: BookOpen,
    allowSignup: true,
  },
  tutor: {
    title: "Verified Tutor",
    blurb: "Sign up to teach — share materials or run live sessions.",
    icon: GraduationCap,
    allowSignup: true,
  },
};

function AuthPage() {
  const [role, setRole] = useState<Role>("student");
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden border-r border-border bg-secondary lg:block">
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-display text-sm font-bold">
              C
            </div>
            <span className="text-lg font-display font-semibold tracking-tight">Cortex</span>
          </Link>
          <div>
            <h2 className="font-display text-5xl font-medium leading-[1.05] tracking-tight">
              Teach. Learn.
              <br />
              Trade knowledge.
            </h2>
            <p className="mt-4 max-w-sm text-muted-foreground">
              One platform. Three ways in — depending on how you show up.
            </p>
            <div className="mt-8 space-y-3">
              {(Object.keys(ROLE_META) as Role[]).map((r) => {
                const M = ROLE_META[r];
                return (
                  <div
                    key={r}
                    className="flex items-start gap-3 rounded-md border border-border bg-background p-4"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                      <M.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{M.title}</div>
                      <div className="text-xs text-muted-foreground">{M.blurb}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">© 2026 Cortex</div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <Card className="w-full max-w-md rounded-lg border-border p-8 shadow-soft">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-medium tracking-tight">Welcome to Cortex</h1>
            <p className="mt-1 text-sm text-muted-foreground">Choose how you're signing in.</p>
          </div>
          <Tabs value={role} onValueChange={(v) => setRole(v as Role)}>
            <TabsList className="grid w-full grid-cols-2 rounded-md">
              <TabsTrigger value="student" className="rounded-sm text-xs">
                Student
              </TabsTrigger>
              <TabsTrigger value="tutor" className="rounded-sm text-xs">
                Tutor
              </TabsTrigger>
            </TabsList>
            {(Object.keys(ROLE_META) as Role[]).map((r) => (
              <TabsContent key={r} value={r} className="mt-6">
                <RoleForm role={r} />
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function RoleForm({ role }: { role: Role }) {
  const meta = ROLE_META[role];
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [credentials, setCredentials] = useState("");
  const [busy, setBusy] = useState(false);

  const canSignup = meta.allowSignup;

  async function ensureAdminRole(uid: string, email: string) {
    // Admin allowlist collection: doc id = lowercased email
    const key = email.toLowerCase();
    const allow = await getDoc(doc(db, "admin_emails", key));
    if (!allow.exists()) return false;
    await setDoc(
      doc(db, "users", uid),
      { role: "admin", email, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return true;
  }

  async function routeAfterSignIn(uid: string, email: string) {
    // If email is in admin allowlist, always promote & route to admin
    const isAdmin = await ensureAdminRole(uid, email);
    const snap = await getDoc(doc(db, "users", uid));
    const data = snap.data() as Record<string, unknown> | undefined;
    const currentRole: string = isAdmin ? "admin" : ((data?.role as string) ?? "student");
    const tutorStatus: string | undefined = data?.tutorStatus;

    if (currentRole === "admin") {
      await fbSignOut(auth);
      throw new Error("Admins must sign in at /admin.");
    }
    if (role === "tutor") {
      if (currentRole === "tutor") {
        navigate({ to: "/teacher" });
        return;
      }
      if (tutorStatus === "rejected") {
        await fbSignOut(auth);
        throw new Error("Your tutor application was not approved.");
      }
      if (tutorStatus === "pending") {
        navigate({ to: "/pending" });
        return;
      }
      await fbSignOut(auth);
      throw new Error("No tutor application on file for this account.");
    }
    // student tab
    if (currentRole === "tutor") {
      await fbSignOut(auth);
      throw new Error("Please sign in from the correct tab for your account.");
    }
    navigate({ to: "/dashboard" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup" && canSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const display = name || email.split("@")[0];
        await updateProfile(cred.user, { displayName: display });

        const isAdminEmail = (await getDoc(doc(db, "admin_emails", email.toLowerCase()))).exists();
        const assignedRole = isAdminEmail ? "admin" : role === "tutor" ? "student" : role;
        const tutorStatus = role === "tutor" && !isAdminEmail ? "pending" : null;

        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email,
          displayName: display,
          role: assignedRole,
          tutorStatus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        if (role === "tutor" && !isAdminEmail) {
          await setDoc(doc(db, "tutor_applications", cred.user.uid), {
            userId: cred.user.uid,
            displayName: display,
            email,
            bio,
            credentials,
            status: "pending",
            createdAt: serverTimestamp(),
          });
          toast.success("Application submitted — an admin will review it shortly.");
          navigate({ to: "/pending" });
        } else if (isAdminEmail) {
          toast.success("Admin account ready.");
          navigate({ to: "/admin" });
        } else {
          toast.success("Account created — welcome to Cortex.");
          navigate({ to: "/dashboard" });
        }
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await routeAfterSignIn(cred.user.uid, cred.user.email ?? email);
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const u = cred.user;
      const email = u.email ?? "";
      const existing = await getDoc(doc(db, "users", u.uid));
      const isAdminEmail =
        email && (await getDoc(doc(db, "admin_emails", email.toLowerCase()))).exists();

      if (!existing.exists()) {
        const assignedRole = isAdminEmail ? "admin" : role === "tutor" ? "student" : role;
        const tutorStatus = role === "tutor" && !isAdminEmail ? "pending" : null;
        await setDoc(doc(db, "users", u.uid), {
          uid: u.uid,
          email,
          displayName: u.displayName ?? email.split("@")[0],
          avatarUrl: u.photoURL ?? null,
          role: assignedRole,
          tutorStatus,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        if (role === "tutor" && !isAdminEmail) {
          await setDoc(doc(db, "tutor_applications", u.uid), {
            userId: u.uid,
            displayName: u.displayName ?? email.split("@")[0],
            email,
            bio: "",
            credentials: "",
            status: "pending",
            createdAt: serverTimestamp(),
          });
          navigate({ to: "/pending" });
          return;
        }
      }
      await routeAfterSignIn(u.uid, email);
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? "Google sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-md border border-border bg-secondary p-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{meta.title}:</span> {meta.blurb}
      </div>

      <Button
        type="button"
        onClick={handleGoogle}
        disabled={busy}
        variant="outline"
        className="w-full h-11 rounded-md"
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
          />
        </svg>
        Continue with Google
      </Button>
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or email
        <div className="h-px flex-1 bg-border" />
      </div>

      {mode === "signup" && (
        <div>
          <Label>Full name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 h-11 rounded-md"
            placeholder="Your name"
            required
          />
        </div>
      )}
      {mode === "signup" && role === "tutor" && (
        <>
          <div>
            <Label>Credentials</Label>
            <Input
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              className="mt-1.5 h-11 rounded-md"
              placeholder="e.g. MSc Physics, 5 yrs tutoring"
              required
            />
          </div>
          <div>
            <Label>Short bio</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1.5 rounded-md"
              placeholder="What you teach and how you help students"
              rows={3}
              required
            />
          </div>
          <div className="rounded-md border border-border bg-secondary p-3 text-xs text-muted-foreground">
            Tutor accounts require admin verification before you can access the Teacher Studio.
          </div>
        </>
      )}
      <div>
        <Label>Email</Label>
        <div className="relative mt-1.5">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="h-11 rounded-md pl-9"
            placeholder="you@example.com"
          />
        </div>
      </div>
      <div>
        <Label>Password</Label>
        <div className="relative mt-1.5">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={8}
            className="h-11 rounded-md pl-9"
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button type="submit" disabled={busy} className="w-full h-11 rounded-md">
        {mode === "signup" ? "Create account" : "Sign in"} <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>

      {canSignup && (
        <div className="text-center text-sm text-muted-foreground">
          {mode === "signin" ? (
            <>
              New here?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-semibold text-foreground underline underline-offset-4"
              >
                Create a {meta.title.toLowerCase()} account
              </button>
            </>
          ) : (
            <>
              Already have one?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="font-semibold text-foreground underline underline-offset-4"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      )}
      {!canSignup && (
        <div className="text-center text-xs text-muted-foreground">
          Admin sign-ups are disabled. Contact your workspace owner.
        </div>
      )}
    </form>
  );
}
