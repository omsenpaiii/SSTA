"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  DollarSign, 
  Settings, 
  Plus, 
  Trash2, 
  RotateCcw, 
  LogOut, 
  ShieldAlert,
  Save,
  CheckCircle,
  Play,
  ArrowLeft,
  Coins
} from "lucide-react";
import { courses as defaultCourses, Course, CourseLesson } from "@/lib/courses";

type LessonProvider = CourseLesson["videoProvider"];

function slugifyTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStoredCourses() {
  if (typeof window === "undefined") {
    return defaultCourses;
  }

  const stored = localStorage.getItem("ssta_courses");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as Course[];
      }
    } catch {
      return defaultCourses;
    }
  }

  localStorage.setItem("ssta_courses", JSON.stringify(defaultCourses));
  return defaultCourses;
}

function getInitialCourseSlug() {
  return getStoredCourses()[0]?.slug ?? defaultCourses[0]?.slug ?? "";
}

function getInitialAdminLogin() {
  return true;
}

export default function AdminPage() {
  // Authentication state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(getInitialAdminLogin);
  const [loginError, setLoginError] = useState("");

  // DB management state
  const [courses, setCourses] = useState<Course[]>(getStoredCourses);
  const [activeTab, setActiveTab] = useState<"dashboard" | "add-course" | "lessons" | "discounts" | "settings">("dashboard");

  // Notifications state
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Add course form state
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseSlug, setNewCourseSlug] = useState("");
  const [newCourseLabel, setNewCourseLabel] = useState("New Cohort");
  const [newCoursePrice, setNewCoursePrice] = useState("100");
  const [newCourseDuration, setNewCourseDuration] = useState("6 modules");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseImage, setNewCourseImage] = useState("https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80");

  // Lesson manage state
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(getInitialCourseSlug);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("10:00");
  const [newLessonProvider, setNewLessonProvider] = useState<LessonProvider>("youtube");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState("");
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(true);

  // Discount state
  const [discountCourseSlug, setDiscountCourseSlug] = useState(getInitialCourseSlug);
  const [discountPercent, setDiscountPercent] = useState("10");

  // Sync to localstorage
  const saveCoursesToStorage = (updated: Course[]) => {
    setCourses(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("ssta_courses", JSON.stringify(updated));
    }
  };

  // Helper to trigger message
  const triggerNotification = (type: "success" | "error", msg: string) => {
    if (type === "success") {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(""), 4000);
    } else {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(""), 4000);
    }
  };

  const handleNewCourseTitleChange = (value: string) => {
    setNewCourseTitle(value);
    setNewCourseSlug(slugifyTitle(value));
  };

  // Handle static credentials login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const adminEmail = process.env.NEXT_PUBLIC_SSTA_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_SSTA_ADMIN_PASSWORD;

    if (adminEmail && adminPassword && email.trim() === adminEmail && password === adminPassword) {
      setIsLoggedIn(true);
      sessionStorage.setItem("ssta_admin_logged", "true");
      triggerNotification("success", "Welcome back, SSTA Admin!");
    } else {
      setLoginError("Invalid admin email or password.");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem("ssta_admin_logged");
  };

  // Add course action
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseSlug || !newCoursePrice || !newCourseDesc) {
      triggerNotification("error", "Please fill in all required fields.");
      return;
    }

    // Check slug collision
    if (courses.some(c => c.slug === newCourseSlug)) {
      triggerNotification("error", "A course with this URL slug already exists.");
      return;
    }

    const price = parseFloat(newCoursePrice);
    if (isNaN(price)) {
      triggerNotification("error", "Price must be a valid number.");
      return;
    }

    const newCourse: Course = {
      slug: newCourseSlug,
      title: newCourseTitle,
      code: "SSTA",
      category: "Security",
      label: newCourseLabel,
      priceAud: price,
      duration: newCourseDuration,
      description: newCourseDesc,
      overview: newCourseDesc,
      image: newCourseImage,
      externalVideoUrl: "",
      deliveryModes: ["Face to face", "Online", "Blended"],
      entryRequirements: ["Contact SSTA for entry requirements."],
      careerOutcomes: ["Security industry pathway"],
      unitSummary: "Units to be confirmed by SSTA.",
      units: [],
      lessons: []
    };

    const updated = [...courses, newCourse];
    saveCoursesToStorage(updated);
    triggerNotification("success", `Successfully created course "${newCourseTitle}"!`);
    
    // Clear state
    setNewCourseTitle("");
    setNewCourseDesc("");
    setNewCoursePrice("100");
    setNewCourseDuration("6 modules");
    setActiveTab("dashboard");
  };

  // Delete course action
  const handleDeleteCourse = (slug: string, title: string) => {
    if (confirm(`Are you absolutely sure you want to delete the course "${title}"? This action cannot be undone.`)) {
      const updated = courses.filter(c => c.slug !== slug);
      saveCoursesToStorage(updated);
      triggerNotification("success", `Deleted course "${title}".`);
    }
  };

  // Add lesson action
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseSlug || !newLessonTitle || !newLessonVideoUrl) {
      triggerNotification("error", "Lesson title and video URL are required.");
      return;
    }

    const targetCourse = courses.find(c => c.slug === selectedCourseSlug);
    if (!targetCourse) {
      triggerNotification("error", "Target course not found.");
      return;
    }

    const rawId = newLessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const lessonId = `${rawId}-${Date.now().toString().slice(-4)}`;

    const newLesson: CourseLesson = {
      id: lessonId,
      title: newLessonTitle,
      duration: newLessonDuration,
      isPreview: newLessonIsPreview,
      videoProvider: newLessonProvider,
      videoUrl: newLessonVideoUrl
    };

    const updated = courses.map(c => {
      if (c.slug === selectedCourseSlug) {
        return {
          ...c,
          lessons: [...(c.lessons || []), newLesson],
          // Update total modules label automatically
          duration: `${(c.lessons || []).length + 1} modules`
        };
      }
      return c;
    });

    saveCoursesToStorage(updated);
    triggerNotification("success", `Added lesson "${newLessonTitle}" to ${targetCourse.title}!`);

    // Reset fields
    setNewLessonTitle("");
    setNewLessonVideoUrl("");
    setNewLessonDuration("10:00");
  };

  // Delete lesson action
  const handleDeleteLesson = (courseSlug: string, lessonId: string, lessonTitle: string) => {
    if (confirm(`Delete the lesson "${lessonTitle}"?`)) {
      const updated = courses.map(c => {
        if (c.slug === courseSlug) {
          const nextLessons = c.lessons.filter(l => l.id !== lessonId);
          return {
            ...c,
            lessons: nextLessons,
            duration: `${nextLessons.length} modules`
          };
        }
        return c;
      });
      saveCoursesToStorage(updated);
      triggerNotification("success", `Removed lesson "${lessonTitle}".`);
    }
  };

  // Apply discount or edit price action
  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const percent = parseInt(discountPercent);
    if (isNaN(percent) || percent < 0 || percent > 100) {
      triggerNotification("error", "Discount must be between 0% and 100%.");
      return;
    }

    const updated = courses.map(c => {
      if (c.slug === discountCourseSlug) {
        const discountedPrice = Math.round(c.priceAud * (1 - percent / 100));
        return {
          ...c,
          priceAud: discountedPrice,
          label: percent > 0 ? `${percent}% OFF` : "Best Seller"
        };
      }
      return c;
    });

    saveCoursesToStorage(updated);
    triggerNotification("success", `Applied ${percent}% discount to selected course!`);
  };

  // Database seed reset
  const handleResetDatabase = () => {
    if (confirm("Reset SSTA course catalogue back to clean official defaults? This will erase all custom added courses, discounts, and custom video uploads.")) {
      saveCoursesToStorage(defaultCourses);
      triggerNotification("success", "SSTA database completely restored to pristine defaults.");
      setSelectedCourseSlug(defaultCourses[0].slug);
      setDiscountCourseSlug(defaultCourses[0].slug);
      setActiveTab("dashboard");
    }
  };

  // Aggregated Stats
  const totalCourses = courses.length;
  const totalLessons = courses.reduce((sum, c) => sum + (c.lessons?.length || 0), 0);
  const averagePrice = Math.round(courses.reduce((sum, c) => sum + c.priceAud, 0) / (courses.length || 1));

  // Access check
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 px-5 relative overflow-hidden">
        {/* Harmonious premium gradients */}
        <div className="absolute top-[-10%] right-[-5%] h-[500px] w-[500px] rounded-full bg-[#18aee5]/15 blur-3xl -z-10" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[#f5b800]/10 blur-3xl -z-10" />

        <div className="w-full max-w-md">
          {/* SSTA Header link back */}
          <div className="mb-6 flex justify-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition">
              <ArrowLeft size={14} /> Back to SSTA home page
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-[0_32px_100px_rgba(0,103,177,0.18)] backdrop-blur-xl">
            <div className="flex flex-col items-center text-center mb-8">
              <span className="relative block size-16 shrink-0 overflow-hidden rounded-full bg-white p-1 border-2 border-[#0067b1] shadow-md mb-4">
                <Image
                  src="/ssta-logo.jpg"
                  alt="SSTA logo"
                  fill
                  sizes="64px"
                  className="object-contain"
                />
              </span>
              <h1 className="text-2xl font-black text-white tracking-wide">SSTA ADMIN GATE</h1>
              <p className="text-sm font-semibold text-slate-400 mt-2">
                Sign in with static credentials to access catalogue manager
              </p>
            </div>

            {loginError && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm font-bold text-rose-400">
                <ShieldAlert className="shrink-0 text-rose-400" size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="email">
                  Admin Email
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ssta.net.au"
                    className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="password">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-12 pl-11 pr-12 rounded-2xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-[#0067b1] hover:bg-[#123e95] active:scale-[0.98] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition shadow-lg shadow-[#0067b1]/20 mt-4 cursor-pointer"
              >
                Authenticate Gate
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Visual top border line */}
      <div className="h-1 bg-gradient-to-r from-[#0067b1] via-[#18aee5] to-[#f5b800]" />

      {/* Floating success and error notifications */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {successMsg && (
          <div className="flex items-center gap-3 bg-emerald-500 border border-emerald-600 text-white font-bold text-sm px-6 py-4 rounded-2xl shadow-xl animate-bounce">
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-3 bg-rose-500 border border-rose-600 text-white font-bold text-sm px-6 py-4 rounded-2xl shadow-xl animate-pulse">
            <ShieldAlert size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Admin Panel Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-white shadow border border-slate-100">
              <Image
                src="/ssta-logo.jpg"
                alt="SSTA logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </Link>
            <div>
              <p className="text-sm font-black tracking-widest text-[#18aee5] uppercase">SSTA ADMIN</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SELECT SECURITY ACADEMY</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-xs font-bold bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl hover:bg-white/10 transition text-slate-300"
            >
              Public SSTA Site
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-xs font-black bg-rose-500/10 border border-rose-500/20 px-4 py-2.5 rounded-xl hover:bg-rose-500 hover:text-white transition text-rose-400 cursor-pointer"
            >
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 flex-1 w-full grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        {/* Sidebar tabs */}
        <aside className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-3 lg:pb-0 lg:space-y-1 hide-scrollbar sticky top-20 z-30 bg-slate-950/90 backdrop-blur-md lg:bg-transparent -mx-5 px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0 scroll-smooth shrink-0">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`whitespace-nowrap lg:w-full shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#0067b1] text-white shadow-lg shadow-[#0067b1]/18"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard size={18} /> Catalog Dashboard
          </button>
          <button
            onClick={() => setActiveTab("add-course")}
            className={`whitespace-nowrap lg:w-full shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition cursor-pointer ${
              activeTab === "add-course"
                ? "bg-[#0067b1] text-white shadow-lg shadow-[#0067b1]/18"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Plus size={18} /> Create New Course
          </button>
          <button
            onClick={() => setActiveTab("lessons")}
            className={`whitespace-nowrap lg:w-full shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition cursor-pointer ${
              activeTab === "lessons"
                ? "bg-[#0067b1] text-white shadow-lg shadow-[#0067b1]/18"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Video size={18} /> Uploads & Lessons
          </button>
          <button
            onClick={() => setActiveTab("discounts")}
            className={`whitespace-nowrap lg:w-full shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition cursor-pointer ${
              activeTab === "discounts"
                ? "bg-[#0067b1] text-white shadow-lg shadow-[#0067b1]/18"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <DollarSign size={18} /> Costs & Discounts
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`whitespace-nowrap lg:w-full shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black transition cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#0067b1] text-white shadow-lg shadow-[#0067b1]/18"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Settings size={18} /> Reset Database
          </button>
        </aside>

        {/* Dashboard Core Content Area */}
        <section className="space-y-8 min-w-0">
          
          {/* TAB 1: DASHBOARD METRICS & LIST */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white">CATALOGUE DASHBOARD</h1>
                <p className="text-slate-400 font-semibold mt-1">
                  Overview of Select Security Training Academy courses and lesson modules
                </p>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-[#0067b1]/20 flex items-center justify-center text-[#18aee5]">
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Courses</p>
                    <p className="text-3xl font-black text-white mt-0.5">{totalCourses}</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-[#f5b800]/20 flex items-center justify-center text-[#f5b800]">
                    <Video size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lessons Configured</p>
                    <p className="text-3xl font-black text-white mt-0.5">{totalLessons}</p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Coins size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Course Price</p>
                    <p className="text-3xl font-black text-white mt-0.5">${averagePrice} AUD</p>
                  </div>
                </div>
              </div>

              {/* Course rows */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <h2 className="text-lg font-black text-white">Active SSTA Courses</h2>
                  <button
                    onClick={() => setActiveTab("add-course")}
                    className="inline-flex items-center gap-1 bg-[#0067b1] hover:bg-[#123e95] px-3.5 py-2 rounded-xl font-bold text-xs text-white transition cursor-pointer"
                  >
                    <Plus size={14} /> Add New
                  </button>
                </div>

                <div className="divide-y divide-white/5">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <div key={course.slug} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.01] transition">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="size-16 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative border border-white/10">
                            <Image
                              src={course.image}
                              alt={course.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-black text-white text-lg truncate leading-snug">{course.title}</h3>
                              <span className="bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase text-[#18aee5] tracking-wider">
                                {course.label}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wide">
                              URL Slug: <span className="text-slate-400">{course.slug}</span> | Duration: <span className="text-slate-400">{course.duration}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 justify-between md:justify-end shrink-0">
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-500">Price (AUD)</p>
                            <p className="text-xl font-black text-white mt-0.5">${course.priceAud}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCourseSlug(course.slug);
                                setActiveTab("lessons");
                              }}
                              className="bg-white/5 border border-white/10 p-2.5 rounded-xl hover:bg-[#0067b1] hover:border-transparent hover:text-white text-slate-400 transition cursor-pointer"
                              title="Manage Lessons"
                            >
                              <Video size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setDiscountCourseSlug(course.slug);
                                setActiveTab("discounts");
                              }}
                              className="bg-white/5 border border-white/10 p-2.5 rounded-xl hover:bg-[#f5b800] hover:border-transparent hover:text-slate-950 text-slate-400 transition cursor-pointer"
                              title="Costs & Discounts"
                            >
                              <DollarSign size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.slug, course.title)}
                              className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl hover:bg-rose-500 hover:text-white text-rose-400 transition cursor-pointer"
                              title="Delete Course"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-slate-500 font-bold">No active courses. Seed the catalog back to default in settings.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CREATE NEW COURSE */}
          {activeTab === "add-course" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white font-sans uppercase">Create New Training Course</h1>
                <p className="text-slate-400 font-semibold mt-1">
                  Fill in details below to publish a brand-new professional training course to SSTA
                </p>
              </div>

              <form onSubmit={handleAddCourse} className="bg-slate-900 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="course-title">
                      Course Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="course-title"
                      type="text"
                      required
                      value={newCourseTitle}
                      onChange={(e) => handleNewCourseTitleChange(e.target.value)}
                      placeholder="e.g. Crowd Control Basics"
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                    />
                  </div>

                  {/* Slug */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="course-slug">
                      URL Slug (Auto-Generated) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="course-slug"
                      type="text"
                      required
                      value={newCourseSlug}
                      onChange={(e) => setNewCourseSlug(e.target.value)}
                      placeholder="e.g. crowd-control-basics"
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                    />
                  </div>

                  {/* Label / Badge */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="course-label">
                      Promo Tag / Category
                    </label>
                    <select
                      id="course-label"
                      value={newCourseLabel}
                      onChange={(e) => setNewCourseLabel(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-slate-950 text-white font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                    >
                      <option value="New Cohort">New Cohort</option>
                      <option value="Most Popular">Most Popular</option>
                      <option value="Practical">Practical</option>
                      <option value="Special Offer">Special Offer</option>
                      <option value="Best Seller">Best Seller</option>
                    </select>
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="course-price">
                      Cost Price (AUD $) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      id="course-price"
                      type="number"
                      required
                      min="0"
                      value={newCoursePrice}
                      onChange={(e) => setNewCoursePrice(e.target.value)}
                      placeholder="100"
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                    />
                  </div>

                  {/* Duration Modules */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="course-duration">
                      Course Duration Tag
                    </label>
                    <input
                      id="course-duration"
                      type="text"
                      value={newCourseDuration}
                      onChange={(e) => setNewCourseDuration(e.target.value)}
                      placeholder="e.g. 6 modules"
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                    />
                  </div>

                  {/* Thumbnail image */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="course-image">
                      Thumbnail Image URL
                    </label>
                    <input
                      id="course-image"
                      type="url"
                      value={newCourseImage}
                      onChange={(e) => setNewCourseImage(e.target.value)}
                      placeholder="Image URL"
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                    />
                  </div>

                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="course-desc">
                    Short Description <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    id="course-desc"
                    required
                    rows={4}
                    value={newCourseDesc}
                    onChange={(e) => setNewCourseDesc(e.target.value)}
                    placeholder="Provide a compelling course description..."
                    className="w-full p-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                  />
                </div>

                <div className="flex gap-4 pt-4 justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab("dashboard")}
                    className="h-12 px-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 font-black text-xs uppercase tracking-wider text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-12 px-8 bg-[#0067b1] hover:bg-[#123e95] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-[#0067b1]/20 cursor-pointer flex items-center gap-2"
                  >
                    <Save size={16} /> Publish Course
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: MANAGE LESSONS */}
          {activeTab === "lessons" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase">Uploads & Lesson Modules</h1>
                <p className="text-slate-400 font-semibold mt-1">
                  Add video lectures or delete course modules dynamically.
                </p>
              </div>

              {/* Course selector */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-sm space-y-4">
                <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="selected-course">
                  Select SSTA Course to Manage
                </label>
                <select
                  id="selected-course"
                  value={selectedCourseSlug}
                  onChange={(e) => setSelectedCourseSlug(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-white/10 bg-slate-950 text-white font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                >
                  {courses.map(c => (
                    <option key={c.slug} value={c.slug}>{c.title}</option>
                  ))}
                </select>
              </div>

              {selectedCourseSlug && (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
                  
                  {/* Current lessons list */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                      <h2 className="text-lg font-black text-white">Active Modules in Course</h2>
                    </div>

                    <div className="divide-y divide-white/5">
                      {courses.find(c => c.slug === selectedCourseSlug)?.lessons?.length ? (
                        courses.find(c => c.slug === selectedCourseSlug)?.lessons.map((lesson, idx) => (
                          <div key={lesson.id} className="p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className={`size-10 rounded-full shrink-0 flex items-center justify-center ${lesson.isPreview ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                                {lesson.isPreview ? <Play size={16} fill="currentColor" /> : <Lock size={16} />}
                              </div>
                              <div>
                                <h4 className="font-bold text-white text-base">{idx + 1}. {lesson.title}</h4>
                                <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase">
                                  Provider: <span className="text-[#18aee5]">{lesson.videoProvider}</span> | Duration: <span className="text-slate-400">{lesson.duration}</span>
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteLesson(selectedCourseSlug, lesson.id, lesson.title)}
                              className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg hover:bg-rose-500 hover:text-white text-rose-400 transition cursor-pointer shrink-0"
                              title="Delete Lesson"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-slate-500 font-bold">
                          No lessons uploaded for this course yet. Add one in the sidebar!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add lesson form */}
                  <form onSubmit={handleAddLesson} className="bg-slate-900 border border-white/5 rounded-2xl p-6 shadow-sm space-y-5">
                    <h3 className="text-lg font-black text-white uppercase">Add New Lesson</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="lesson-title">
                        Lesson Title
                      </label>
                      <input
                        id="lesson-title"
                        type="text"
                        required
                        value={newLessonTitle}
                        onChange={(e) => setNewLessonTitle(e.target.value)}
                        placeholder="e.g. Intro to Operations"
                        className="w-full h-11 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-semibold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="lesson-dur">
                        Duration Tag
                      </label>
                      <input
                        id="lesson-dur"
                        type="text"
                        required
                        value={newLessonDuration}
                        onChange={(e) => setNewLessonDuration(e.target.value)}
                        placeholder="e.g. 05:30"
                        className="w-full h-11 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-semibold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="lesson-prov">
                        Video Platform
                      </label>
                      <select
                        id="lesson-prov"
                        value={newLessonProvider}
                        onChange={(e) => setNewLessonProvider(e.target.value as LessonProvider)}
                        className="w-full h-11 px-4 rounded-xl border border-white/10 bg-slate-950 text-white font-semibold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-sm"
                      >
                        <option value="youtube">YouTube Embed Link</option>
                        <option value="google-drive">Google Drive Link</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider" htmlFor="lesson-url">
                        Platform Sharing URL
                      </label>
                      <input
                        id="lesson-url"
                        type="url"
                        required
                        value={newLessonVideoUrl}
                        onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                        placeholder="Copy-paste link here..."
                        className="w-full h-11 px-4 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-semibold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-sm"
                      />
                    </div>

                    {/* Preview Flag checkbox */}
                    <div className="flex items-center gap-3 py-1">
                      <input
                        id="lesson-preview"
                        type="checkbox"
                        checked={newLessonIsPreview}
                        onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                        className="size-5 border-white/10 bg-slate-950 text-[#0067b1] rounded focus:ring-1 focus:ring-[#18aee5]"
                      />
                      <label className="text-sm font-black text-slate-300" htmlFor="lesson-preview">
                        Free Sample Lesson Preview
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 bg-[#0067b1] hover:bg-[#123e95] text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow shadow-[#0067b1]/18 cursor-pointer mt-2"
                    >
                      Upload Module
                    </button>
                  </form>

                </div>
              )}
            </div>
          )}

          {/* TAB 4: COSTS & DISCOUNTS */}
          {activeTab === "discounts" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase font-sans">Costs & Active Discounts</h1>
                <p className="text-slate-400 font-semibold mt-1">
                  Adjust course pricing and apply quick percentage discount tags
                </p>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
                <form onSubmit={handleApplyDiscount} className="space-y-6">
                  
                  {/* Select course */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="discount-course">
                      Choose Course to Adjust
                    </label>
                    <select
                      id="discount-course"
                      value={discountCourseSlug}
                      onChange={(e) => setDiscountCourseSlug(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-white/10 bg-slate-950 text-white font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                    >
                      {courses.map(c => (
                        <option key={c.slug} value={c.slug}>{c.title} (${c.priceAud} AUD)</option>
                      ))}
                    </select>
                  </div>

                  {/* Choose discount % */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-300 uppercase tracking-widest" htmlFor="discount-pct">
                      Percentage Discount to Apply (%)
                    </label>
                    <div className="relative">
                      <input
                        id="discount-pct"
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        placeholder="15"
                        className="w-full h-12 px-4 pr-12 rounded-xl border border-white/10 bg-slate-950 text-white placeholder-slate-600 font-bold focus:border-[#18aee5] focus:outline-none focus:ring-1 focus:ring-[#18aee5] text-base"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-500">%</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      Applying a discount will automatically recalculate SSTA pricing and visual sale badges. Setting this to 0% resets price to base.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 bg-[#0067b1] hover:bg-[#123e95] text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow-lg shadow-[#0067b1]/18 cursor-pointer mt-4"
                  >
                    Apply Dynamic Pricing
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white uppercase">Database Settings</h1>
                <p className="text-slate-400 font-semibold mt-1">
                  Restore pristine default states or reset security certifications
                </p>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 sm:p-8 max-w-2xl shadow-sm space-y-6">
                <div className="flex items-start gap-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 text-amber-400 text-sm font-bold">
                  <ShieldAlert className="shrink-0 text-amber-400" size={22} />
                  <div>
                    <h4 className="font-black text-white text-base">Warning: Database Seed Actions</h4>
                    <p className="text-xs font-semibold text-amber-500/80 mt-1">
                      Resetting the database will instantly overwrite all local storage course, discount, and lesson changes, seeding SSTA back to clean original academy listings. This cannot be undone.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleResetDatabase}
                    className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider px-6 py-4 rounded-xl shadow-lg shadow-rose-600/25 transition cursor-pointer"
                  >
                    <RotateCcw size={16} /> Restore SSTA Pristine Defaults
                  </button>
                </div>
              </div>
            </div>
          )}

        </section>
      </div>

      {/* Dynamic SSTA Admin Footer */}
      <footer className="border-t border-white/5 py-6 bg-slate-950 text-center text-xs font-bold text-slate-600 mt-auto">
        <p>© {new Date().getFullYear()} SSTA Security Academy Admin Panel. Level 1 Security Gateway.</p>
      </footer>
    </main>
  );
}
