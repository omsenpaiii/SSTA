import { NextRequest, NextResponse } from "next/server";
import { courseCategories, Course } from "@/lib/courses";
import { getCourses } from "@/lib/course-repository";
import { siteInfo } from "@/lib/site-content";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type ChatRequestBody = {
  messages?: ChatMessage[];
  courses?: Course[];
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

type GeminiContent = {
  role: string;
  parts: Array<{ text: string }>;
};

function toGeminiContents(messages: ChatMessage[]) {
  const firstUserIndex = messages.findIndex((message) => message.role === "user");
  const usableMessages = firstUserIndex >= 0 ? messages.slice(firstUserIndex) : messages;

  return usableMessages
    .filter((message) => message.content?.trim())
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));
}

function selectCoursesForPrompt(courses: Course[], latestMessage: string) {
  const message = latestMessage.toLowerCase();
  const categoryMatchers: Array<{ category: string; keywords: string[] }> = [
    { category: "Security", keywords: ["security", "licence", "license", "guard", "crowd", "supervisor", "baton", "handcuff"] },
    { category: "First Aid", keywords: ["first aid", "cpr", "resuscitation", "emergency"] },
    { category: "Work Health & Safety", keywords: ["whs", "white card", "safety", "work health"] },
    { category: "Fire Warden", keywords: ["fire", "warden", "extinguisher"] },
    { category: "Traffic Management", keywords: ["traffic"] },
    { category: "RSA", keywords: ["rsa", "alcohol"] },
    { category: "Food Safety", keywords: ["food"] },
    { category: "Business", keywords: ["business", "leadership", "management"] },
    { category: "Community Services", keywords: ["community", "disability", "support"] },
    { category: "Accounting & Finance", keywords: ["accounting", "finance", "bookkeeping"] },
    { category: "Building & Construction", keywords: ["building", "construction", "carpentry"] },
    { category: "Real Estate", keywords: ["real estate", "property"] },
  ];

  const matchedCategories = categoryMatchers
    .filter(({ keywords }) => keywords.some((keyword) => message.includes(keyword)))
    .map(({ category }) => category);

  if (matchedCategories.length > 0) {
    return courses.filter((course) => matchedCategories.includes(course.category));
  }

  if (message.includes("course") || message.includes("program") || message.includes("enrol") || message.includes("enroll")) {
    return courses.slice(0, 20);
  }

  return courses.slice(0, 12);
}

