export type CourseLesson = {
  id: string;
  title: string;
  duration: string;
  isPreview: boolean;
  videoProvider: "youtube" | "google-drive";
  videoUrl: string;
};

export type UnitItem = {
  code: string;
  title: string;
  type: "Core" | "Elective" | "Skill set";
  prerequisite?: string;
};

export type Course = {
  slug: string;
  code: string;
  title: string;
  category: string;
  label: string;
  priceAud: number;
  enrolmentFee?: number;
  duration: string;
  description: string;
  overview: string;
  image: string;
  externalVideoUrl: string;
  deliveryModes: string[];
  entryRequirements: string[];
  careerOutcomes: string[];
  unitSummary: string;
  units: UnitItem[];
  lessons: CourseLesson[];
};

export type CourseCategory = {
  slug: string;
  title: string;
  description: string;
  image: string;
};

const previewVideo = "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0";

export const courseCategories: CourseCategory[] = [
  {
    slug: "security-courses",
    title: "Security",
    description:
      "Licence-aligned security pathways for crowd control, guarding, supervision, and specialist response roles.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "first-aid-courses",
    title: "First Aid",
    description:
      "Practical emergency-response short courses for workplaces, education settings, and community safety roles.",
    image:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "work-health-safety-courses",
    title: "Work Health & Safety",
    description:
      "WHS foundations and compliance training for safer, more confident teams and supervisors.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "traffic-management-courses",
    title: "Traffic Management",
    description:
      "Short courses for traffic control, site communication, and live-road work environments.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
];

export const courses: Course[] = [
  {
    slug: "certificate-ii-security-operations",
    code: "CPP20218",
    title: "Certificate II Security Operations",
    category: "Security",
    label: "Most popular",
    priceAud: 1195,
    enrolmentFee: 500,
    duration: "291 nominal hours",
    description:
      "The core SSTA pathway for unarmed guard and crowd controller licensing outcomes.",
    overview:
      "This qualification reflects the role of a security officer responsible for maintaining safety and security by patrolling, protecting or guarding property while unarmed, screening entry, monitoring behaviour and removing persons from premises.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/police-officer-monitoring-security-camera-while-looking-at-the-monitor-screen-7255101/",
    deliveryModes: ["Face to face", "Online", "Recognition of Prior Learning", "Blended"],
    entryRequirements: [
      "Ability to read and write",
      "Good numeracy skills",
      "Must be over 18",
    ],
    careerOutcomes: ["Unarmed guard", "Crowd controller", "Security officer"],
    unitSummary: "14 core units of competency.",
    units: [
      { code: "CPPSEC2101", title: "Apply effective communication skills to maintain security", type: "Core" },
      { code: "CPPSEC2102", title: "Apply legal and procedural requirements to work effectively within a security team", type: "Core" },
      { code: "CPPSEC2103", title: "Apply WHS, emergency response and evacuation procedures to maintain security", type: "Core" },
      { code: "CPPSEC2104", title: "Apply risk assessment to select and carry out response to security risk situations", type: "Core" },
      { code: "CPPSEC2105", title: "Provide quality services to a range of security clients", type: "Core" },
      { code: "CPPSEC2106", title: "Protect self and others using basic defensive techniques", type: "Core" },
      { code: "CPPSEC2107", title: "Patrol premises to monitor property and maintain security", type: "Core" },
      { code: "CPPSEC2108", title: "Screen people, personal effects and items to maintain security", type: "Core" },
      { code: "CPPSEC2109", title: "Monitor and control access and exit of persons and vehicles from premises", type: "Core" },
      { code: "CPPSEC2110", title: "Monitor and control individual and crowd behaviour to maintain security", type: "Core" },
      { code: "CPPSEC2111", title: "Apply security procedures to manage intoxicated persons", type: "Core" },
      { code: "CPPSEC2112", title: "Apply security procedures to remove persons from premises", type: "Core" },
      { code: "CPPSEC2113", title: "Escort and protect persons and valuables", type: "Core" },
      { code: "HLTAID011", title: "Provide first aid", type: "Core" },
    ],
    lessons: [
      {
        id: "security-preview",
        title: "Security operations orientation",
        duration: "04:28",
        isPreview: true,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "legal-procedures",
        title: "Legal and procedural requirements",
        duration: "12:40",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "risk-response",
        title: "Risk assessment and response",
        duration: "16:05",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "crowd-behaviour",
        title: "Monitor crowd behaviour",
        duration: "14:12",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
    ],
  },
  {
    slug: "certificate-iii-security-operations-armed-cash-in-transit",
    code: "CPP31318",
    title: "Certificate III Security Operations",
    category: "Security",
    label: "Advanced",
    priceAud: 2840,
    enrolmentFee: 500,
    duration: "228 nominal hours",
    description:
      "For licensed officers who want to deepen operational skills and lead teams in specialist security settings.",
    overview:
      "This qualification supports security officers responsible for patrolling, protecting and guarding property, screening entry, monitoring behaviour and removing persons from premises, with pathways into armed guard, cash-in-transit, gatehouse and patrol roles.",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/video-of-a-person-arrested-7714096/",
    deliveryModes: ["Face to face", "Online", "Recognition of Prior Learning", "Blended"],
    entryRequirements: [
      "Current security officer licence in the relevant jurisdiction",
      "Ability to read and write",
      "Good numeracy skills",
      "Must be over 18",
    ],
    careerOutcomes: ["Security officer", "Cash-in-transit officer", "Gatehouse guard", "Security patrol"],
    unitSummary: "14 units of competency: 8 core units and 6 elective units.",
    units: [
      { code: "BSBFLM312", title: "Contribute to team effectiveness", type: "Core" },
      { code: "CPPSEC3101", title: "Manage conflict and security risks through negotiation", type: "Core" },
      { code: "CPPSEC3102", title: "Maintain operational safety and security of work environment", type: "Core" },
      { code: "CPPSEC3103", title: "Determine and implement response to security risk situation", type: "Core" },
      { code: "CPPSEC3104", title: "Coordinate monitoring and control of individual and crowd behaviour", type: "Core" },
      { code: "CPPSEC3105", title: "Coordinate provision of quality security services to clients", type: "Core" },
      { code: "CPPSEC3106", title: "Gather, organise and present security information and documentation", type: "Core" },
      { code: "CPPSEC3107", title: "Maintain security of environment", type: "Core" },
      { code: "CPPSEC3114", title: "Control security risk situations using firearms", type: "Elective" },
      { code: "CPPSEC3115", title: "Carry, operate and maintain revolvers for security purposes", type: "Elective" },
      { code: "CPPSEC3116", title: "Carry, operate and maintain semi-automatic pistols for security purposes", type: "Elective" },
      { code: "CPPSEC3117", title: "Plan and conduct cash-in-transit security operations", type: "Elective" },
    ],
    lessons: [
      {
        id: "advanced-preview",
        title: "Advanced security pathway overview",
        duration: "05:10",
        isPreview: true,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "operational-safety",
        title: "Operational safety and risk control",
        duration: "13:35",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
    ],
  },
  {
    slug: "batons-and-handcuffs-skill-set",
    code: "Skill Set",
    title: "Batons & Handcuffs Skill Set",
    category: "Security",
    label: "One day",
    priceAud: 450,
    duration: "1 day",
    description:
      "A practical extension for licensed officers who need baton and handcuff capability for approved work roles.",
    overview:
      "This training helps licensed security officers confidently present and control a subject using a baton and apply handcuffs when necessary, within legal and workplace requirements.",
    image:
      "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/video-of-a-person-arrested-7714096/",
    deliveryModes: ["Face to face", "Blended"],
    entryRequirements: [
      "Current security officer licence in the relevant jurisdiction",
      "Ability to read and write",
      "Good numeracy skills",
      "Must be over 18",
    ],
    careerOutcomes: ["Licensed crowd controller", "Licensed security guard", "Specialist response officer"],
    unitSummary: "Specialist baton and handcuff skill set delivered in class.",
    units: [
      { code: "BATON", title: "Present, use and manage baton response safely", type: "Skill set" },
      { code: "CUFFS", title: "Apply handcuffs within legal and operational requirements", type: "Skill set" },
    ],
    lessons: [
      {
        id: "baton-preview",
        title: "Baton and handcuff safety overview",
        duration: "03:45",
        isPreview: true,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "lawful-use",
        title: "Lawful use and workplace authorisation",
        duration: "11:20",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
    ],
  },
  {
    slug: "certificate-iv-security-management",
    code: "CPP40719",
    title: "Certificate IV Security Management",
    category: "Security",
    label: "Management",
    priceAud: 2650,
    enrolmentFee: 500,
    duration: "12 months full-time",
    description:
      "For supervisors and security business managers coordinating operational teams and client services.",
    overview:
      "This qualification is for security supervisors and security business managers who coordinate security operations, control rooms, monitoring centres, electronic security and guarding under complex regulatory and contracting arrangements.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/video-of-a-person-arrested-7714096/",
    deliveryModes: ["Face to face", "Online", "Recognition of Prior Learning", "Blended"],
    entryRequirements: [
      "No formal entry requirements",
      "Certificate III in Security Operations is highly recommended",
      "Current industry experience is highly recommended",
    ],
    careerOutcomes: ["Security supervisor", "Security operations supervisor", "Control room manager", "Security business manager"],
    unitSummary: "12 units of competency: 4 core units and 8 elective units.",
    units: [
      { code: "CPPSEC4001", title: "Manage work health and safety in the security work environment", type: "Core" },
      { code: "CPPSEC4003", title: "Assess and advise on client security needs", type: "Core" },
      { code: "CPPSEC4005", title: "Facilitate security operations briefing and debriefing processes", type: "Core" },
      { code: "CPPSEC4022", title: "Establish and implement ethics and governance arrangements for security businesses", type: "Core" },
      { code: "BSBESB402", title: "Establish legal and risk management requirements of new business ventures", type: "Elective" },
      { code: "BSBHRM415", title: "Coordinate recruitment and onboarding", type: "Elective" },
      { code: "BSBOPS401", title: "Coordinate business resources", type: "Elective" },
      { code: "CPPSEC4023", title: "Implement contracting arrangements for security businesses", type: "Elective" },
    ],
    lessons: [
      {
        id: "management-preview",
        title: "Security management overview",
        duration: "04:55",
        isPreview: true,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
      {
        id: "client-needs",
        title: "Assess client security needs",
        duration: "12:10",
        isPreview: false,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
    ],
  },
  {
    slug: "provide-first-aid",
    code: "HLTAID011",
    title: "Provide First Aid",
    category: "First Aid",
    label: "Short course",
    priceAud: 165,
    duration: "1 day",
    description:
      "First aid response, life support, casualty management and incident support until assistance arrives.",
    overview:
      "This unit describes the skills and knowledge required to provide a first aid response, life support and management of casualties, incidents and other first aiders until medical or other assistance arrives.",
    image:
      "https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/man-pushing-a-stretcher-with-a-woman-8944320/",
    deliveryModes: ["Face to face", "Online", "Blended"],
    entryRequirements: ["None"],
    careerOutcomes: ["Workplace first aider", "Community responder"],
    unitSummary: "HLTAID011 Provide First Aid.",
    units: [{ code: "HLTAID011", title: "Provide first aid", type: "Skill set" }],
    lessons: [
      {
        id: "first-aid-preview",
        title: "First aid course orientation",
        duration: "03:20",
        isPreview: true,
        videoProvider: "youtube",
        videoUrl: previewVideo,
      },
    ],
  },
];

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function getFeaturedCourse() {
  return courses[0];
}

export function getCoursesByCategory(category: string) {
  return courses.filter((course) => course.category === category);
}
