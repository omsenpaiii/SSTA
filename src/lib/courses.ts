import { bakerCourseOverrides } from "./baker-course-overrides";

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

export type CourseAvailability = "open" | "coming-soon" | "details-to-follow";
export type CourseDetailVariant = "standard" | "contact-first";

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
  availability?: CourseAvailability;
  priceLabel?: string;
  statusNote?: string;
  detailVariant?: CourseDetailVariant;
  externalAccessUrl?: string;
  externalAccessLabel?: string;
  durationDetails?: string;
  feeDetails?: string;
  deliveryStrategy?: string;
  sourceArchiveUrl?: string;
};

export type CourseCategory = {
  slug: string;
  title: string;
  filterCategory?: string;
  description: string;
  image: string;
};

const previewVideo = "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0";
const blendedDelivery = ["Face to face", "Online", "Recognition of Prior Learning", "Blended"];

function unit(code: string, title: string, type: UnitItem["type"] = "Skill set"): UnitItem {
  return { code, title, type };
}

function previewLessons(prefix: string, title: string): CourseLesson[] {
  return [
    {
      id: `${prefix}-preview`,
      title,
      duration: "04:00",
      isPreview: true,
      videoProvider: "youtube",
      videoUrl: previewVideo,
    },
    {
      id: `${prefix}-locked-module`,
      title: "Full course module",
      duration: "12:00",
      isPreview: false,
      videoProvider: "youtube",
      videoUrl: previewVideo,
    },
  ];
}

export const courseCategories: CourseCategory[] = [
  {
    slug: "building-construction-courses",
    title: "Building & Construction",
    description:
      "Construction qualifications and induction courses for builders, supervisors, site managers, and construction workers.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
  },
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
    slug: "whs-courses",
    title: "Work Health & Safety",
    description:
      "WHS foundations and compliance training for safer, more confident teams and supervisors.",
    image:
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "business-courses",
    title: "Business",
    description:
      "Leadership and management programs for emerging supervisors, managers, and workplace decision makers.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "community-services-courses",
    title: "Community Services",
    description:
      "Care and support pathway information for learners exploring disability and individual support training.",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "accounting-finance-courses",
    title: "Accounting & Finance",
    description:
      "Accounting, bookkeeping, and tax documentation courses for finance and compliance-focused learners.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "real-estate-courses",
    title: "Real Estate",
    description:
      "Property, agency practice, and agency management programs for Victorian real estate pathways.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "fire-warden-courses",
    title: "Fire Warden",
    description:
      "Emergency control organisation courses for wardens and workplace emergency leaders.",
    image:
      "https://images.unsplash.com/photo-1505489304219-85ce17010209?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "traffic-management-courses",
    title: "Traffic Management",
    description:
      "Short courses for traffic control, site communication, and live-road work environments.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "rsa-courses",
    title: "RSA",
    description:
      "Responsible service of alcohol training for hospitality, venue, and security staff working around licensed premises.",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "food-safety-courses",
    title: "Food Safety",
    description:
      "Food hygiene, safe food handling, and supervisor training for hospitality and food-service workplaces.",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "coming-soon-courses",
    title: "Coming Soon",
    description:
      "Upcoming qualifications, skill sets, and training pathways currently in preparation.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "other-courses",
    title: "Non Accredited Courses",
    filterCategory: "Other",
    description:
      "Practical non-accredited training and professional development courses accessed with SSTA guidance.",
    image:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
  },
];

