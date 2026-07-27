# 🧠 Cortex — AI-Powered Peer Learning & Tutoring Platform

**Cortex** is a full-stack, AI-driven academic ecosystem designed to transform how high school and university students learn, collaborate, and access tutoring. Combining the power of Google Gemini AI with a peer-to-peer study network, Cortex provides instant AI tutoring, live human tutor matching, emergency homework support, collaborative study groups, and gamified academic tracking.

---

## ✨ Key Features & Highlights

### 🤖 1. Gemini-Powered AI Study Suite (`/ai`)
* **Multi-Modal Document Processing:** Upload notes, PDFs, code snippets, problem sets, audio lectures, or diagrams directly into the study assistant.
* **Specialized AI Study Modes:**
  * **Quiz Generator:** Generates custom multiple-choice quizzes with detailed explanations for active testing.
  * **Flashcard Creator:** Automatically builds spaced-repetition flashcards from your study materials.
  * **Interactive Lecture Outline:** Synthesizes complex topics into structured 30-minute lesson plans with key learning objectives.
  * **Multi-Week Learning Roadmaps:** Generates week-by-week curriculum roadmaps for complex subjects or exams.
  * **Code Assistant:** Provides line-by-line debugging, code explanations, and refactoring tips.
  * **Socratic Homework Guide:** Guides students step-by-step with helpful prompts without giving away direct answers upfront.

---

### 👨‍🏫 2. Peer-to-Peer Tutoring & Verification (`/tutors`)
* **Verified Tutor Network:** Search and filter academic tutors by subject expertise, hourly rate, rating, and availability.
* **Instant Booking System:** Book 1-on-1 online study sessions directly through the platform.
* **Tutor Application Pipeline:** Students can apply to become verified tutors by submitting qualification proofs, subject domain details, and transcripts for admin review.

---

### 🤝 3. AI Study Buddy & Peer Matching (`/buddy`)
* **Smart Partner Discovery:** Matches students with compatible study partners based on shared courses, learning styles, target grades, and time zones.
* **Real-Time Collaboration:** Connect instantly with study partners for group prep and accountability.

---

### 🚨 4. SOS Academic Emergency Line (`/sos`)
* **On-Demand Assistance:** Post urgent help requests when stuck on an assignment, lab report, or night-before-exam preparation.
* **Live Community Responders:** Tutors and high-ranking peers receive instant alerts to provide step-by-step guidance.

---

### 👥 5. Study Groups & Community Hub (`/groups` & `/community`)
* **Subject-Specific Circles:** Create and join study groups organized by subject, course code, or interest area.
* **Discussion Forums:** Share lecture summaries, ask conceptual questions, and pool study resources.

---

### 🏆 6. Gamification & Student Progress (`/achievements` & `/leaderboard`)
* **Study Streaks & XP:** Earn experience points (XP) for completing quizzes, assisting peers, attending tutoring sessions, and maintaining daily study habits.
* **Badges & Achievements:** Unlock academic milestones and climb campus and global leaderboards.

---

### 🔐 7. Multi-Role Authentication & Security (`/auth` & `/admin`)
* **Firebase Auth Integration:** Supports standard Email/Password authentication and 1-click Google Sign-In.
* **Role-Based Access Control (RBAC):** Distinct interfaces and workflows tailored for **Students**, **Verified Tutors**, and **Platform Admins**.
* **Admin Control Center:** Comprehensive console for reviewing tutor applications, managing the authorized admin email list, monitoring platform stats, and moderating community content.

---

## 🛠️ Tech Stack

### Frontend & UI
* **Framework:** React 18 + TypeScript + Vite
* **Routing:** TanStack Router (`@tanstack/react-router`)
* **Styling & Components:** Tailwind CSS, Radix UI primitives, Lucide React Icons
* **Animations:** Framer Motion (`motion/react`)

### Backend & Cloud Architecture
* **Runtime / Server:** Node.js, Express, Vercel Serverless Functions (`/api/ai/generate.ts`)
* **AI Engine:** Google Gemini SDK (`@google/genai`) with fallback handling across `gemini-3.6-flash` models
* **Database & Auth:** Firebase Firestore (NoSQL Document Store) & Firebase Authentication

### 📦 Deployment (Vercel)
Vercel link: cortex-learn-zeta.vercel.app
admin panel: cortex-learn-zeta.vercel.app/admin (Note: Admin emails are registered in firestore database, not every email gets access even if u create a new admin account, once logged into admin panel, u can approve pending tutors requiring verification and add new admin emails to allowlist)
use the below credentials for logging into the admin account:
admin registered email: admin.cortex@gmail.com
password: cortexadmin

### 📄 License
This project is open only for the instructors to grade
 


