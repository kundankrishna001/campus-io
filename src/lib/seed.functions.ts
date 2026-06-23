import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const seedGuestData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // 1. Update Profile
    await supabase.from("profiles").update({
      college: "Demo Institute of Technology",
      branch: "CS",
      year: 3,
      semester: 6,
      cgpa: 8.5,
      onboarded: true,
    }).eq("id", userId);

    // 2. Add Skills
    await supabase.from("user_skills").upsert([
      { user_id: userId, skill: "React", proficiency: "Intermediate" },
      { user_id: userId, skill: "TypeScript", proficiency: "Intermediate" },
      { user_id: userId, skill: "Node.js", proficiency: "Beginner" },
      { user_id: userId, skill: "Python", proficiency: "Advanced" },
    ], { onConflict: "user_id, skill" });

    // 3. Add Interests
    await supabase.from("interest_responses").upsert({
      user_id: userId,
      answers: {
        goal: "Software Engineer at a top tech company",
        interests: ["Web Development", "Machine Learning"],
      }
    });

    // 4. Add a Guidance Report
    await supabase.from("guidance_reports").insert({
      user_id: userId,
      scores: {
        "Web Dev": 85,
        "ML / AI": 70,
        "Backend": 60,
        "DevOps": 40,
        "Android": 30,
        "Cybersecurity": 20,
        "Data Engineering": 50,
        "Research": 40
      },
      recommended: "Web Dev",
      phase: 2,
      summary: "As a guest user, here is a demo guidance report. You have a solid foundation in Web Development and Python. Focus on building full-stack projects.",
      roadmap: [
        { month: 1, title: "Advanced React", focus: "State management and performance", tasks: ["Build a complex UI", "Learn Redux/Zustand", "Optimize re-renders"] },
        { month: 2, title: "Backend Basics", focus: "Node.js and Express", tasks: ["Create REST APIs", "Connect to PostgreSQL", "Implement Auth"] },
        { month: 3, title: "Full Stack", focus: "Integration", tasks: ["Connect frontend and backend", "Deploy to Vercel/Render", "Write tests"] },
        { month: 4, title: "System Design", focus: "Architecture", tasks: ["Study caching", "Learn about microservices", "Database indexing"] },
        { month: 5, title: "DSA Prep", focus: "Interviews", tasks: ["Solve 50 LeetCode mediums", "Practice Trees/Graphs", "Mock interviews"] },
        { month: 6, title: "Apply", focus: "Job Hunt", tasks: ["Update Resume", "Apply to 50 companies", "Reach out for referrals"] }
      ]
    });

    // 5. Add a Resume
    await supabase.from("resumes").insert({
      user_id: userId,
      title: "SDE Resume (Demo)",
      target_role: "Software Development Engineer",
      ai_summary: "A highly motivated engineering student with a strong foundation in computer science principles. Eager to apply academic knowledge and practical skills to solve real-world problems.",
      content: {
        fullName: "Demo Guest",
        email: "guest@demo.com",
        phone: "+91 9876543210",
        targetRole: "Software Development Engineer",
        education: [{ college: "Demo Institute of Technology", degree: "B.Tech", branch: "Computer Science", cgpa: "8.5", year: "2025" }],
        skills: ["React", "TypeScript", "Node.js", "Python"],
        projects: [{ title: "E-Commerce App", description: "Built a full-stack e-commerce platform using React and Node.js.", tech: "React, Node, MongoDB" }],
        experience: [{ role: "Frontend Intern", company: "Tech Startup", duration: "Summer 2023", description: "Developed user interfaces using React and Tailwind CSS." }],
        achievements: ["1st place in College Hackathon", "Solved 200+ LeetCode problems"]
      }
    });

    // 6. Add some User Stats (Gamification)
    await supabase.from("user_stats").upsert({
      user_id: userId,
      xp: 450,
      level: 3,
      current_streak: 5,
      longest_streak: 5,
      last_active_date: new Date().toISOString().slice(0, 10),
    });

    // 7. Check if global questions exist, if not, we can't easily seed them here without bypassing RLS or using service role.
    // But we can add a fake quiz session to show up in history
    const { data: subjects } = await supabase.from("subjects").select("id").limit(1);
    if (subjects && subjects.length > 0) {
      await supabase.from("quiz_sessions").insert({
        user_id: userId,
        subject_id: subjects[0].id,
        score: 4,
        total: 5,
        started_at: new Date(Date.now() - 86400000).toISOString(),
        finished_at: new Date(Date.now() - 86000000).toISOString(),
      });
    }

    return { success: true };
  });