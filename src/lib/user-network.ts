export interface NetworkUser {
  uid: string;
  username: string; // clean handle without @, e.g. "alex_morgan"
  displayName: string;
  role: "student" | "tutor" | "admin";
  avatarUrl: string;
  institution?: string;
  gradeLevel?: string;
  degreeOrStream?: string;
  about?: string;
  teach?: string[];
  learn?: string[];
  online?: boolean;
  rating?: number;
  sessions?: number;
  match?: number;
}

export const INITIAL_NETWORK_USERS: NetworkUser[] = [
  {
    uid: "demo_user_1",
    username: "alex_morgan",
    displayName: "Alex Morgan",
    role: "student",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80",
    institution: "Stanford University",
    gradeLevel: "Undergraduate",
    degreeOrStream: "BS Computer Science & AI",
    about: "Passionate CS student building distributed systems and machine learning models.",
    teach: ["Python Basics", "Data Structures", "Linear Algebra"],
    learn: ["Operating Systems", "React 19", "AI Model Grounding"],
    online: true,
  },
  {
    uid: "t1",
    username: "dr_sana",
    displayName: "Dr. Sana Rehman",
    role: "tutor",
    avatarUrl: "https://i.pravatar.cc/150?img=47",
    institution: "Stanford University",
    degreeOrStream: "PhD Machine Learning",
    about: "Research Scientist & AI Mentor specializing in Deep Learning and Transformers.",
    teach: ["Deep Learning", "PyTorch", "Transformers", "Machine Learning"],
    learn: ["Quantum Computing"],
    rating: 4.9,
    sessions: 214,
    online: true,
  },
  {
    uid: "t2",
    username: "ken_watanabe",
    displayName: "Ken Watanabe",
    role: "tutor",
    avatarUrl: "https://i.pravatar.cc/150?img=15",
    institution: "University of Tokyo",
    degreeOrStream: "MS Systems Engineering",
    about:
      "Kernel developer and operating systems enthusiast. Happy to help with concurrency & deadlocks.",
    teach: ["Operating Systems", "Deadlocks", "Kernel", "Concurrency", "C/C++"],
    rating: 4.8,
    sessions: 189,
    online: false,
  },
  {
    uid: "t3",
    username: "maria_alvarez",
    displayName: "Maria Alvarez",
    role: "tutor",
    avatarUrl: "https://i.pravatar.cc/150?img=45",
    institution: "MIT",
    degreeOrStream: "BS Computer Science",
    about: "Top-rated algorithms tutor & competitive programmer.",
    teach: ["Data Structures", "Graphs", "Dynamic Programming", "Interview Prep"],
    rating: 5.0,
    sessions: 302,
    online: true,
  },
  {
    uid: "t4",
    username: "ibrahim_diallo",
    displayName: "Ibrahim Diallo",
    role: "tutor",
    avatarUrl: "https://i.pravatar.cc/150?img=68",
    institution: "ETH Zürich",
    degreeOrStream: "MS Applied Mathematics",
    about: "Specialized in Linear Algebra, Vector Calculus, and numerical optimization.",
    teach: ["Linear Algebra", "Eigenvectors", "SVD", "Calculus"],
    rating: 4.7,
    sessions: 121,
    online: true,
  },
  {
    uid: "t5",
    username: "priya_nair",
    displayName: "Priya Nair",
    role: "tutor",
    avatarUrl: "https://i.pravatar.cc/150?img=32",
    institution: "IIT Madras",
    degreeOrStream: "BS Database Systems",
    about: "Database architect teaching SQL, indexing, distributed storage, and sharding.",
    teach: ["Databases", "SQL", "Indexing", "Sharding", "PostgreSQL"],
    rating: 4.9,
    sessions: 176,
    online: false,
  },
  {
    uid: "t6",
    username: "lucas_meier",
    displayName: "Lucas Meier",
    role: "tutor",
    avatarUrl: "https://i.pravatar.cc/150?img=59",
    institution: "TU Munich",
    degreeOrStream: "MS Informatics",
    about: "Passionate about greedy algorithms, graph theory, and algorithmic complexity.",
    teach: ["Algorithms", "Greedy Algorithms", "Dynamic Programming"],
    rating: 4.8,
    sessions: 143,
    online: true,
  },
  {
    uid: "b1",
    username: "aditi_sharma",
    displayName: "Aditi Sharma",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=25",
    institution: "IIT Delhi",
    gradeLevel: "Undergraduate",
    degreeOrStream: "BS Computer Science",
    about: "Preparing for Data Structures midterms & grinding LC problems together.",
    learn: ["Data Structures", "Dynamic Programming"],
    teach: ["C++", "Array Manipulation"],
    match: 94,
    online: true,
  },
  {
    uid: "b2",
    username: "chen_wei",
    displayName: "Chen Wei",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    institution: "Tsinghua University",
    gradeLevel: "Undergraduate",
    degreeOrStream: "BS Artificial Intelligence",
    about: "Building ML models & practicing Python daily.",
    learn: ["Machine Learning", "Neural Networks"],
    teach: ["Python", "Pandas"],
    match: 88,
    online: true,
  },
  {
    uid: "b3",
    username: "fatima_zahra",
    displayName: "Fatima Zahra",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=44",
    institution: "Cairo University",
    gradeLevel: "Undergraduate",
    degreeOrStream: "BA English & Linguistics",
    about: "IELTS preparation study buddy looking for daily speaking practice.",
    learn: ["IELTS Speaking", "Academic Writing"],
    teach: ["Arabic", "Grammar"],
    match: 82,
    online: false,
  },
  {
    uid: "b4",
    username: "diego_ramos",
    displayName: "Diego Ramos",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=57",
    institution: "UNAM",
    gradeLevel: "Undergraduate",
    degreeOrStream: "BS Software Engineering",
    about: "Full-stack web developer building apps with React, Tailwind, and Node.js.",
    learn: ["Next.js", "TypeScript"],
    teach: ["React", "JavaScript"],
    match: 79,
    online: true,
  },
  {
    uid: "s1",
    username: "nia_k",
    displayName: "Nia K.",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=20",
    institution: "Columbia University",
    degreeOrStream: "BS Computer Engineering",
    about: "Focusing on Systems Programming and Operating Systems.",
    learn: ["Operating Systems", "Deadlocks"],
    online: true,
  },
  {
    uid: "s2",
    username: "rahul_s",
    displayName: "Rahul S.",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    institution: "UC Berkeley",
    degreeOrStream: "BS EECS",
    about: "Studying Computer Networks, TCP/IP, and Socket Programming.",
    learn: ["Computer Networks", "DNS Protocols"],
    online: true,
  },
  {
    uid: "s3",
    username: "sara_m",
    displayName: "Sara M.",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=48",
    institution: "NYU",
    degreeOrStream: "BS Data Science",
    about: "Machine learning enthusiast diving deep into SVMs and supervised learning.",
    learn: ["Machine Learning", "SVMs"],
    online: false,
  },
  {
    uid: "p1_author",
    username: "elena_rossi",
    displayName: "Elena Rossi",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=41",
    institution: "University of Bologna",
    degreeOrStream: "BS Computer Science",
    about: "Visualizing graph algorithms & sharing study notes with peers.",
    learn: ["Algorithms", "A* Search"],
    online: true,
  },
  {
    uid: "p2_author",
    username: "james_park",
    displayName: "James Park",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=12",
    institution: "KAIST",
    degreeOrStream: "BS AI Engineering",
    about: "Investigating Transformer architectures and attention mechanisms.",
    learn: ["Transformers", "PyTorch"],
    online: true,
  },
  {
    uid: "p3_author",
    username: "ana_beatriz",
    displayName: "Ana Beatriz",
    role: "student",
    avatarUrl: "https://i.pravatar.cc/150?img=36",
    institution: "University of São Paulo",
    degreeOrStream: "BS Information Systems",
    about: "Database systems fan sharing indexing notes and SQL guides.",
    learn: ["Database Indexing", "PostgreSQL"],
    online: true,
  },
];