const baseCourses: Course[] = [
  {
    slug: "certificate-ii-security-operations",
    code: "CPP20218",
    title: "Certificate II Security Operations",
    category: "Security",
    label: "Most popular",
    priceAud: 1295,
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
    priceAud: 2390,
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
    priceAud: 250,
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
  {
    slug: "certificate-iv-building-construction",
    code: "CPC40120",
    title: "Certificate IV in Building & Construction",
    category: "Building & Construction",
    label: "Qualification",
    priceAud: 7950,
    enrolmentFee: 500,
    duration: "55 weeks / self paced",
    description:
      "A building and site management pathway for builders, supervisors and managers of small to medium-sized building businesses.",
    overview:
      "This qualification reflects the role of builders, site managers and managers who apply structural principles, codes, standards and legal requirements while planning and supervising building and construction work.",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/engineers-looking-at-the-blueprint-they-are-holding-8964792/",
    deliveryModes: ["Online", "Classroom", "Blended"],
    entryRequirements: ["There are no formal entry requirements for this qualification."],
    careerOutcomes: ["Builder", "Site manager", "Construction supervisor"],
    unitSummary: "Building and site management units aligned to CPC40120.",
    units: [
      unit("CPC40120", "Certificate IV in Building and Construction", "Core"),
      unit("CPCCWHS1001", "Prepare to work safely in the construction industry", "Core"),
    ],
    lessons: previewLessons("building-cert-iv", "Building and construction orientation"),
  },
  {
    slug: "diploma-building-construction",
    code: "CPC50220",
    title: "Diploma of Building & Construction",
    category: "Building & Construction",
    label: "Diploma",
    priceAud: 8450,
    enrolmentFee: 500,
    duration: "18 months",
    description:
      "Advanced building study covering structural principles, risk, finance, estimating, contracts, contractors and project quality.",
    overview:
      "This qualification reflects the role of building professionals managing residential and commercial building projects within specified National Construction Code limitations.",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/man-and-woman-looking-at-the-blueprint-8471052/",
    deliveryModes: ["Face to face", "Workplace delivery", "Extensive workplace practice"],
    entryRequirements: [
      "Access to a live building and construction workplace",
      "Completion of CPCCWHS1001 is required for construction work",
      "Literacy and numeracy assessment and pre-training interview",
    ],
    careerOutcomes: ["Building professional", "Construction manager", "Project supervisor"],
    unitSummary: "27 units of competency: 24 core units and 3 elective units.",
    units: [
      unit("CPC50220", "Diploma of Building and Construction", "Core"),
      unit("CPCCBC4008", "Supervise communication and administration processes", "Core"),
    ],
    lessons: previewLessons("building-diploma", "Building diploma course preview"),
  },
  {
    slug: "white-card-cpcwhs1001",
    code: "CPCWHS1001",
    title: "Work Safely in the Construction Industry (White Card)",
    category: "Work Health & Safety",
    label: "White Card",
    priceAud: 165,
    duration: "1 day",
    description:
      "Construction induction training for people who need safe access to building and construction sites.",
    overview:
      "CPCCWHS1001 is designed to meet WHS regulatory authority requirements for WHS induction before access to building and construction work sites.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/engineer-measuring-the-spirit-level-of-the-wall-8482303/",
    deliveryModes: ["Face to face"],
    entryRequirements: ["None"],
    careerOutcomes: ["Construction worker", "Site visitor", "Entry-level site worker"],
    unitSummary: "CPCCWHS1001 Work safely in the construction industry.",
    units: [unit("CPCCWHS1001", "Work safely in the construction industry")],
    lessons: previewLessons("white-card", "White Card course orientation"),
  },
  {
    slug: "white-card-refresher-cpcwhs1001",
    code: "CPCWHS1001",
    title: "White Card Refresher",
    category: "Work Health & Safety",
    label: "Refresher",
    priceAud: 135,
    duration: "1 day",
    description:
      "A refresher version of the construction induction course for learners who need to renew core site safety knowledge.",
    overview:
      "This refresher revisits relevant legislation, construction hazards, control measures, OHS communication and incident response procedures.",
    image:
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/engineer-measuring-the-spirit-level-of-the-wall-8482303/",
    deliveryModes: ["Face to face"],
    entryRequirements: ["None"],
    careerOutcomes: ["Construction worker", "Site worker"],
    unitSummary: "CPCCWHS1001 refresher training.",
    units: [unit("CPCCWHS1001", "Work safely in the construction industry")],
    lessons: previewLessons("white-card-refresher", "White Card refresher preview"),
  },
  {
    slug: "apply-whs-requirements-construction",
    code: "CPCCWHS2001",
    title: "Apply WHS Requirements in Construction",
    category: "Work Health & Safety",
    label: "Short course",
    priceAud: 225,
    duration: "1 day",
    description:
      "Carry out WHS requirements through safe work practices in on-site and off-site construction workplaces.",
    overview:
      "This unit covers safe work practices, risk awareness, hazardous materials including asbestos, and legislated work safety practices for construction workers.",
    image:
      "https://images.unsplash.com/photo-1517089596392-fb9a9033e05b?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/construction-worker-looking-at-the-camera-8964296/",
    deliveryModes: ["Face to face"],
    entryRequirements: ["None"],
    careerOutcomes: ["Construction worker", "WHS-aware team member"],
    unitSummary: "CPCCWHS2001 Apply WHS requirements, policies and procedures.",
    units: [unit("CPCCWHS2001", "Apply WHS requirements, policies and procedures")],
    lessons: previewLessons("whs-construction", "Construction WHS preview"),
  },
  {
    slug: "certificate-iv-work-health-safety",
    code: "BSB41419",
    title: "Certificate IV in Work Health and Safety",
    category: "Work Health & Safety",
    label: "Qualification",
    priceAud: 4606,
    enrolmentFee: 500,
    duration: "6 to 12 months",
    description:
      "A WHS qualification for supervisors, WHS personnel and workers who manage workplace risks effectively.",
    overview:
      "This qualification applies to people who apply relevant WHS laws, contribute to workplace WHS and manage risks in known or changing contexts.",
    image:
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/colleagues-discussing-a-documents-while-walking-inside-the-office-5977455/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["There are no formal entry requirements."],
    careerOutcomes: ["WHS officer", "Supervisor", "Safety coordinator"],
    unitSummary: "10 units of competency: 5 core units and 5 elective units.",
    units: [
      unit("BSB41419", "Certificate IV in Work Health and Safety", "Core"),
      unit("BSBWHS414", "Contribute to WHS risk management", "Core"),
    ],
    lessons: previewLessons("cert-iv-whs", "Certificate IV WHS preview"),
  },
  {
    slug: "contribute-health-safety-self-others",
    code: "BSBWHS201",
    title: "Contribute to Health and Safety to Self and Others",
    category: "Work Health & Safety",
    label: "Short course",
    priceAud: 195,
    duration: "1 day",
    description:
      "Basic WHS knowledge for workers who need to follow procedures, respond to incidents and participate in consultation.",
    overview:
      "This unit covers healthy and safe work practices, emergency procedures, WHS requirements and participation in WHS consultative processes.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/man-rescuing-a-patient-8944425/",
    deliveryModes: ["Face to face"],
    entryRequirements: ["None"],
    careerOutcomes: ["Workplace team member", "Safety-aware worker"],
    unitSummary: "BSBWHS201 Contribute to health and safety to self and others.",
    units: [unit("BSBWHS201", "Contribute to health and safety to self and others")],
    lessons: previewLessons("whs-self-others", "Workplace safety preview"),
  },
  {
    slug: "certificate-iv-leadership-management",
    code: "BSB40520",
    title: "Certificate IV in Leadership & Management",
    category: "Business",
    label: "Leadership",
    priceAud: 3950,
    enrolmentFee: 500,
    duration: "6 to 12 months",
    description:
      "A pathway for developing and emerging leaders who guide teams and organise workplace outputs.",
    overview:
      "This qualification reflects individuals who assume responsibility for their own performance and support others while solving predictable and unpredictable workplace problems.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/business-woman-doing-a-work-presentation-in-a-meeting-8188832/",
    deliveryModes: ["Face to face", "Recognition of Prior Learning", "Blended"],
    entryRequirements: [
      "Aged 18 years or over",
      "Suitable language, literacy and numeracy skills",
    ],
    careerOutcomes: ["Team leader", "Supervisor", "Emerging manager"],
    unitSummary: "12 units of competency: 5 core units and 7 elective units.",
    units: [unit("BSB40520", "Certificate IV in Leadership and Management", "Core")],
    lessons: previewLessons("leadership-cert-iv", "Leadership course preview"),
  },
  {
    slug: "diploma-leadership-management",
    code: "BSB50420",
    title: "Diploma of Leadership & Management",
    category: "Business",
    label: "Diploma",
    priceAud: 6390,
    enrolmentFee: 500,
    duration: "6 to 12 months",
    description:
      "Leadership and management study for people applying practical skills, judgement and initiative across workplace teams.",
    overview:
      "This qualification supports learners who plan, organise, implement and monitor their own workload and the workload of others across enterprise contexts.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/people-in-business-ending-a-meeting-with-a-shake-hand-3209211/",
    deliveryModes: blendedDelivery,
    entryRequirements: [
      "Preferred pathway is prior leadership qualification or vocational experience",
      "Aged 18 years or over",
      "Suitable language, literacy and numeracy skills",
    ],
    careerOutcomes: ["Manager", "Team leader", "Operations coordinator"],
    unitSummary: "12 units of competency: 6 core units and 6 elective units.",
    units: [unit("BSB50420", "Diploma of Leadership and Management", "Core")],
    lessons: previewLessons("leadership-diploma", "Diploma leadership preview"),
  },
  {
    slug: "certificate-iv-accounting-bookkeeping",
    code: "FNS40222",
    title: "Certificate IV in Accounting and Bookkeeping",
    category: "Accounting & Finance",
    label: "Bookkeeping",
    priceAud: 4389,
    enrolmentFee: 500,
    duration: "12 to 24 months",
    description:
      "Accounting and bookkeeping training for BAS agent, contract bookkeeper and finance administration pathways.",
    overview:
      "This qualification reflects accounting industry job roles involving activity statements, bookkeeping tasks, specialist knowledge and non-routine financial activities.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/a-person-explaining-a-document-7821854/",
    deliveryModes: blendedDelivery,
    entryRequirements: [
      "Australian citizen, permanent resident or visa holder allowed to study in Australia",
      "Pre-training review and digital literacy suitability check",
    ],
    careerOutcomes: ["Bookkeeper", "Accounts officer", "BAS support role"],
    unitSummary: "13 units of competency: 10 core units and 3 elective units.",
    units: [unit("FNS40222", "Certificate IV in Accounting and Bookkeeping", "Core")],
    lessons: previewLessons("accounting-bookkeeping", "Accounting and bookkeeping preview"),
  },
  {
    slug: "tax-documentation-legal-entities",
    code: "FNSACC601",
    title: "Prepare and Administer Tax Documentation for Legal Entities",
    category: "Accounting & Finance",
    label: "Tax",
    priceAud: 495,
    duration: "12 weeks",
    description:
      "Identify tax requirements, gather and process tax data, and prepare documentation for complex legal-entity lodgements.",
    overview:
      "This unit supports specialist taxation work and is designed to meet educational requirements of the Tax Practitioner Board.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/woman-using-calcutor-while-working-7593784/",
    deliveryModes: blendedDelivery,
    entryRequirements: [
      "18 years of age",
      "Completed Year 12",
      "Completion of accounting principles skill set or equivalent accounting/bookkeeping qualification",
    ],
    careerOutcomes: ["Tax documentation officer", "Accounting support role"],
    unitSummary: "FNSACC601 tax documentation unit.",
    units: [unit("FNSACC601", "Prepare and administer tax documentation for legal entities")],
    lessons: previewLessons("tax-legal-entities", "Tax documentation preview"),
  },
  {
    slug: "tax-documentation-individuals",
    code: "FNSACC512",
    title: "Prepare and Administer Tax Documentation for Individuals",
    category: "Accounting & Finance",
    label: "Tax",
    priceAud: 495,
    duration: "12 weeks",
    description:
      "Prepare non-complex income tax returns for individuals in line with statutory requirements.",
    overview:
      "This unit covers gathering and verifying data, calculating taxable income and reviewing compliance requirements for individual tax returns.",
    image:
      "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/man-counting-money-on-work-desk-6699609/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Competent written and spoken English", "18 years of age", "Completed Year 12"],
    careerOutcomes: ["Tax assistant", "Accounting support officer"],
    unitSummary: "FNSACC512 individual tax documentation unit.",
    units: [unit("FNSACC512", "Prepare and administer tax documentation for individuals")],
    lessons: previewLessons("tax-individuals", "Individual tax course preview"),
  },
  {
    slug: "certificate-iv-real-estate-practice",
    code: "CPP41419",
    title: "Certificate IV in Real Estate Practice",
    category: "Real Estate",
    label: "Real estate",
    priceAud: 4795,
    enrolmentFee: 500,
    duration: "12 to 24 months",
    description:
      "Real estate practice training for learners working toward agency, sales, property management and related property roles.",
    overview:
      "This qualification reflects real estate professionals applying legal agency and compliance requirements, ethical standards and consumer preferences.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/people-shaking-hands-7577931/",
    deliveryModes: ["Classroom", "eLearning", "Blended"],
    entryRequirements: [
      "Must be prepared to undertake training in Victoria",
      "Age and residency requirements apply",
      "Computer equipment, reliable internet and printer/scanner access",
    ],
    careerOutcomes: ["Real estate agent", "Property manager", "Auctioneer", "Buyer's agent"],
    unitSummary: "18 units of competency: 5 core units and 13 elective units.",
    units: [unit("CPP41419", "Certificate IV in Real Estate Practice", "Core")],
    lessons: previewLessons("real-estate-cert-iv", "Real estate practice preview"),
  },
  {
    slug: "diploma-property-agency-management",
    code: "CPP51122",
    title: "Diploma of Property (Agency Management)",
    category: "Real Estate",
    label: "Diploma",
    priceAud: 5950,
    enrolmentFee: 500,
    duration: "12 to 24 months",
    description:
      "Agency management training for real estate principals, agency managers and directors.",
    overview:
      "This qualification reflects real estate principals applying property agency, compliance, ethical and consumer preference knowledge to establish and control real estate functions.",
    image:
      "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/a-realtor-shaking-hands-with-her-clients-8725959/",
    deliveryModes: ["Face to face", "Online workshops", "Blended"],
    entryRequirements: [
      "Must be prepared to undertake training in Victoria",
      "Age and residency requirements apply",
      "Computer equipment, reliable internet and printer/scanner access",
    ],
    careerOutcomes: ["Agency principal", "Agency manager", "Agency director", "Strata management principal"],
    unitSummary: "12 units of competency: 7 core units and 5 elective units.",
    units: [unit("CPP51122", "Diploma of Property Agency Management", "Core")],
    lessons: previewLessons("property-diploma", "Property agency management preview"),
  },
  {
    slug: "provide-cpr-hltaid009",
    code: "HLTAID009",
    title: "Provide Cardiopulmonary Resuscitation CPR",
    category: "First Aid",
    label: "CPR",
    priceAud: 70,
    duration: "1 day",
    description:
      "Perform cardiopulmonary resuscitation in line with Australian Resuscitation Council guidelines.",
    overview:
      "This unit applies to people who may be required to provide CPR in community and workplace settings.",
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/close-up-of-people-practicing-cpr-6531400/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["None"],
    careerOutcomes: ["Workplace responder", "Community first aider"],
    unitSummary: "HLTAID009 Provide cardiopulmonary resuscitation.",
    units: [unit("HLTAID009", "Provide cardiopulmonary resuscitation CPR")],
    lessons: previewLessons("cpr", "CPR preview lesson"),
  },
  {
    slug: "provide-cpr-refresher-hltaid009",
    code: "HLTAID009",
    title: "Provide CPR Refresher",
    category: "First Aid",
    label: "Refresher",
    priceAud: 70,
    duration: "1 day",
    description:
      "A CPR refresher for learners who hold a current statement of attainment and need renewal training.",
    overview:
      "This refresher provides appropriate training for people required to perform CPR in line with Australian Resuscitation Council Guidelines.",
    image:
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/close-up-of-people-practicing-cpr-6531400/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Current statement of attainment for Provide cardiopulmonary resuscitation"],
    careerOutcomes: ["Workplace responder", "Community first aider"],
    unitSummary: "HLTAID009 CPR refresher.",
    units: [unit("HLTAID009", "Provide cardiopulmonary resuscitation CPR")],
    lessons: previewLessons("cpr-refresher", "CPR refresher preview"),
  },
  {
    slug: "provide-first-aid-hltaid011",
    code: "HLTAID011",
    title: "Provide First Aid",
    category: "First Aid",
    label: "First aid",
    priceAud: 165,
    duration: "1 day",
    description:
      "Provide first aid response, life support and casualty management until medical help arrives.",
    overview:
      "This unit describes the skills and knowledge required to provide first aid response, life support, management of casualty or casualties, the incident and other first aiders until the arrival of medical or other assistance.",
    image:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/man-pushing-a-stretcher-with-a-woman-8944320/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["None"],
    careerOutcomes: ["Workplace first aider", "Community responder", "Team safety lead"],
    unitSummary: "HLTAID011 Provide first aid.",
    units: [unit("HLTAID011", "Provide first aid")],
    lessons: previewLessons("first-aid", "First aid preview lesson"),
  },
  {
    slug: "provide-first-aid-refresher-hltaid011",
    code: "HLTAID011",
    title: "Provide First Aid Refresher",
    category: "First Aid",
    label: "Refresher",
    priceAud: 0,
    duration: "1 day",
    description:
      "Refresher training for learners who need to renew their Provide First Aid knowledge and practical response skills.",
    overview:
      "This refresher offering is planned for learners who hold prior first aid training and need an updated HLTAID011-aligned renewal pathway.",
    image:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/man-pushing-a-stretcher-with-a-woman-8944320/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Current or previously attained first aid training details may be required"],
    careerOutcomes: ["Workplace first aider", "Community responder"],
    unitSummary: "HLTAID011 refresher details will be confirmed.",
    units: [unit("HLTAID011", "Provide first aid")],
    lessons: previewLessons("first-aid-refresher", "First aid refresher preview"),
    availability: "details-to-follow",
    priceLabel: "Details to follow",
    statusNote: "Refresher scheduling and fee details will be released soon.",
  },
  {
    slug: "child-care-first-aid-hltaid012",
    code: "HLTAID012",
    title: "Emergency First Aid Response in Education and Care",
    category: "First Aid",
    label: "Child care",
    priceAud: 250,
    duration: "8 hours online study plus class",
    description:
      "First aid response for infants and children, including asthma and anaphylaxis emergencies in education and care settings.",
    overview:
      "This unit applies to educators and workers who respond to first aid emergencies involving infants and children.",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/a-woman-training-on-how-to-apply-cardiopulmonary-resuscitation-on-babies-3981744/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Course-specific entry requirements confirmed during enrolment"],
    careerOutcomes: ["Education and care first aider", "Child care responder"],
    unitSummary: "HLTAID012 education and care first aid response.",
    units: [unit("HLTAID012", "Provide first aid in an education and care setting")],
    lessons: previewLessons("child-care-first-aid", "Child care first aid preview"),
  },
  {
    slug: "child-care-first-aid-refresher-hltaid012",
    code: "HLTAID012",
    title: "Emergency First Aid Response in Education and Care Refresher",
    category: "First Aid",
    label: "Refresher",
    priceAud: 170,
    duration: "8 hours online study plus class",
    description:
      "Refresh first aid, asthma and anaphylaxis response skills for education and care settings.",
    overview:
      "This refresher supports educators and care workers who need updated first aid training for infant and child emergencies in education and care settings.",
    image:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/a-woman-training-on-how-to-apply-cardiopulmonary-resuscitation-on-babies-3981744/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Previous child care first aid training details may be requested during enrolment"],
    careerOutcomes: ["Education and care first aider", "Child care responder"],
    unitSummary: "HLTAID012 refresher training for education and care settings.",
    units: [unit("HLTAID012", "Provide first aid in an education and care setting")],
    lessons: previewLessons("child-care-first-aid-refresher", "Child care first aid refresher preview"),
  },
  {
    slug: "advanced-first-aid-hltaid014",
    code: "HLTAID014",
    title: "Provide Advanced First Aid",
    category: "First Aid",
    label: "Advanced",
    priceAud: 295,
    duration: "1 day",
    description:
      "Advanced first aid response skills for casualties in community and workplace situations.",
    overview:
      "This unit describes the skills and knowledge required to provide an advanced first aid response in line with recognised first aid guidelines.",
    image:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/people-rescuing-a-man-lying-on-street-8944315/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Course-specific entry requirements confirmed during enrolment"],
    careerOutcomes: ["Advanced first aider", "Workplace emergency responder"],
    unitSummary: "HLTAID014 Provide advanced first aid.",
    units: [unit("HLTAID014", "Provide advanced first aid")],
    lessons: previewLessons("advanced-first-aid", "Advanced first aid preview"),
  },
  {
    slug: "advanced-first-aid-refresher-hltaid014",
    code: "HLTAID014",
    title: "Provide Advanced First Aid Refresher",
    category: "First Aid",
    label: "Refresher",
    priceAud: 0,
    duration: "1 day",
    description:
      "Renew advanced first aid response skills for complex workplace and community emergency situations.",
    overview:
      "An advanced first aid refresher is planned for learners who need an updated HLTAID014-aligned renewal option.",
    image:
      "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/people-rescuing-a-man-lying-on-street-8944315/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Previous advanced first aid certification details may be requested"],
    careerOutcomes: ["Advanced first aider", "Workplace emergency responder"],
    unitSummary: "HLTAID014 refresher details will be confirmed.",
    units: [unit("HLTAID014", "Provide advanced first aid")],
    lessons: previewLessons("advanced-first-aid-refresher", "Advanced first aid refresher preview"),
    availability: "details-to-follow",
    priceLabel: "Details to follow",
    statusNote: "Refresher pricing and delivery details will be shared soon.",
  },
  {
    slug: "advanced-resuscitation-oxygen-therapy",
    code: "HLTAID015",
    title: "Advanced Resuscitation and Oxygen Therapy",
    category: "First Aid",
    label: "Advanced",
    priceAud: 350,
    duration: "1 day",
    description:
      "Use specialised equipment to provide resuscitation and oxygen therapy in complex situations.",
    overview:
      "This unit covers specialised resuscitation and oxygen therapy equipment in line with Australian Resuscitation Council guidelines.",
    image:
      "https://images.unsplash.com/photo-1583241801142-1131d2fe1865?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/a-paramedic-using-a-bvm-on-a-patient-lying-down-on-a-stretcher-8944317/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Pre-requisite unit: HLTAID011 Provide First Aid"],
    careerOutcomes: ["Advanced responder", "Workplace emergency responder"],
    unitSummary: "HLTAID015 advanced resuscitation and oxygen therapy.",
    units: [unit("HLTAID015", "Provide advanced resuscitation and oxygen therapy")],
    lessons: previewLessons("oxygen-therapy", "Oxygen therapy preview"),
  },
  {
    slug: "advanced-resuscitation-oxygen-therapy-refresher",
    code: "HLTAID015",
    title: "Advanced Resuscitation and Oxygen Therapy Refresher",
    category: "First Aid",
    label: "Refresher",
    priceAud: 0,
    duration: "1 day",
    description:
      "Refresh specialised resuscitation and oxygen therapy skills for learners maintaining advanced emergency capability.",
    overview:
      "This refresher course is planned for learners who need updated HLTAID015-aligned resuscitation and oxygen therapy training.",
    image:
      "https://images.unsplash.com/photo-1583241801142-1131d2fe1865?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/a-paramedic-using-a-bvm-on-a-patient-lying-down-on-a-stretcher-8944317/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Pre-requisite unit: HLTAID011 Provide First Aid"],
    careerOutcomes: ["Advanced responder", "Workplace emergency responder"],
    unitSummary: "HLTAID015 refresher details will be confirmed.",
    units: [unit("HLTAID015", "Provide advanced resuscitation and oxygen therapy")],
    lessons: previewLessons("oxygen-therapy-refresher", "Oxygen therapy refresher preview"),
    availability: "details-to-follow",
    priceLabel: "Details to follow",
    statusNote: "Refresher pricing and class dates will be released soon.",
  },
  {
    slug: "certificate-iii-individual-support",
    code: "CPC30220",
    title: "Certificate III in Individual Support",
    category: "Community Services",
    label: "Coming soon",
    priceAud: 13628,
    duration: "Details to follow",
    description:
      "Individual support training information will be added soon for learners exploring care and support pathways.",
    overview:
      "Select Security Training Academy is preparing Certificate III in Individual Support details, with course structure, delivery and enrolment information to follow.",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/a-caregiver-smiling-with-an-elderly-woman-7551627/",
    deliveryModes: ["Details to follow"],
    entryRequirements: ["Course details to follow"],
    careerOutcomes: ["Individual support worker", "Community care pathway"],
    unitSummary: "Course details to follow.",
    units: [unit("TBA", "Course structure to be confirmed")],
    lessons: previewLessons("individual-support", "Individual support course preview"),
    availability: "coming-soon",
    priceLabel: "$13,628",
    statusNote: "Certificate III details are coming soon.",
  },
  {
    slug: "certificate-iv-disability",
    code: "Details to follow",
    title: "Certificate IV in Disability",
    category: "Community Services",
    label: "Details to follow",
    priceAud: 0,
    duration: "Details to follow",
    description:
      "Certificate IV in Disability information will be shared once the full course details are finalised.",
    overview:
      "This upcoming disability pathway is planned for learners seeking advanced support training, with delivery, units and enrolment details still to follow.",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/elderly-man-and-caregiver-talking-in-a-living-room-6953805/",
    deliveryModes: ["Details to follow"],
    entryRequirements: ["Course details to follow"],
    careerOutcomes: ["Disability support practitioner", "Community services pathway"],
    unitSummary: "Course details to follow.",
    units: [unit("TBA", "Course structure to be confirmed")],
    lessons: previewLessons("disability", "Disability course preview"),
    availability: "details-to-follow",
    priceLabel: "Details to follow",
    statusNote: "Certificate IV disability details will be shared soon.",
  },
  {
    slug: "operate-emergency-control-organization",
    code: "PUAWER005B",
    title: "Operate as Part of an Emergency Control Organization",
    category: "Fire Warden",
    label: "Warden",
    priceAud: 195,
    duration: "1 day",
    description:
      "Implement workplace emergency response procedures as part of an emergency control organisation.",
    overview:
      "This unit covers emergency response work within the command, control and coordination structure of an emergency control organisation.",
    image:
      "https://images.unsplash.com/photo-1505489304219-85ce17010209?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/side-view-of-a-fire-truck-at-night-5266045/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Course-specific entry requirements confirmed during enrolment"],
    careerOutcomes: ["Fire warden", "Emergency control organisation member"],
    unitSummary: "PUAWER005B Operate as part of an emergency control organization.",
    units: [unit("PUAWER005B", "Operate as part of an emergency control organization")],
    lessons: previewLessons("emergency-control", "Emergency control preview"),
  },
  {
    slug: "lead-emergency-control-organization",
    code: "PUAWER006",
    title: "Lead an Emergency Control Organization",
    category: "Fire Warden",
    label: "Lead warden",
    priceAud: 195,
    duration: "1 day",
    description:
      "Make safety decisions and give priority instructions during workplace emergency incidents.",
    overview:
      "This unit covers decision making for people's safety during workplace emergencies within Australian Standard 3745-2010 contexts.",
    image:
      "https://images.unsplash.com/photo-1475776408506-9a5371e7a068?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/firefighter-talking-over-the-radio-5930450/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Pre-requisite: PUAWER005B Operate as part of an emergency control organisation"],
    careerOutcomes: ["Chief warden", "Emergency control organisation leader"],
    unitSummary: "PUAWER006 Lead an emergency control organization.",
    units: [unit("PUAWER006", "Lead an emergency control organization")],
    lessons: previewLessons("lead-emergency-control", "Lead warden preview"),
  },
  {
    slug: "control-traffic-stop-slow-bat",
    code: "RIIWHS205E",
    title: "Control Traffic with Stop-Slow Bat",
    category: "Traffic Management",
    label: "Traffic",
    priceAud: 220,
    duration: "1 day",
    description:
      "Develop the knowledge and skills required to apply traffic controlling procedures on a worksite.",
    overview:
      "This unit covers planning, preparing, coordinating traffic, operating radios and cleaning up for stop-slow bat traffic control.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/woman-controlling-traffic-on-street-in-vancouver-10339806/",
    deliveryModes: blendedDelivery,
    entryRequirements: [
      "Minimum of 18 years of age",
      "Applicants must satisfy language, literacy and numeracy requirements",
      "Traffic-control site experience is preferred but not mandatory",
    ],
    careerOutcomes: ["Traffic controller", "Road worksite team member"],
    unitSummary: "RIIWHS205E Control traffic with stop-slow bat.",
    units: [unit("RIIWHS205E", "Control traffic with stop-slow bat")],
    lessons: previewLessons("traffic-stop-slow", "Traffic control preview"),
  },
  {
    slug: "implement-traffic-management-plan",
    code: "RIIWHS302E",
    title: "Implement Traffic Management Plan",
    category: "Traffic Management",
    label: "Traffic",
    priceAud: 220,
    duration: "1 day",
    description:
      "Set out, monitor and close down traffic management plans and guidance schemes in civil construction.",
    overview:
      "This unit applies to supervisory roles working in teams in live traffic environments with responsibility for traffic management outcomes.",
    image:
      "https://images.unsplash.com/photo-1524211616209-8a337dd6a38e?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/road-construction-4430419/",
    deliveryModes: blendedDelivery,
    entryRequirements: [
      "Minimum of 18 years of age",
      "Applicants must satisfy language, literacy and numeracy requirements",
      "Traffic-control site experience is preferred but not mandatory",
    ],
    careerOutcomes: ["Traffic management supervisor", "Civil construction traffic team member"],
    unitSummary: "RIIWHS302E Implement traffic management plan.",
    units: [unit("RIIWHS302E", "Implement traffic management plan")],
    lessons: previewLessons("traffic-plan", "Traffic management plan preview"),
  },
  {
    slug: "responsible-service-alcohol-rsa",
    code: "SITHFAB021",
    title: "Provide Responsible Service of Alcohol RSA",
    category: "RSA",
    label: "RSA",
    priceAud: 65,
    duration: "1 day",
    description:
      "Responsible service of alcohol training for staff who sell, serve, supply or monitor alcohol service.",
    overview:
      "This unit covers responsible practices wherever alcohol is sold, served or supplied, including hospitality venues and licensed premises.",
    image:
      "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl:
      "https://www.pexels.com/video/a-person-pouring-wine-on-a-row-of-wine-glasses-3188887/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Minimum of 18 years of age", "Language, literacy and numeracy requirements apply"],
    careerOutcomes: ["Hospitality staff", "Venue staff", "Security staff in licensed premises"],
    unitSummary: "SITHFAB021 Provide Responsible Service of Alcohol.",
    units: [unit("SITHFAB021", "Provide Responsible Service of Alcohol RSA")],
    lessons: previewLessons("rsa", "RSA preview lesson"),
  },
  {
    slug: "hygienic-practices-food-safety",
    code: "SITXFSA005",
    title: "Use Hygienic Practices for Food Safety",
    category: "Food Safety",
    label: "Food safety",
    priceAud: 65,
    duration: "1 day",
    description:
      "Use personal hygiene practices to prevent contamination of food and control food hazards.",
    overview:
      "This unit applies to food handlers who directly handle food or food-contact surfaces in hospitality, care, catering and related workplaces.",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/a-pregnant-woman-preparing-breakfast-7568510/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Competent written and spoken English", "18 years of age"],
    careerOutcomes: ["Food handler", "Hospitality worker", "Kitchen hand"],
    unitSummary: "SITXFSA005 Use hygienic practices for food safety.",
    units: [unit("SITXFSA005", "Use hygienic practices for food safety")],
    lessons: previewLessons("food-hygiene", "Food hygiene preview"),
  },
  {
    slug: "safe-food-handling-practices",
    code: "SITXFSA006",
    title: "Participate in Safe Food Handling Practices",
    category: "Food Safety",
    label: "Food handling",
    priceAud: 140,
    duration: "1 day",
    description:
      "Handle food safely during storage, preparation, display, service and disposal.",
    overview:
      "This unit covers food safety program procedures, safe food handling, HACCP-style systems and compliance with food standards.",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/person-opening-avocado-7601357/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Competent written and spoken English", "18 years of age"],
    careerOutcomes: ["Food handler", "Kitchen team member", "Hospitality worker"],
    unitSummary: "SITXFSA006 Participate in safe food handling practices.",
    units: [unit("SITXFSA006", "Participate in safe food handling practices")],
    lessons: previewLessons("safe-food-handling", "Safe food handling preview"),
  },
  {
    slug: "food-safety-supervisor-skill-set",
    code: "Skill Set",
    title: "Food Safety Supervisor Course",
    category: "Food Safety",
    label: "Supervisor",
    priceAud: 205,
    duration: "2 days",
    description:
      "A food safety supervisor skill set covering personal hygiene, safe food handling and food-safety hazard awareness.",
    overview:
      "This course is designed for people getting started in the food industry or meeting minimum food safety training requirements.",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "https://www.pexels.com/video/person-opening-avocado-7601357/",
    deliveryModes: blendedDelivery,
    entryRequirements: ["Competent written and spoken English"],
    careerOutcomes: ["Food safety supervisor", "Hospitality supervisor", "Food business team member"],
    unitSummary: "SITXFSA005 and SITXFSA006 food safety skill set.",
    units: [
      unit("SITXFSA005", "Use hygienic practices for food safety"),
      unit("SITXFSA006", "Participate in safe food handling practices"),
    ],
    lessons: previewLessons("food-supervisor", "Food safety supervisor preview"),
  },
  {
    slug: "communication-skills",
    code: "Additional Course",
    title: "Communication Skills",
    category: "Other",
    label: "External access",
    priceAud: 0,
    duration: "Contact SSTA",
    description:
      "A communication skills pathway for learners building clearer workplace communication and interpersonal confidence.",
    overview:
      "This additional course is available through SSTA with a guided access process. Contact the team and SSTA will help you access the right learning platform and next steps.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Contact SSTA for delivery details"],
    entryRequirements: ["Please contact SSTA for course access and suitability guidance"],
    careerOutcomes: ["Professional development", "Workplace communication confidence"],
    unitSummary: "Contact SSTA for course details.",
    units: [],
    lessons: [],
    availability: "details-to-follow",
    priceLabel: "Contact us",
    statusNote: "Please contact SSTA for access details.",
    detailVariant: "contact-first",
    externalAccessUrl: "https://ssta.mylearnt.io/login",
    externalAccessLabel: "Access Additional Courses",
  },
  {
    slug: "counselling-skills",
    code: "Additional Course",
    title: "Counselling Skills",
    category: "Other",
    label: "External access",
    priceAud: 0,
    duration: "Contact SSTA",
    description:
      "A counselling skills pathway for learners exploring supportive communication and person-centred engagement skills.",
    overview:
      "This additional course is available through SSTA with a guided access process. Contact the team and SSTA will help you access the right learning platform and next steps.",
    image:
      "https://images.unsplash.com/photo-1573496773905-f5b17e717f05?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Contact SSTA for delivery details"],
    entryRequirements: ["Please contact SSTA for course access and suitability guidance"],
    careerOutcomes: ["Professional development", "Supportive communication skills"],
    unitSummary: "Contact SSTA for course details.",
    units: [],
    lessons: [],
    availability: "details-to-follow",
    priceLabel: "Contact us",
    statusNote: "Please contact SSTA for access details.",
    detailVariant: "contact-first",
    externalAccessUrl: "https://ssta.mylearnt.io/login",
    externalAccessLabel: "Access Additional Courses",
  },
  {
    slug: "criminal-justice-and-criminology",
    code: "Additional Course",
    title: "Criminal Justice and Criminology",
    category: "Other",
    label: "External access",
    priceAud: 0,
    duration: "Contact SSTA",
    description:
      "An additional pathway for learners interested in criminal justice systems, criminology concepts, and related professional study.",
    overview:
      "This additional course is available through SSTA with a guided access process. Contact the team and SSTA will help you access the right learning platform and next steps.",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Contact SSTA for delivery details"],
    entryRequirements: ["Please contact SSTA for course access and suitability guidance"],
    careerOutcomes: ["Professional development", "Justice and criminology pathway exploration"],
    unitSummary: "Contact SSTA for course details.",
    units: [],
    lessons: [],
    availability: "details-to-follow",
    priceLabel: "Contact us",
    statusNote: "Please contact SSTA for access details.",
    detailVariant: "contact-first",
    externalAccessUrl: "https://ssta.mylearnt.io/login",
    externalAccessLabel: "Access Additional Courses",
  },
  {
    slug: "certificate-iii-carpentry",
    code: "Coming soon",
    title: "Certificate III in Carpentry",
    category: "Building & Construction",
    label: "Coming soon",
    priceAud: 0,
    duration: "Details to follow",
    description:
      "Carpentry training and practical skills information will be added soon for residential and commercial building pathways.",
    overview:
      "Select Security Training Academy is preparing Certificate III in Carpentry details, covering timber framing, hand and power tools, and worksite safety practices.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Details to follow"],
    entryRequirements: ["Course details to follow"],
    careerOutcomes: ["Carpenter", "Subcontractor", "Construction team member"],
    unitSummary: "Course details to follow.",
    units: [unit("CPC30220", "Certificate III in Carpentry")],
    lessons: [],
    availability: "coming-soon",
    priceLabel: "Coming soon",
    statusNote: "Certificate III Carpentry details are coming soon.",
  },
  {
    slug: "diploma-work-health-safety",
    code: "Coming soon",
    title: "Diploma of Work Health and Safety",
    category: "Work Health & Safety",
    label: "Coming soon",
    priceAud: 0,
    duration: "Details to follow",
    description:
      "Advanced work health and safety management training for WHS coordinators, advisors, and managers.",
    overview:
      "Select Security Training Academy is preparing Diploma of WHS course details, covering risk management, safety audit coordination, and compliance systems.",
    image:
      "https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Details to follow"],
    entryRequirements: ["Course details to follow"],
    careerOutcomes: ["WHS Manager", "Safety Advisor", "WHS Coordinator"],
    unitSummary: "Course details to follow.",
    units: [unit("BSB51319", "Diploma of Work Health and Safety")],
    lessons: [],
    availability: "coming-soon",
    priceLabel: "Coming soon",
    statusNote: "Diploma of WHS details are coming soon.",
  },
  {
    slug: "diploma-community-services",
    code: "Coming soon",
    title: "Diploma of Community Services",
    category: "Community Services",
    label: "Coming soon",
    priceAud: 0,
    duration: "Details to follow",
    description:
      "Community services leadership and practice training for case managers, group leaders, and support coordinators.",
    overview:
      "Select Security Training Academy is preparing Diploma of Community Services details, focusing on case management, community development, and service delivery.",
    image:
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Details to follow"],
    entryRequirements: ["Course details to follow"],
    careerOutcomes: ["Case Manager", "Community Worker", "Program Coordinator"],
    unitSummary: "Course details to follow.",
    units: [unit("CHC52021", "Diploma of Community Services")],
    lessons: [],
    availability: "coming-soon",
    priceLabel: "Coming soon",
    statusNote: "Diploma of Community Services details are coming soon.",
  },
  {
    slug: "diploma-accounting",
    code: "Coming soon",
    title: "Diploma of Accounting",
    category: "Accounting & Finance",
    label: "Coming soon",
    priceAud: 0,
    duration: "Details to follow",
    description:
      "Professional accounting education covering financial reports, tax returns, budgeting, and corporate governance.",
    overview:
      "Select Security Training Academy is preparing Diploma of Accounting details, covering advanced accounting procedures, internal control evaluation, and management reports.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Details to follow"],
    entryRequirements: ["Course details to follow"],
    careerOutcomes: ["Assistant Accountant", "Financial Analyst", "Accounts Manager"],
    unitSummary: "Course details to follow.",
    units: [unit("FNS50222", "Diploma of Accounting")],
    lessons: [],
    availability: "coming-soon",
    priceLabel: "Coming soon",
    statusNote: "Diploma of Accounting details are coming soon.",
  },
  {
    slug: "fire-extinguisher-warden-training",
    code: "Coming soon",
    title: "Fire Extinguisher & Fire Warden Training",
    category: "Fire Warden",
    label: "Coming soon",
    priceAud: 0,
    duration: "Details to follow",
    description:
      "Basic fire safety, extinguisher operation, and workplace fire warden compliance procedures.",
    overview:
      "Select Security Training Academy is preparing Fire Extinguisher & Fire Warden Training details, focusing on safe equipment operation, evacuation coordination, and emergency response.",
    image:
      "https://images.unsplash.com/photo-1505489304219-85ce17010209?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Details to follow"],
    entryRequirements: ["Course details to follow"],
    careerOutcomes: ["Workplace Fire Warden", "Safety Committee Member"],
    unitSummary: "Course details to follow.",
    units: [unit("CPPSEC3115", "Carry out basic fire control duties")],
    lessons: [],
    availability: "coming-soon",
    priceLabel: "Coming soon",
    statusNote: "Fire Extinguisher & Fire Warden details are coming soon.",
  },
  {
    slug: "food-safety-auditor",
    code: "Coming soon",
    title: "Food Safety Auditor Course",
    category: "Food Safety",
    label: "Coming soon",
    priceAud: 0,
    duration: "Details to follow",
    description:
      "Advanced food safety auditing education for quality assurance managers, compliance officers, and independent food auditors.",
    overview:
      "Select Security Training Academy is preparing Food Safety Auditor Course details, covering food safety hazard identification, auditing protocols, and reporting frameworks.",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=80",
    externalVideoUrl: "",
    deliveryModes: ["Details to follow"],
    entryRequirements: ["Course details to follow"],
    careerOutcomes: ["Food Safety Auditor", "Quality Assurance Manager"],
    unitSummary: "Course details to follow.",
    units: [unit("FBPFSY5001", "Develop a food safety program")],
    lessons: [],
    availability: "coming-soon",
    priceLabel: "Coming soon",
    statusNote: "Food Safety Auditor details are coming soon.",
  },
];

function applyBakerCourseOverride(course: Course): Course {
  const override = bakerCourseOverrides[course.slug];

  if (!override) {
    return course;
  }

  return {
    ...course,
    ...override,
  };
}

export const courses: Course[] = baseCourses.map(applyBakerCourseOverride);

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function getFeaturedCourse() {
  return courses.find((course) => isCourseAvailableForEnrollment(course)) ?? courses[0];
}

export function getCoursesByCategory(category: string) {
  return courses.filter((course) => course.category === category);
}

export function isCourseAvailableForEnrollment(course: Course) {
  return (course.availability ?? "open") === "open";
}

export function getCoursePriceDisplay(course: Course) {
  return course.priceLabel ?? `$${course.priceAud}`;
}

export function isContactFirstCourse(course: Course) {
  return (course.detailVariant ?? "standard") === "contact-first";
}
