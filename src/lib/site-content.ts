import { courseCategories, courses } from "@/lib/courses";

export const siteInfo = {
  name: "Select Security Training Academy",
  shortName: "SSTA",
  rto: "RTO Code: 40873",
  email: "admin@ssta.net.au",
  phone: "+61 0431 696 558",
  phoneHref: "tel:+610431696558",
  address: "Level 1, 1287 North Road, Huntingdale 3166",
};

export const primaryLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about-us" },
  { label: "Courses", href: "/courses" },
  { label: "Contact", href: "/contact" },
];

export const courseMenu = courseCategories.map((category) => ({
  ...category,
  courses: courses.filter((course) => course.category === category.title),
}));

export const benefits = [
  {
    title: "Industry-experienced instructors",
    text: "Learn from trainers who understand security sites, client expectations, compliance duties, and real-world workplace pressure.",
  },
  {
    title: "Career pathway support",
    text: "Get clear next steps for licensing outcomes, refresher requirements, course progression, and enrolment readiness.",
  },
  {
    title: "Easy-to-follow courses",
    text: "SSTA course pages keep fees, duration, entry requirements, units and delivery modes visible before a student commits.",
  },
  {
    title: "Accredited training focus",
    text: "Programs are presented around nationally recognised units, practical expectations, and transparent assessment pathways.",
  },
  {
    title: "Blended learning options",
    text: "Support face-to-face, online, RPL and blended modes depending on course suitability and student needs.",
  },
  {
    title: "Practical readiness",
    text: "Preview lessons and course details prepare students for workplace scenarios before they unlock the complete course.",
  },
];

export const faqs = [
  {
    question: "How do I start a security course with SSTA?",
    answer:
      "Choose the course that matches your goal, complete the enrolment form, and SSTA will guide you through payment, access and any licensing-related requirements.",
  },
  {
    question: "Can students preview training before payment?",
    answer:
      "Yes. Course pages include one unlocked preview lesson. Full lesson access is unlocked after login and successful payment.",
  },
  {
    question: "What delivery modes are available?",
    answer:
      "Course delivery can include face-to-face, online, Recognition of Prior Learning and blended learning, depending on the program.",
  },
  {
    question: "Where is SSTA located?",
    answer: siteInfo.address,
  },
];

export const testimonials = [
  {
    name: "Future SSTA Student",
    quote:
      "The course structure is clear: fees, entry requirements, preview lessons and the units are all easy to understand before enrolling.",
  },
  {
    name: "Security Learner",
    quote:
      "The training pathway feels practical and focused on what security officers actually need on site.",
  },
  {
    name: "Career Starter",
    quote:
      "Having the first video available before payment made the course feel transparent and easier to trust.",
  },
];
