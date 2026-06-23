<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Gemini-AI-8E75B2?logo=googlegemini&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
</p>

# 🎓 Campus IO

**Learn, Prep & Place — An AI-powered student companion for Indian CS/IT engineering students.**

Campus IO is an EdTech platform that combines structured academic learning with placement preparation and AI-driven career guidance. It gives engineering students a personalized roadmap from syllabus revision to interview readiness — all in one place.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Syllabus-mapped Learning** | Semester-wise units and topics with curated YouTube videos in English & Hindi |
| **Quiz Engine** | Timed MCQs by topic and difficulty with detailed explanations for wrong answers |
| **Internship Listings** | Curated opportunities from Flipkart, Razorpay, Swiggy, Zoho and more with skill-match percentage |
| **AI Career Guidance** | Personalized 6-month domain roadmap generated from your interests, skills & grades |
| **AI Resume Builder** | Generate ATS-friendly resumes tailored to your target role using Google Gemini |
| **Mock HR Interview** | Practice interviews with an AI interviewer that gives real-time feedback |
| **Achievements & Gamification** | XP, streaks, badges, and leaderboard to keep you motivated |
| **Placement Readiness Score** | Live score based on DSA, core subjects, aptitude and mock performance |
| **Dark Mode** | Full light/dark theme support |
| **Guest Mode** | Try the platform instantly with pre-loaded demo data — no sign-up required |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS v4 |
| **Routing** | TanStack Router & TanStack Start |
| **State Management** | TanStack React Query |
| **Backend & Database** | Supabase (PostgreSQL, Auth, Row-Level Security) |
| **AI Integration** | Google Gemini API (with local fallback) |
| **Build Tool** | Vite 8 |
| **UI Components** | Radix UI + shadcn/ui |
| **Charts** | Recharts |
| **Animations** | Framer Motion |
| **Form Handling** | React Hook Form + Zod validation |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (or Bun)
- **Supabase** project (free tier works)
- **Google Gemini API key** ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/kundankrishna001/campus-io.git
cd campus-io

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_google_gemini_api_key
```

### Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
campus-io/
├── public/                    # Static assets & PWA manifest
├── src/
│   ├── components/
│   │   ├── ui/                # Reusable shadcn/ui components
│   │   ├── app-shell.tsx      # Main navigation shell
│   │   ├── theme-provider.tsx # Light/dark theme context
│   │   └── theme-toggle.tsx   # Theme switcher button
│   ├── hooks/                 # Custom React hooks
│   ├── integrations/
│   │   └── supabase/          # Supabase client & auth middleware
│   ├── lib/
│   │   ├── ai.server.ts       # Gemini API integration
│   │   ├── ai.fallback.ts     # Local fallback for AI features
│   │   ├── demo-data.ts       # Demo data for guest users
│   │   └── *.functions.ts     # Server functions (guidance, resume, etc.)
│   ├── routes/
│   │   ├── _authenticated/    # Protected pages (dashboard, quiz, etc.)
│   │   ├── index.tsx          # Landing page
│   │   └── auth.tsx           # Authentication page
│   └── styles.css             # Global theme & CSS variables
├── supabase/
│   └── migrations/            # Database migration files
└── database-export/           # CSV exports of schema & seed data
```

---

## 🗄️ Database

Campus IO uses **Supabase** with PostgreSQL. The `supabase/migrations/` folder contains all migration files to set up the required tables:

- `profiles` — User profiles with academic details
- `semesters`, `subjects`, `topics`, `units` — Syllabus structure
- `resources` — Curated learning resources (videos, articles)
- `questions`, `quiz_sessions`, `quiz_responses` — Quiz engine
- `hackathons`, `internships` — Opportunity listings
- `guidance_reports`, `resumes` — AI-generated outputs
- `hr_interview_sessions`, `hr_interview_messages` — Mock interviews
- `user_stats`, `user_skills`, `badges`, `user_badges` — Gamification

---

## 🤖 AI Features & Fallback

All AI features are powered by the **Google Gemini API**. If the API key is missing or the rate limit is reached, the platform automatically falls back to locally generated responses so the user experience is never interrupted.

---

## 🌐 Domain

**Educational Technology (EdTech) & Career Development**

The platform targets the higher education sector — specifically Indian engineering students preparing for campus placements and off-campus tech roles.

### Real-World Use Cases

- Students use the **syllabus-mapped learning** to revise semester topics with curated video lectures
- The **AI career guidance** generates a personalized 6-month roadmap based on interests and grades
- **Mock HR interviews** help students practice with AI-powered feedback before actual placements
- The **resume builder** creates ATS-friendly resumes tailored to specific roles
- **Internship listings** aggregate opportunities from top Indian tech companies with skill-match scoring

---

## 👨‍💻 Developer

**Kundan Krishna**
Computer Science & Engineering Student
Sathyabama Institute of Science and Technology, Chennai

[![GitHub](https://img.shields.io/badge/GitHub-kundankrishna001-181717?logo=github)](https://github.com/kundankrishna001)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Kundan_Krishna-0A66C2?logo=linkedin)](https://www.linkedin.com/in/kundan-krishna-1810b811a)

---

## 📄 License

This project is open source and available for educational purposes.

---

<p align="center">
  <strong>Built with ❤️ for Indian engineering students</strong>
</p>