const STORAGE_KEY_NETWORK = "cortex_user_network_directory";

/** Clean raw username string into normalized lowercase alphanumeric handle */
export function cleanHandle(input: string): string {
  if (!input) return "";
  return input
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9_]/g, "");
}

/** Validate username format */
export function isValidHandle(handle: string): { valid: boolean; reason?: string } {
  const clean = cleanHandle(handle);
  if (!clean) {
    return { valid: false, reason: "Username cannot be empty." };
  }
  if (clean.length < 3) {
    return { valid: false, reason: "Username must be at least 3 characters." };
  }
  if (clean.length > 20) {
    return { valid: false, reason: "Username cannot exceed 20 characters." };
  }
  if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
    return { valid: false, reason: "Only lowercase letters, numbers, and underscores allowed." };
  }
  return { valid: true };
}

/** Retrieve all users in the network directory (seed + stored) */
export function getAllNetworkUsers(): NetworkUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NETWORK);
    if (raw) {
      const customUsers: NetworkUser[] = JSON.parse(raw);
      // Merge custom users over initial network
      const map = new Map<string, NetworkUser>();
      INITIAL_NETWORK_USERS.forEach((u) => map.set(u.uid, u));
      customUsers.forEach((u) => map.set(u.uid, u));
      return Array.from(map.values());
    }
  } catch {
    // fallback
  }
  return INITIAL_NETWORK_USERS;
}

