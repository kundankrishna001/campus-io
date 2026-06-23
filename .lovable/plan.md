
## Scope (MVP only)

1. **Auth & Profile** — Email + Google sign-in (phone OTP deferred). Profile: name, college, branch (CS/IT), year, semester, CGPA, skills + proficiency.
2. **Academic Learning** — Syllabus tree (Semester → Subject → Unit → Topic). Each topic lists YouTube resources with language filter. Per-user progress (not_started / in_progress / completed).
3. **Quiz Engine** — MCQs by topic + difficulty, timed sessions, auto-grading, explanations, history, weak-topic detection.
4. **Internships (manual)** — Admin-seeded listings; bookmark + status tracking (applied/interview/selected/rejected); skill-match % from profile.
5. **Performance Dashboard** — Charts (Recharts) for weekly progress, strong/weak subjects, placement readiness score, internship match.
6. **Career Guidance (basic)** — Onboarding interest questionnaire → Claude generates domain match report (ML/Web/Backend/DevOps/Android/Cybersec/Data/Research), domain scores, recommended domain, 6-month roadmap. Manual refresh button.
7. **App shell** — Mobile-first bottom nav + sidebar on desktop, dark theme, PWA manifest + icons.
8. **Seed data** — 2 semesters of CS syllabus, ~50 quiz questions, ~10 internship listings to make the app feel real.

Deferred (per your answer): scraper, community, resume, gamification, offline, regional languages, mock HR, hackathons, certifications, notifications.

## Tech mapping

- **Frontend**: TanStack Start (React 19) + Tailwind v4 + TanStack Query + shadcn/ui + Recharts + Framer Motion.
- **Backend**: Lovable Cloud (Postgres + RLS + Auth + Storage + server functions). No separate Express server.
- **AI**: Anthropic Claude via your `ANTHROPIC_API_KEY` (you'll paste it in a secure dialog). Server-side only.
- **YouTube**: I'll store curated YouTube IDs per topic in the DB rather than calling the Data API live (no key needed; faster, cheaper, deterministic). We can swap to live YouTube Data API later if you want.

## Design

Energetic Modern — deep slate `#0F172A` base, blue `#3B82F6` primary, orange `#FB923C` accent, cream `#FEF3C7` highlight. Plus Jakarta Sans (display) + Inter (body). Subtle gradient cards, glowing primary buttons, soft motion on cards. Rupee symbol, Indian college/company examples in seed data.

## Data model (Cloud / Postgres)

```text
profiles(id, full_name, college, branch, year, semester, cgpa, onboarded)
user_skills(user_id, skill, proficiency)
semesters → subjects → units → topics
resources(topic_id, kind=youtube, youtube_id, title, language, channel)
topic_progress(user_id, topic_id, status, updated_at)
questions(id, topic_id, difficulty, prompt, options[], correct_idx, explanation)
quiz_sessions(id, user_id, started_at, finished_at, score, total)
quiz_responses(session_id, question_id, chosen_idx, is_correct)
internships(id, title, company, stipend, location, mode, skills[], deadline, apply_url, verified)
student_internships(user_id, internship_id, status, bookmarked)
guidance_reports(id, user_id, created_at, scores jsonb, recommended, phase, roadmap jsonb, summary)
interest_responses(user_id, answers jsonb)
```

All tables have RLS scoped to `auth.uid()`. Public catalog tables (syllabus, questions, internships) get `TO authenticated` SELECT.

## Server functions

- `getDashboard` — aggregate progress, readiness, match counts.
- `submitQuiz` — grade + persist + update weak-topic stats.
- `getInternshipsWithMatch` — joins listings with user skills.
- `generateGuidanceReport` — calls Claude with profile + interests → structured JSON → saves.
- `bookmarkInternship`, `setApplicationStatus`, `updateTopicProgress`, etc.

## Out of scope today

Phone OTP (MSG91), Puppeteer scraper, Resend digests, Upstash cache, Cloudflare R2, regional UI translation, leaderboard, offline service worker. All can be layered after MVP.

## Order of execution

1. Enable Lovable Cloud + request `ANTHROPIC_API_KEY`.
2. Design system + app shell + bottom nav + theme.
3. DB migration (all tables, RLS, seed syllabus + questions + internships).
4. Auth pages + profile onboarding + interest questionnaire.
5. Syllabus browser + topic page + progress.
6. Quiz player + history.
7. Internships list + detail + status tracking.
8. Dashboard with charts.
9. Guidance report (Claude server fn) + history view.
10. PWA manifest + icons + polish.

Approve and I'll start.
