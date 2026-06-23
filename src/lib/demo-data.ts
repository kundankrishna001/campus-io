export const DEMO_HACKATHONS = [
  {
    id: "demo-hack-1",
    title: "Smart India Hackathon 2026",
    organizer: "MoE, Govt of India",
    url: "https://sih.gov.in",
    prize: "₹1,00,000",
    mode: "hybrid",
    location: "Multiple Nodal Centers",
    registration_deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
    tags: ["GovTech", "Open Innovation", "Web3"],
    description: "World's biggest open innovation model to solve real-world challenges.",
    is_active: true,
  },
  {
    id: "demo-hack-2",
    title: "Google Girl Hackathon",
    organizer: "Google India",
    url: "https://buildyourfuture.withgoogle.com",
    prize: "PPI Opportunities",
    mode: "online",
    location: "Virtual",
    registration_deadline: new Date(Date.now() + 86400000 * 15).toISOString(),
    tags: ["Women In Tech", "DSA", "Development"],
    description: "A program for women students in computer science to showcase their coding skills.",
    is_active: true,
  }
];

export const DEMO_INTERNSHIPS = [
  {
    id: "demo-int-1",
    title: "SDE Intern",
    company: "Flipkart",
    stipend: "₹60,000/month",
    location: "Bengaluru",
    mode: "onsite",
    skills: ["DSA", "Java", "System Design"],
    description: "6-month SDE internship with PPO potential.",
    deadline: new Date(Date.now() + 86400000 * 30).toISOString(),
    apply_url: "https://flipkartcareers.com",
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-int-2",
    title: "Frontend Intern",
    company: "Razorpay",
    stipend: "₹40,000/month",
    location: "Remote",
    mode: "remote",
    skills: ["React", "TypeScript", "CSS"],
    description: "Build merchant dashboard components.",
    deadline: new Date(Date.now() + 86400000 * 20).toISOString(),
    apply_url: "https://razorpay.com/jobs",
    active: true,
    created_at: new Date().toISOString(),
  }
];

export const DEMO_QUESTIONS = [
  {
    id: "demo-q-1",
    prompt: "Time complexity of finding a pair with sum X in a sorted array using two pointers?",
    options: ["O(n^2)", "O(n log n)", "O(n)", "O(1)"],
    correct_idx: 2,
    explanation: "Each pointer moves at most n times so total O(n).",
    subject_id: "demo-sub-1",
    difficulty: "Medium"
  },
  {
    id: "demo-q-2",
    prompt: "Which traversal of BST gives sorted order?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    correct_idx: 1,
    explanation: "Inorder of a BST visits nodes in ascending order.",
    subject_id: "demo-sub-1",
    difficulty: "Easy"
  },
  {
    id: "demo-q-3",
    prompt: "React state updates are?",
    options: ["Synchronous", "Asynchronous", "Blocking", "None"],
    correct_idx: 1,
    explanation: "State updates are batched and asynchronous.",
    subject_id: "demo-sub-2",
    difficulty: "Easy"
  },
  {
    id: "demo-q-4",
    prompt: "Which scheduling can cause starvation?",
    options: ["FCFS", "Round Robin", "Priority", "All of these"],
    correct_idx: 2,
    explanation: "Low priority jobs may wait indefinitely.",
    subject_id: "demo-sub-3",
    difficulty: "Easy"
  },
  {
    id: "demo-q-5",
    prompt: "Method overloading is which type of polymorphism?",
    options: ["Runtime", "Compile-time", "Dynamic", "None"],
    correct_idx: 1,
    explanation: "Overloading is resolved at compile-time.",
    subject_id: "demo-sub-1",
    difficulty: "Medium"
  }
];

export const DEMO_SYLLABUS = [
  {
    id: 3,
    name: "Semester 3",
    subjects: [
      {
        id: "demo-sub-1",
        name: "Data Structures & Algorithms",
        code: "CS301",
        icon: "Network",
        units: [
          {
            id: "demo-unit-1",
            name: "Arrays & Strings",
            topics: [
              { id: "demo-topic-1", name: "Two Pointers", summary: "Classic technique for sorted array problems" },
              { id: "demo-topic-2", name: "Sliding Window", summary: "Subarray problems in O(n)" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "Semester 4",
    subjects: [
      {
        id: "demo-sub-2",
        name: "Web Development",
        code: "CS403",
        icon: "Globe",
        units: [
          {
            id: "demo-unit-2",
            name: "Frontend",
            topics: [
              { id: "demo-topic-3", name: "React Basics", summary: "Components, props, state" }
            ]
          }
        ]
      }
    ]
  }
];

export const DEMO_RESOURCES = {
  "demo-topic-1": [
    { id: "demo-res-1", topic_id: "demo-topic-1", title: "Two Pointer Technique", channel: "take U forward", language: "English", duration_min: 22, youtube_id: "jzZsG8n2R9A" },
    { id: "demo-res-2", topic_id: "demo-topic-1", title: "Two Pointer in Hindi", channel: "Apna College", language: "Hindi", duration_min: 18, youtube_id: "On03HWe2tZM" }
  ],
  "demo-topic-2": [
    { id: "demo-res-3", topic_id: "demo-topic-2", title: "Sliding Window Pattern", channel: "NeetCode", language: "English", duration_min: 26, youtube_id: "MK-NZ4hN7rs" }
  ],
  "demo-topic-3": [
    { id: "demo-res-4", topic_id: "demo-topic-3", title: "React in 100 minutes", channel: "Fireship", language: "English", duration_min: 100, youtube_id: "SqcY0GlETPk" }
  ]
};