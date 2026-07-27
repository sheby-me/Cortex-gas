import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  GraduationCap,
  Flag,
  Coins,
  Plus,
  Trash2,
  LogOut,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { formatAuthError, validateSignIn, validateSignUp } from "@/lib/auth-errors";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/integrations/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — Cortex" }, { name: "description", content: "Cortex admin console." }],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const { user, role, loading } = useAuth();
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  if (!user || role !== "admin") return <AdminLogin />;
  return <AdminPanel />;
}

function AdminLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function ensureAllowlisted(emailAddr: string) {
    const snap = await getDoc(doc(db, "admin_emails", emailAddr.toLowerCase()));
    if (!snap.exists()) throw new Error("This email is not authorized for admin access.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (mode === "signup") {
      const val = validateSignUp({ email, password, role: "admin" });
      if (!val.valid && val.error) {
        setFormError(val.error);
        toast.error(val.error);
        return;
      }
    } else {
      const val = validateSignIn(email, password);
      if (!val.valid && val.error) {
        setFormError(val.error);
        toast.error(val.error);
        return;
      }
    }

    setBusy(true);
    try {
      await ensureAllowlisted(email);
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: email.split("@")[0] });
        await setDoc(doc(db, "users", cred.user.uid), {
          uid: cred.user.uid,
          email,
          displayName: email.split("@")[0],
          role: "admin",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success("Admin account created.");
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await setDoc(
          doc(db, "users", cred.user.uid),
          { role: "admin", email, updatedAt: serverTimestamp() },
          { merge: true },
        );
      }
      navigate({ to: "/admin" });
    } catch (err: unknown) {
      const msg = formatAuthError(err);
      setFormError(msg);
      toast.error(msg);
      try {
        await fbSignOut(auth);
      } catch {
        /* ignore */
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-6 bg-secondary">
      <Card className="w-full max-w-md rounded-lg border-border p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-md bg-primary text-primary-foreground">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-tight">Admin console</h1>
            <p className="text-xs text-muted-foreground">
              Restricted access — allowlisted emails only.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="flex items-start gap-2.5 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{formError}</div>
            </div>
          )}
          <div>
            <Label>Email</Label>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
                type="email"
                required
                className="h-11 rounded-md pl-9"
                placeholder="admin@example.com"
              />
            </div>
          </div>
          <div>
            <Label className="flex items-center justify-between">
              <span>Password</span>
              {mode === "signup" && (
                <span className="text-[11px] text-muted-foreground font-normal">
                  Min. 8 characters
                </span>
              )}
            </Label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError(null);
                }}
                type="password"
                required
                className="h-11 rounded-md pl-9"
                placeholder="••••••••"
              />
            </div>
          </div>
          <Button type="submit" disabled={busy} className="w-full h-11 rounded-md">
            {mode === "signup" ? "Create admin account" : "Sign in"}{" "}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            {mode === "signin" ? (
              <>
                First time?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setFormError(null);
                  }}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  Create admin account
                </button>
              </>
            ) : (
              <>
                Already provisioned?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setFormError(null);
                  }}
                  className="font-semibold text-foreground underline underline-offset-4"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
          <div className="text-center text-[11px] text-muted-foreground">
            <Link to="/" className="underline underline-offset-4">
              Back to home
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

type TutorApp = {
  id: string;
  userId: string;
  displayName?: string | null;
  email?: string | null;
  bio: string | null;
  credentials: string | null;
  status: string;
};

