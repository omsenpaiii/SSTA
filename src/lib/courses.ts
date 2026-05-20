export type CourseLesson = {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  videoProvider: "youtube" | "google-drive";
  videoUrl: string;
};

export type Course = {
  slug: string;
  title: string;
  label: string;
  priceAud: number;
  duration: string;
  description: string;
  image: string;
  lessons: CourseLesson[];
};

const previewVideo = "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0";

export const courses: Course[] = [
  {
    slug: "certificate-ii-security-operations",
    title: "Certificate II Security Operations",
    label: "Most popular",
    priceAud: 100,
    duration: "8 modules",
    description:
      "Foundational security training with practical procedures, responsibilities, and compliance-led video lessons.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    lessons: [
      {
        id: "welcome",
        title: "Welcome to SSTA training",
        duration: "04:28",
        isPreview: true,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "legal-responsibilities",
        title: "Legal responsibilities and duty of care",
        duration: "12:40",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "incident-reports",
        title: "Observation, notes, and incident reports",
        duration: "16:05",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "communication-pressure",
        title: "Communication under pressure",
        duration: "14:12",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
    ],
  },
  {
    slug: "crowd-control-essentials",
    title: "Crowd Control Essentials",
    label: "New cohort",
    priceAud: 100,
    duration: "6 modules",
    description:
      "Entry screening, communication, conflict prevention, safe escalation, and clear incident reporting.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
    lessons: [],
  },
  {
    slug: "patrol-risk-awareness",
    title: "Patrol & Risk Awareness",
    label: "Practical",
    priceAud: 100,
    duration: "5 modules",
    description:
      "Scenario-led patrol checks, hazard awareness, observation routines, and professional handovers.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    lessons: [],
  },
];

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function getFeaturedCourse() {
  return courses[0];
}