async function generateGeminiResponse({
  apiKey,
  contents,
  systemInstruction,
}: {
  apiKey: string;
  contents: GeminiContent[];
  systemInstruction: string;
}) {
  const modelCandidates = Array.from(
    new Set([
      process.env.GEMINI_MODEL || "gemini-flash-latest",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash-lite",
      "gemini-2.5-flash",
    ]),
  );
  let lastError = "Gemini API failed";

  for (const modelName of modelCandidates) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`,
        {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            contents,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 700,
            },
          }),
        },
      );

      const geminiPayload = (await geminiResponse.json().catch(() => ({}))) as GeminiResponse;

      if (!geminiResponse.ok) {
        lastError = geminiPayload.error?.message || `Gemini API returned ${geminiResponse.status}`;
        continue;
      }

      const responseText = geminiPayload.candidates
        ?.flatMap((candidate) => candidate.content?.parts ?? [])
        .map((part) => part.text)
        .filter(Boolean)
        .join("\n")
        .trim();

      if (responseText) {
        return { responseText, modelName };
      }

      lastError = `Gemini model ${modelName} returned an empty response`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(lastError);
}

// Post API to handle chatbot assistant conversations
export async function POST(req: NextRequest) {
  let body: ChatRequestBody = {};

  try {
    body = await req.json();
    const { messages, courses: clientCourses } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing or invalid messages history" }, { status: 400 });
    }

    const coursesToUse: Course[] = clientCourses && Array.isArray(clientCourses) && clientCourses.length > 0
      ? clientCourses
      : await getCourses();

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Falling back to SSTA Chatbot Demo Mode.");
      const mockResponse = getMockResponse(messages);
      return NextResponse.json({ text: mockResponse });
    }

    const latestMessage = messages[messages.length - 1].content || "";
    const promptCourses = selectCoursesForPrompt(coursesToUse, latestMessage);
    
    // Format courses list into text for model context
    const coursesListText = promptCourses.map((c: Course) => {
      const priceText = c.priceLabel ?? (c.priceAud === 0 ? "Details to follow/Coming soon" : `$${c.priceAud}`);
      return `- Course: ${c.title} (${c.code || "No Code"})
  - Category: ${c.category}
  - Duration: ${c.duration}
  - Cost: ${priceText}${c.enrolmentFee ? ` (plus $${c.enrolmentFee} enrolment fee)` : ""}
  - Status: ${c.availability === "coming-soon" ? "Coming Soon" : c.availability === "details-to-follow" ? "Details to follow" : "Open for Enrolment"}
  - Description: ${c.description}
  - Career Outcomes: ${(c.careerOutcomes || []).join(", ")}`;
    }).join("\n\n");

    const categoriesListText = courseCategories.map((cat) => `- ${cat.title}: ${cat.description}`).join("\n");

    const systemInstruction = `You are SSTA AI, the helpful, professional, and friendly virtual academic advisor for Select Security Training Academy (SSTA). Your purpose is to guide prospective learners about courses, schedules, costs, and career paths.

Academy Contact Details:
- Academy Name: ${siteInfo.name} (${siteInfo.shortName})
- Phone: ${siteInfo.phone}
- Email: ${siteInfo.email}
- Address: ${siteInfo.address}

Course Categories/Areas:
${categoriesListText}

Active SSTA Courses:
${coursesListText}

Enrolment & trial access guidelines:
1. SSTA stands for Select Security Training Academy.
2. If the user asks about enrolling, explain that they can click the "Enrol Now" button in the header navigation or the "Enrol" button next to any course in the catalog, or visit the direct page "/enroll".
3. If the user is interested in any "Coming Soon" or "Details to follow" courses, explain that these programs are currently in preparation. Advise them to submit their details through the Trial Access / Interest intake form on the SSTA homepage so the academy can contact them as soon as the intake opens.
4. Keep your answers concise, friendly, and structured. Use bullet points for readability. Avoid long-winded paragraphs.
5. If the user asks general or out-of-scope questions unrelated to SSTA, training, or careers in security/first aid/safety, politely steer them back to SSTA course inquiries.`;

    const formattedMessages = toGeminiContents(messages);

    if (formattedMessages.length === 0) {
      return NextResponse.json({ error: "Missing or invalid user message" }, { status: 400 });
    }

    const { responseText, modelName } = await generateGeminiResponse({
      apiKey,
      contents: formattedMessages,
      systemInstruction,
    });

    return NextResponse.json({
      text: responseText,
      source: "gemini",
      model: modelName,
    });
  } catch (error) {
    console.error("Error in SSTA Chatbot API:", error);
    const mockResponse = getMockResponse(body.messages || []);
    return NextResponse.json({ text: mockResponse, source: "fallback" });
  }
}

// Graceful fallback helper for offline/demo/missing-key scenarios
function getMockResponse(messages: ChatMessage[]): string {
  const latestMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

  if (latestMessage.includes("security")) {
    return `SSTA offers several industry-ready security qualifications:
* **Certificate II in Security Operations (CPP20218)**: Our most popular licensing pathway for unarmed guards and crowd controllers. Cost is $1,295 (plus $500 enrolment fee).
* **Certificate III in Security Operations (CPP31318)**: Advanced training for armed guards and cash-in-transit officers. Cost is $2,390.
* **Certificate IV in Security Management (CPP40719)**: For supervisors and business operations. Cost is $2,650.
* **Batons & Handcuffs Skill Set**: Specialist 1-day course for licensed officers ($250).

Would you like details on how to register or the duration of any of these courses?`;
  }

  if (latestMessage.includes("first aid") || latestMessage.includes("cpr")) {
    return `We offer practical emergency-response courses:
* **HLTAID011 Provide First Aid**: 1-day course ($165). Refresher also available.
* **HLTAID009 Provide CPR**: 1-day cardiopulmonary resuscitation training ($70).
* **HLTAID012 Emergency First Aid Response (Child Care)**: 8 hours online study + class ($250).
* **HLTAID014 Provide Advanced First Aid**: 1-day advanced rescue training ($295).
* **HLTAID015 Advanced Resuscitation and Oxygen Therapy**: 1-day specialized equipment training ($350).

You can enrol directly in any of these by clicking the **Enrol Now** button!`;
  }

  if (latestMessage.includes("enrol") || latestMessage.includes("enroll") || latestMessage.includes("register") || latestMessage.includes("sign up")) {
    return `Enrolling in an SSTA course is quick and easy:
1. Click the **Enrol Now** button in the header menu or next to any course in our catalog.
2. Complete the online Enrolment Form at **[ssta.net.au/enroll](/enroll)**.
3. Our academy team will review your application and contact you with confirmation, payment setups, and class schedules.

Let me know if you need help choosing the right training pathway!`;
  }

  if (latestMessage.includes("coming soon") || latestMessage.includes("soon") || latestMessage.includes("carpentry") || latestMessage.includes("disability") || latestMessage.includes("accounting")) {
    return `We have several exciting qualifications coming soon:
* **Certificate III in Carpentry**
* **Diploma of Work Health and Safety**
* **Diploma of Community Services**
* **Diploma of Accounting**
* **Fire Extinguisher & Fire Warden Training**
* **Food Safety Auditor Course**

Since these are in preparation, you can submit your details in the **Trial Access / Interest Intake** popup on our homepage. We will contact you immediately once intake opens!`;
  }

  return `Hello! I am SSTA AI, your academic advisor. I can answer any questions you have about:
* 🛡️ Security licensing and supervisor qualifications
* 🩹 First Aid & CPR certifications
* ⚠️ Work Health & Safety (WHS/White Card) training
* 🚒 Fire Warden, Traffic Management, RSA & Food Safety pathways
* 📈 Business leadership and management diplomas
* 🤝 Upcoming "Coming Soon" courses

How can I help you choose the right training pathway today?`;
}