function AdminPanel() {
  const navigate = useNavigate();
  const [apps, setApps] = useState<TutorApp[]>([]);
  const [admins, setAdmins] = useState<{ email: string }[]>([]);
  const [newAdmin, setNewAdmin] = useState("");

  async function loadApps() {
    const q = query(collection(db, "tutor_applications"), where("status", "==", "pending"));
    const snap = await getDocs(q);
    setApps(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Record<string, unknown>),
      })) as TutorApp[],
    );
  }
  async function loadAdmins() {
    const snap = await getDocs(query(collection(db, "admin_emails"), orderBy("createdAt", "desc")));
    setAdmins(
      snap.docs.map((d) => ({
        email: ((d.data() as Record<string, unknown>).email as string) ?? d.id,
      })),
    );
  }
  useEffect(() => {
    loadApps();
    loadAdmins();
  }, []);

  async function approve(app: TutorApp) {
    try {
      await updateDoc(doc(db, "tutor_applications", app.id), {
        status: "approved",
        reviewedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", app.userId), {
        role: "tutor",
        tutorStatus: "approved",
        updatedAt: serverTimestamp(),
      });
      toast.success("Tutor approved");
      loadApps();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? "Failed to approve");
    }
  }
  async function reject(app: TutorApp) {
    try {
      await updateDoc(doc(db, "tutor_applications", app.id), {
        status: "rejected",
        reviewedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, "users", app.userId), {
        tutorStatus: "rejected",
        updatedAt: serverTimestamp(),
      });
      toast.success("Application rejected");
      loadApps();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? "Failed to reject");
    }
  }
  async function addAdmin() {
    const email = newAdmin.trim().toLowerCase();
    if (!email) return;
    try {
      await setDoc(doc(db, "admin_emails", email), { email, createdAt: serverTimestamp() });
      setNewAdmin("");
      toast.success("Admin email added");
      loadAdmins();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? "Failed");
    }
  }
  async function removeAdmin(email: string) {
    try {
      await deleteDoc(doc(db, "admin_emails", email.toLowerCase()));
      loadAdmins();
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? "Failed");
    }
  }
  async function signOut() {
    await fbSignOut(auth);
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-6 backdrop-blur">
        <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">
          <Shield className="h-4 w-4" />
        </div>
        <div className="text-sm font-semibold tracking-tight">Cortex Admin</div>
        <div className="ml-auto">
          <Button onClick={signOut} size="sm" variant="ghost" className="rounded-md">
            <LogOut className="mr-1.5 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </header>
      <div className="p-6 md:p-8">
        <div className="mb-6">
          <h1 className="font-display text-4xl tracking-tight">Admin panel</h1>
          <p className="text-muted-foreground">Keep the ecosystem healthy.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { icon: Users, l: "Pending tutors", v: String(apps.length) },
            { icon: GraduationCap, l: "Admin emails", v: String(admins.length) },
            { icon: Coins, l: "Credits (soon)", v: "—" },
            { icon: Flag, l: "Open reports", v: "—" },
          ].map((s) => (
            <Card key={s.l} className="rounded-2xl border-border p-5 shadow-soft">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                <s.icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-2xl font-bold">{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </Card>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              Pending teacher verifications
            </h2>
            {apps.length === 0 && (
              <div className="text-sm text-muted-foreground">No pending applications.</div>
            )}
            {apps.map((a) => (
              <div key={a.id} className="rounded-xl border border-border p-3 mb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">
                      {a.displayName ?? a.email ?? a.userId.slice(0, 8)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.credentials || "No credentials provided"}
                    </div>
                    {a.bio && <div className="mt-1 text-xs text-muted-foreground">{a.bio}</div>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl"
                      onClick={() => reject(a)}
                    >
                      Reject
                    </Button>
                    <Button size="sm" className="rounded-xl" onClick={() => approve(a)}>
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Card>
          <Card className="rounded-2xl border-border p-6 shadow-soft">
            <h2 className="mb-1 text-lg font-semibold tracking-tight">Admin email allowlist</h2>
            <p className="mb-4 text-xs text-muted-foreground">
              Only accounts created with these emails can sign in as admin.
            </p>
            <div className="flex gap-2 mb-3">
              <Input
                value={newAdmin}
                onChange={(e) => setNewAdmin(e.target.value)}
                placeholder="admin@example.com"
                className="h-10 rounded-md"
              />
              <Button onClick={addAdmin} className="rounded-md">
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            {admins.length === 0 && (
              <div className="text-sm text-muted-foreground">No admin emails yet.</div>
            )}
            {admins.map((a) => (
              <div
                key={a.email}
                className="flex items-center justify-between rounded-xl border border-border p-3 mb-2"
              >
                <div className="text-sm font-medium">{a.email}</div>
                <Button size="sm" variant="ghost" onClick={() => removeAdmin(a.email)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Badge variant="outline" className="rounded-full mt-2">
              Existing user accounts get admin on next sign-in via role assignment
            </Badge>
          </Card>
        </div>
      </div>
    </div>
  );
}
