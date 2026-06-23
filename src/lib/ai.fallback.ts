export function getFallbackResponse(messages: { role: "system" | "user" | "assistant"; content: string }[]): string {
  const lastMessage = messages[messages.length - 1]?.content || "";
  const systemMessage = messages.find(m => m.role === "system")?.content || "";

  // 1. Resume Generation Fallback
  if (lastMessage.includes("You are an expert resume writer")) {
    let studentData: any = {};
    try {
      const studentJsonStr = lastMessage.split("STUDENT:\n")[1];
      if (studentJsonStr) {
        studentData = JSON.parse(studentJsonStr);
      }
    } catch (e) {}

    const name = studentData.fullName || "Engineering Student";
    const targetRole = studentData.targetRole || "Software Engineer";
    const skills = studentData.skills || ["JavaScript", "React", "Node.js", "Python"];

    return JSON.stringify({
      summary: `A highly motivated and detail-oriented engineering student targeting ${targetRole} roles. Eager to apply academic knowledge and practical skills to solve real-world problems and contribute to a dynamic tech team.`,
      projects: studentData.projects?.map((p: any) => ({
        title: p.title || "Project",
        bullets: [
          p.description || "Developed key features and functionality.",
          "Implemented secure and scalable solutions.",
          "Optimized performance and improved user experience."
        ]
      })) || [
        {
          title: "E-Commerce Web Application",
          bullets: [
            "Developed a full-stack e-commerce platform.",
            "Implemented secure user authentication.",
            "Optimized database queries."
          ]
        }
      ],
      experience: studentData.experience?.map((e: any) => ({
        role: e.role || "Intern",
        company: e.company || "Tech Company",
        duration: e.duration || "Summer 2023",
        bullets: [
          e.description || "Collaborated with team members to deliver project goals.",
          "Participated in daily stand-ups and agile processes.",
          "Ensured high code quality through testing."
        ]
      })) || [],
      skillCategories: {
        "Core Skills": skills,
        "Tools & Frameworks": ["Git", "VS Code", "Docker"],
        "Concepts": ["Data Structures", "Algorithms", "OOP"]
      }
    });
  }

  // 2. Guidance Report Fallback
  if (lastMessage.includes("You are an expert career mentor")) {
    let name = "Student";
    let cgpa = "8.0";
    let recommended = "Web Dev";
    
    try {
      const nameMatch = lastMessage.match(/- Name: (.*)/);
      if (nameMatch && nameMatch[1] && nameMatch[1] !== "—") name = nameMatch[1].trim();
      
      const cgpaMatch = lastMessage.match(/CGPA: (.*)\/10/);
      if (cgpaMatch && cgpaMatch[1] && cgpaMatch[1] !== "—") cgpa = cgpaMatch[1].trim();
      
      const interestsMatch = lastMessage.match(/- Stated interests: \[(.*)\]/);
      if (interestsMatch && interestsMatch[1]) {
        const interests = interestsMatch[1].split(',').map((i: string) => i.replace(/"/g, '').trim());
        if (interests.length > 0 && interests[0]) {
          recommended = interests[0];
        }
      }
    } catch (e) {}

    return JSON.stringify({
      scores: {
        "Web Dev": 85,
        "ML / AI": 60,
        "Backend": 75,
        "DevOps": 50,
        "Android": 40,
        "Cybersecurity": 45,
        "Data Engineering": 55,
        "Research": 30
      },
      recommended: recommended,
      phase: 2,
      summary: `Hi ${name}, you have a solid foundation and a great CGPA of ${cgpa}. Your interest in ${recommended} makes it an excellent primary focus for your career.`,
      roadmap: [
        {
          month: 1,
          title: `Advanced ${recommended} Concepts`,
          focus: "Mastering core technologies",
          tasks: [
            "Complete advanced courses on your target domain.",
            "Build a complex project from scratch.",
            "Solve 10 domain-specific LeetCode problems.",
            "Read up on best practices."
          ]
        },
        {
          month: 2,
          title: "Backend Fundamentals",
          focus: "Node.js and API Design",
          tasks: [
            "Build a RESTful API using Express and PostgreSQL.",
            "Implement JWT-based authentication.",
            "Learn about API rate limiting and security best practices.",
            "Deploy your API to Render or Heroku."
          ]
        },
        {
          month: 3,
          title: "Full-Stack Integration",
          focus: "Connecting frontend and backend",
          tasks: [
            "Integrate your frontend with your backend.",
            "Implement real-time features.",
            "Set up CI/CD pipelines.",
            "Write comprehensive tests."
          ]
        },
        {
          month: 4,
          title: "System Design & Architecture",
          focus: "Scalability and Performance",
          tasks: [
            "Study system design concepts (caching, load balancing).",
            "Read 'Designing Data-Intensive Applications'.",
            "Practice system design mock interviews.",
            "Optimize your app for performance."
          ]
        },
        {
          month: 5,
          title: "Interview Preparation",
          focus: "DSA and Core CS Subjects",
          tasks: [
            "Solve 50 medium/hard LeetCode problems.",
            "Review OS, DBMS, and Computer Networks concepts.",
            "Participate in weekly coding contests.",
            "Do 3 mock technical interviews."
          ]
        },
        {
          month: 6,
          title: "Portfolio & Applications",
          focus: "Showcasing work and applying",
          tasks: [
            "Polish your resume and GitHub profile.",
            "Deploy your best 2 projects with custom domains.",
            "Start applying to target companies.",
            "Reach out to alumni for referrals."
          ]
        }
      ]
    });
  }

  // 3. Interview Fallbacks
  if (systemMessage.includes("You are an experienced HR interviewer")) {
    if (lastMessage.includes("Begin the interview with your first question")) {
      return "Hello! Thanks for taking the time to speak with me today. To start off, could you please introduce yourself and tell me a bit about your background?";
    }
    
    // Check if it's the 6th question/end of interview
    const userMessageCount = messages.filter(m => m.role === "user").length;
    if (userMessageCount >= 6) {
      return "Thanks, that's all from my side. You can end the interview now to get feedback.";
    }

    // Generic fallback questions
    const fallbackQuestions = [
      "That's interesting. Can you tell me about a time you faced a significant challenge in a project and how you overcame it?",
      "I see. What would you say is your greatest professional strength, and how has it helped you in your academic or project work?",
      "Could you describe a situation where you had a disagreement with a team member? How did you handle it?",
      "Where do you see yourself in the next 3 to 5 years, and how does this role align with your goals?",
      "Tell me about a time you had to learn a new technology or concept very quickly. How did you approach it?"
    ];
    
    return fallbackQuestions[(userMessageCount - 1) % fallbackQuestions.length];
  }

  if (lastMessage.includes("You evaluated this HR interview")) {
    return JSON.stringify({
      score: 7,
      strengths: [
        "Clear and confident communication style.",
        "Good ability to articulate past project experiences.",
        "Demonstrated a positive and collaborative attitude."
      ],
      improvements: [
        "Could provide more specific, quantifiable metrics when discussing achievements.",
        "Some answers were a bit lengthy; try to use the STAR method more strictly to stay concise.",
        "Make sure to explicitly connect your skills back to the specific requirements of the role."
      ],
      verdict: "A solid performance overall. The candidate communicates well but needs to focus on structuring answers more tightly and highlighting concrete impact.",
      perQuestion: [
        {
          question: "Introduction",
          feedback: "Good overview, but try to highlight 1-2 key technical achievements right away."
        },
        {
          question: "Challenge/Conflict",
          feedback: "You explained the situation well, but focus more on the specific actions YOU took to resolve it."
        }
      ]
    });
  }

  // Default generic fallback
  return "I'm currently running in offline mode as the AI API limit was reached. This is a fallback response.";
}