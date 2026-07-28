import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  User,
  GraduationCap,
  ShieldCheck,
  Bell,
  Moon,
  Trash2,
  Lock,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useAuth, type GradeLevel } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Cortex" },
      {
        name: "description",
        content: "Account, grade level, notifications and security settings.",
      },
    ],
  }),
  component: SettingsPage,
});

export function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const { isDark, setTheme } = useTheme();

  // Form State
  const [name, setName] = useState(profile.displayName || "");
  const [email, setEmail] = useState(profile.email || "");
  const [grade, setGrade] = useState<GradeLevel>(
    (profile.gradeLevel as GradeLevel) || "Undergraduate",
  );
  const [institution, setInstitution] = useState(profile.institution || "");
  const [semester, setSemester] = useState(profile.semesterOrYear || "");
  const [degree, setDegree] = useState(profile.degreeOrStream || "");
  const [country, setCountry] = useState(profile.country || "United States");
  const [timezone, setTimezone] = useState(profile.timezone || "UTC-5 (EST)");
  const [bio, setBio] = useState(profile.about || "");

  // Preference Switches State
  const [darkMode, setDarkMode] = useState(isDark);
  const [emailNotifs, setEmailNotifs] = useState(profile.emailNotifications !== false);
  const [showLeaderboard, setShowLeaderboard] = useState(profile.showLeaderboard !== false);
  const [sosAvailable, setSosAvailable] = useState(profile.sosAvailable !== false);

  // Security Dialogs
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    setName(profile.displayName || "");
    setEmail(profile.email || "");
    setGrade((profile.gradeLevel as GradeLevel) || "Undergraduate");
    setInstitution(profile.institution || "");
    setSemester(profile.semesterOrYear || "");
    setDegree(profile.degreeOrStream || "");
    setCountry(profile.country || "United States");
    setTimezone(profile.timezone || "UTC-5 (EST)");
    setBio(profile.about || "");
    setDarkMode(Boolean(profile.darkMode));
    setEmailNotifs(profile.emailNotifications !== false);
    setShowLeaderboard(profile.showLeaderboard !== false);
    setSosAvailable(profile.sosAvailable !== false);
  }, [profile]);

  const handleSaveChanges = async () => {
    await updateProfile({
      displayName: name,
      email,
      gradeLevel: grade,
      institution,
      semesterOrYear: semester,
      degreeOrStream: degree,
      country,
      timezone,
      about: bio,
      darkMode,
      emailNotifications: emailNotifs,
      showLeaderboard,
      sosAvailable,
    });
    toast.success("Settings saved successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsPasswordModalOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated successfully!");
  };

  const handleResetData = () => {
    localStorage.removeItem("cortex_user_profile");
    toast.info("Local settings reset to default!");
    setIsResetModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
            Account Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your student profile, academic level, preferences, and privacy.
          </p>
        </div>

        <Button
          onClick={handleSaveChanges}
          className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 px-5"
        >
          <Save className="mr-1.5 h-4 w-4" /> Save Changes
        </Button>
      </div>

      {/* Profile & Academic Info */}
      <Card className="rounded-3xl border-border p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-3">
          <User className="h-5 w-5 text-primary" />
          Student Account & Credentials
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-xs font-semibold">Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Email Address *</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Grade / Academic Level *</Label>
            <Select value={grade} onValueChange={(v) => setGrade(v as GradeLevel)}>
              <SelectTrigger className="mt-1.5 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Matric">Matric (High School 8th-10th)</SelectItem>
                <SelectItem value="Intermediate">Intermediate (FSc / A-Levels)</SelectItem>
                <SelectItem value="Undergraduate">Undergraduate (Bachelor's)</SelectItem>
                <SelectItem value="Graduate">Graduate (Master's)</SelectItem>
                <SelectItem value="Mphil">Mphil (Post-Graduate)</SelectItem>
                <SelectItem value="Phd">Phd (Doctoral / Research)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              AI assistant will tailor its responses and problem depth to your selected grade.
            </p>
          </div>

          <div>
            <Label className="text-xs font-semibold">Institution / University *</Label>
            <Input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Stanford University"
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Semester / Class Year *</Label>
            <Input
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              placeholder="e.g. Semester 4 (2025)"
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Degree OR Science/Arts Stream *</Label>
            <Input
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g. BS Computer Science OR Science Stream"
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Country</Label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="mt-1.5 rounded-xl">
                <SelectValue placeholder="Select Timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC+5 (PST, Pakistan Standard Time)">
                  UTC+5 (PST, Pakistan Standard Time)
                </SelectItem>
                <SelectItem value="UTC-5 (EST)">UTC-5 (EST, Eastern Standard Time)</SelectItem>
                <SelectItem value="UTC-8 (PST)">UTC-8 (PST, Pacific Standard Time)</SelectItem>
                <SelectItem value="UTC+0 (GMT)">UTC+0 (GMT, Greenwich Mean Time)</SelectItem>
                <SelectItem value="UTC+1 (CET)">UTC+1 (CET, Central European Time)</SelectItem>
                <SelectItem value="UTC+5:30 (IST)">UTC+5:30 (IST, Indian Standard Time)</SelectItem>
                <SelectItem value="UTC+8 (SGT)">UTC+8 (SGT, Singapore Time)</SelectItem>
                <SelectItem value="UTC+9 (JST)">UTC+9 (JST, Japan Standard Time)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Label className="text-xs font-semibold">Bio / Learning Goals</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="mt-1.5 rounded-xl"
            />
          </div>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card className="rounded-3xl border-border p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-3">
          <Bell className="h-5 w-5 text-primary" />
          App Preferences & Visibility
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Dark Mode</div>
              <div className="text-xs text-muted-foreground">
                Switch to dark visual canvas theme.
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={(checked) => {
                setDarkMode(checked);
                setTheme(checked ? "dark" : "light");
              }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Email Notifications</div>
              <div className="text-xs text-muted-foreground">
                Receive study buddy invites, session bookings, and credit alerts.
              </div>
            </div>
            <Switch checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Show Me On Leaderboards</div>
              <div className="text-xs text-muted-foreground">
                Display your study streak and teaching hours on global leaderboards.
              </div>
            </div>
            <Switch checked={showLeaderboard} onCheckedChange={setShowLeaderboard} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">Available for SOS Help</div>
              <div className="text-xs text-muted-foreground">
                Allow nearby peers to send emergency study help requests to you.
              </div>
            </div>
            <Switch checked={sosAvailable} onCheckedChange={setSosAvailable} />
          </div>
        </div>
      </Card>

      {/* Security & Danger Zone */}
      <Card className="rounded-3xl border-border p-6 shadow-soft space-y-4">
        <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Security & Account Control
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="font-medium text-sm">Account Password</div>
            <div className="text-xs text-muted-foreground">
              Update your account password or security key.
            </div>
          </div>
          <Button
            onClick={() => setIsPasswordModalOpen(true)}
            variant="outline"
            className="rounded-xl"
          >
            <Lock className="mr-1.5 h-4 w-4" /> Change Password
          </Button>
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <div className="font-medium text-sm text-destructive">Danger Zone</div>
            <div className="text-xs text-muted-foreground">
              Reset local profile data or clear browser cache.
            </div>
          </div>
          <Button
            onClick={() => setIsResetModalOpen(true)}
            variant="destructive"
            className="rounded-xl"
          >
            <Trash2 className="mr-1.5 h-4 w-4" /> Reset Local Data
          </Button>
        </div>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Change Account Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new secure password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdatePassword} className="space-y-3 py-2">
            <div>
              <Label className="text-xs font-semibold">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-xl mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-xl mt-1"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-xl mt-1"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant"
              >
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Data Confirmation */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle>Reset Local Account Data?</DialogTitle>
            <DialogDescription>
              This will clear your local cached profile state and restore default values.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              onClick={() => setIsResetModalOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button onClick={handleResetData} variant="destructive" className="rounded-xl">
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