/** Check if handle is already taken by another user */
export function isUsernameTaken(handle: string, excludeUid?: string): boolean {
  const target = cleanHandle(handle);
  if (!target) return false;
  const users = getAllNetworkUsers();
  return users.some(
    (u) => cleanHandle(u.username) === target && (!excludeUid || u.uid !== excludeUid),
  );
}

/** Register or update a user profile in network storage */
export function registerOrUpdateNetworkUser(user: Partial<NetworkUser> & { uid: string }): void {
  const users = getAllNetworkUsers();
  const index = users.findIndex((u) => u.uid === user.uid);

  let updatedUser: NetworkUser;
  if (index >= 0) {
    updatedUser = {
      ...users[index],
      ...user,
      username: user.username ? cleanHandle(user.username) : users[index].username,
    };
    users[index] = updatedUser;
  } else {
    updatedUser = {
      uid: user.uid,
      username: user.username ? cleanHandle(user.username) : `user_${user.uid.slice(0, 6)}`,
      displayName: user.displayName || "Cortex Learner",
      role: user.role || "student",
      avatarUrl: user.avatarUrl || "https://i.pravatar.cc/150?img=33",
      institution: user.institution || "Cortex Network",
      ...user,
    };
    users.push(updatedUser);
  }

  try {
    localStorage.setItem(STORAGE_KEY_NETWORK, JSON.stringify(users));
  } catch {
    // ignore storage errors
  }
}

/** Search users in network by handle, name, role, institution or topic */
export function searchNetworkUsers(query: string, excludeUid?: string): NetworkUser[] {
  const users = getAllNetworkUsers();
  const q = query.trim().toLowerCase().replace(/^@+/, "");

  if (!q) {
    return users.filter((u) => !excludeUid || u.uid !== excludeUid);
  }

  return users.filter((u) => {
    if (excludeUid && u.uid === excludeUid) return false;

    const handleMatch = cleanHandle(u.username).includes(q);
    const nameMatch = u.displayName.toLowerCase().includes(q);
    const instMatch = u.institution?.toLowerCase().includes(q) || false;
    const degreeMatch = u.degreeOrStream?.toLowerCase().includes(q) || false;
    const roleMatch = u.role.toLowerCase().includes(q);
    const teachMatch = u.teach?.some((t) => t.toLowerCase().includes(q)) || false;
    const learnMatch = u.learn?.some((l) => l.toLowerCase().includes(q)) || false;

    return (
      handleMatch || nameMatch || instMatch || degreeMatch || roleMatch || teachMatch || learnMatch
    );
  });
}

/** Find network user by username handle */
export function getUserByUsername(handle: string): NetworkUser | undefined {
  const target = cleanHandle(handle);
  if (!target) return undefined;
  return getAllNetworkUsers().find((u) => cleanHandle(u.username) === target);
}

/** Find network user by UID */
export function getUserByUid(uid: string): NetworkUser | undefined {
  return getAllNetworkUsers().find((u) => u.uid === uid);
}
