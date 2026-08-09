import type { Course } from "./courses";

export const aiProductivityCourse: Course = {
  slug: "ai-productivity-masterclass",
  code: "AI-PROD-100",
  title: "AI Productivity Masterclass",
  category: "Business",
  label: "New masterclass",
  priceAud: 100,
  priceLabel: "$100",
  duration: "8 modules + bonus module",
  description:
    "A practical, hands-on masterclass for using AI to write faster, make decisions faster, and reclaim hours every week—without coding.",
  overview:
    "Learn how to use accessible AI tools for email, documents, meetings, marketing, planning, customer service, and video creation. The course is designed for beginners and focuses on real tasks, ready-to-use prompts, and repeatable workflows.",
  image: "/images/courses/ai-productivity-masterclass.png",
  externalVideoUrl: "",
  deliveryModes: ["Online", "Self paced", "Practical activities"],
  entryRequirements: [
    "No coding or technical experience required",
    "Access to a web browser and an email address",
    "A free AI assistant account is sufficient for the activities",
  ],
  careerOutcomes: [
    "Faster professional writing and communication",
    "Practical AI-assisted business workflows",
    "More efficient meetings, research, and content creation",
  ],
  unitSummary: "8 practical modules plus a bonus workflow library.",
  units: [
    { code: "M01", title: "Why AI Matters to You", type: "Skill set" },
    { code: "M02", title: "Mastering the Art of the Prompt", type: "Skill set" },
    { code: "M03", title: "Your AI Productivity Toolbox", type: "Skill set" },
    { code: "M04", title: "Master Email, Documents & PDF Productivity", type: "Skill set" },
    { code: "M05", title: "Meetings, Transcripts & Presentations", type: "Skill set" },
    { code: "M06", title: "AI for Small Business", type: "Skill set" },
    { code: "M07", title: "AI for Everyday Life", type: "Skill set" },
    { code: "M08", title: "Create Your First AI Video", type: "Skill set" },
    { code: "BONUS", title: "Real-Life AI Workflows", type: "Skill set" },
  ],
  lessons: [],
  availability: "open",
  durationDetails:
    "Work through eight example-driven modules and a bonus library of real-world workflows at your own pace.",
  feeDetails: "One-time course fee of AUD $100.",
  deliveryStrategy:
    "Plain-English demonstrations, guided practice, a structured handbook, and ready-to-use prompts built around everyday work.",
  sourceArchiveUrl: "/course-materials/ai-productivity-handbook.docx",
};
