import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type KeyboardEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, X } from "lucide-react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — Cortex" },
      {
        name: "description",
        content: "Set up your Cortex profile — for learners of any subject or grade.",
      },
    ],
  }),
  component: OnboardingPage,
});

function ChipInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (!value.includes(t)) onChange([...value, t]);
    setDraft("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add();
    }
  };
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background p-2 focus-within:ring-1 focus-within:ring-ring">
        {value.map((t) => (
          <Badge key={t} variant="secondary" className="rounded-md gap-1 pr-1">
            {t}
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== t))}
              className="ml-1 rounded p-0.5 hover:bg-muted-foreground/20"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          onBlur={add}
          placeholder={value.length ? "" : placeholder}
          className="flex-1 min-w-[10ch] bg-transparent px-1 py-1 text-sm outline-none"
        />
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">
        Press Enter or comma to add. Anything goes — math, guitar, 8th-grade science, watercolor,
        business law…
      </div>
    </div>
  );
}

function OnboardingPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [institution, setInstitution] = useState("");
  const [level, setLevel] = useState("");
  const [timezone, setTimezone] = useState("");
  const [bio, setBio] = useState("");
  const [teach, setTeach] = useState<string[]>([]);
  const [learn, setLearn] = useState<string[]>([]);
  const [hours, setHours] = useState<number>(5);
  const [saving, setSaving] = useState(false);

  async function save() {
    const u = auth.currentUser;
    if (!u) {
      navigate({ to: "/auth" });
      return;
    }
    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", u.uid),
        {
          displayName: name || u.displayName || u.email?.split("@")[0],
          country,
          institution,
          level,
          timezone,
          bio,
          teach,
          learn,
          hoursGoal: hours,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      navigate({ to: "/dashboard" });
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-display text-sm font-bold">
            C
          </div>
          <span className="text-lg font-display font-semibold tracking-tight">Cortex</span>
        </Link>
        <div className="mt-8">
          <Badge variant="secondary" className="rounded-md bg-background">
            Step 1 of 3
          </Badge>
          <h1 className="mt-3 font-display text-5xl font-medium tracking-tight">
            Tell us about you.
          </h1>
          <p className="mt-2 text-muted-foreground">
            Cortex is for learners of any subject, any grade — from an 8th grader to a PhD.
          </p>
          <Progress value={33} className="mt-4 h-1.5" />
        </div>
        <Card className="mt-6 rounded-lg border-border p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 rounded-md"
                placeholder="Your name"
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1.5 rounded-md"
                placeholder="Where you're based"
              />
            </div>
            <div>
              <Label>School / Institution</Label>
              <Input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="mt-1.5 rounded-md"
                placeholder="School, college, workplace — or self-taught"
              />
            </div>
            <div>
              <Label>Grade / Level</Label>
              <Input
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-1.5 rounded-md"
                placeholder="e.g. Grade 8, Undergrad Y2, Working pro"
              />
            </div>
            <div>
              <Label>Timezone</Label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="mt-1.5 rounded-md"
                placeholder="e.g. GMT+1, EST, JST"
              />
            </div>
            <div>
              <Label>Weekly study hours goal</Label>
              <Input
                type="number"
                min={1}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="mt-1.5 rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Short bio</Label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1.5 rounded-md"
                placeholder="What are you working on or learning?"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ChipInput
              label="Subjects I can teach"
              placeholder="Add a subject and press Enter"
              value={teach}
              onChange={setTeach}
            />
            <ChipInput
              label="Topics I want to learn"
              placeholder="Add a topic and press Enter"
              value={learn}
              onChange={setLearn}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              You start with <b className="text-foreground">100 credits</b> to spend on help.
            </div>
            <Button onClick={save} disabled={saving} className="rounded-md">
              Continue
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
