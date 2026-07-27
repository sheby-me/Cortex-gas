import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

export type AppRole = "student" | "tutor" | "admin";

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  role: AppRole;
  tutorStatus?: "pending" | "approved" | "rejected" | null;
  [k: string]: unknown;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      const data = snap.data() as UserProfile | undefined;
      if (data) {
        setProfile({ ...data, uid: user.uid });
        setRole((data.role as AppRole) ?? "student");
      }
    });
    return () => unsub();
  }, [user]);

  return { user, profile, role, loading };
}
