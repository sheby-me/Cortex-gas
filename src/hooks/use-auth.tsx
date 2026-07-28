import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "@/integrations/firebase/client";

export type AppRole = "student" | "tutor" | "admin";

export type GradeLevel = "Matric" | "Intermediate" | "Undergraduate" | "Graduate" | "Mphil" | "Phd";

export interface EducationEntry {
  id: string;
  institution: string;
  degreeOrClass: string;
  streamOrMajor?: string;
  startYear: string;
  endYear: string;
  status: "Completed" | "In Progress" | "Pursuing";
  gradeLevel?: GradeLevel;
}

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  role: AppRole;
  tutorStatus?: "pending" | "approved" | "rejected" | null;
  gradeLevel?: GradeLevel | null;
  institution?: string | null;
  semesterOrYear?: string | null;
  degreeOrStream?: string | null;
  about?: string | null;
  country?: string | null;
  timezone?: string | null;
  hoursGoal?: number;
  teach?: string[];
  learn?: string[];
  educationHistory?: EducationEntry[];
  credits?: number;
  darkMode?: boolean;
  emailNotifications?: boolean;
  showLeaderboard?: boolean;
  sosAvailable?: boolean;
  [k: string]: unknown;
};

const DEFAULT_PROFILE: UserProfile = {
  uid: "demo_user_1",
  email: "alex.student@cortex.edu",
  displayName: "Alex Morgan",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
  coverImageUrl:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop&q=80",
  role: "student",
  gradeLevel: "Undergraduate",
  institution: "Stanford University",
  semesterOrYear: "Semester 4 (2025)",
  degreeOrStream: "BS Computer Science & AI",
  about:
    "Passionate computer science undergrad exploring distributed systems, machine learning, and collaborative peer learning. Always up for study sessions!",
  country: "United States",
  timezone: "UTC-5 (EST)",
  hoursGoal: 10,
  teach: ["Python Basics", "Data Structures", "Linear Algebra"],
  learn: ["Operating Systems", "React 19", "AI Model Grounding"],
  educationHistory: [
    {
      id: "edu_1",
      institution: "Stanford University",
      degreeOrClass: "BS Computer Science",
      streamOrMajor: "Artificial Intelligence",
      startYear: "2023",
      endYear: "2027",
      status: "In Progress",
      gradeLevel: "Undergraduate",
    },
    {
      id: "edu_2",
      institution: "Lincoln High School",
      degreeOrClass: "Intermediate (FSc / A-Levels)",
      streamOrMajor: "Pre-Engineering / Science",
      startYear: "2021",
      endYear: "2023",
      status: "Completed",
      gradeLevel: "Intermediate",
    },
  ],
  credits: 120,
  darkMode: false,
  emailNotifications: true,
  showLeaderboard: true,
  sosAvailable: true,
};

export function calculateProfileCompletion(profile: Partial<UserProfile> | null) {
  if (!profile) return { percentage: 0, missingFields: ["Profile data"] };

  const checks = [
    {
      key: "displayName",
      label: "Full Name",
      done: Boolean(profile.displayName && profile.displayName.trim().length > 2),
    },
    {
      key: "avatarUrl",
      label: "Clear Face Picture",
      done: Boolean(profile.avatarUrl && profile.avatarUrl.trim().length > 5),
    },
    {
      key: "coverImageUrl",
      label: "Cover Banner Image",
      done: Boolean(profile.coverImageUrl && profile.coverImageUrl.trim().length > 5),
    },
    { key: "gradeLevel", label: "Grade / Class Level", done: Boolean(profile.gradeLevel) },
    {
      key: "institution",
      label: "School / University Name",
      done: Boolean(profile.institution && profile.institution.trim().length > 2),
    },
    {
      key: "semesterOrYear",
      label: "Semester / Year",
      done: Boolean(profile.semesterOrYear && profile.semesterOrYear.trim().length > 1),
    },
    {
      key: "degreeOrStream",
      label: "Degree / Stream",
      done: Boolean(profile.degreeOrStream && profile.degreeOrStream.trim().length > 2),
    },
    {
      key: "about",
      label: "About / Bio Summary",
      done: Boolean(profile.about && profile.about.trim().length >= 15),
    },
    {
      key: "educationHistory",
      label: "Education History",
      done: Boolean(profile.educationHistory && profile.educationHistory.length > 0),
    },
    {
      key: "topics",
      label: "Teach/Learn Topics",
      done: Boolean(
        (profile.teach && profile.teach.length > 0) || (profile.learn && profile.learn.length > 0),
      ),
    },
  ];

  const completedCount = checks.filter((c) => c.done).length;
  const percentage = Math.round((completedCount / checks.length) * 100);
  const missingFields = checks.filter((c) => !c.done).map((c) => c.label);

  return { percentage, missingFields, checks };
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile;
  role: AppRole;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: DEFAULT_PROFILE,
  role: "student",
  loading: true,
  updateProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem("cortex_user_profile");
      if (stored) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });
  const [role, setRole] = useState<AppRole>("student");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Safety fallback: ensure loading becomes false within 1.5s even if Firestore is slow or blocked
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    const unsub = onSnapshot(
      doc(db, "users", user.uid),
      (snap) => {
        clearTimeout(timer);
        const data = snap.data() as UserProfile | undefined;
        if (data) {
          const merged: UserProfile = {
            ...DEFAULT_PROFILE,
            ...data,
            uid: user.uid,
            email: user.email || data.email || DEFAULT_PROFILE.email,
            displayName: data.displayName || user.displayName || DEFAULT_PROFILE.displayName,
          };
          setProfile(merged);
          setRole((data.role as AppRole) ?? "student");
          try {
            localStorage.setItem("cortex_user_profile", JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
        setLoading(false);
      },
      (error) => {
        clearTimeout(timer);
        console.warn("Firestore user snapshot error:", error);
        setLoading(false);
      },
    );

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [user]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const newProfile: UserProfile = {
      ...profile,
      ...updates,
    };
    setProfile(newProfile);
    if (newProfile.role) {
      setRole(newProfile.role);
    }

    try {
      localStorage.setItem("cortex_user_profile", JSON.stringify(newProfile));
    } catch {
      // ignore
    }

    if (user?.uid) {
      try {
        await setDoc(doc(db, "users", user.uid), updates, { merge: true });
      } catch (err) {
        console.error("Failed updating Firestore user profile:", err);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
