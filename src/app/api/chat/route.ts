import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { courseCategories, courses as defaultCourses, Course } from "@/lib/courses";
import { siteInfo } from "@/lib/site-content";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Post API to handle chatbot assistant conversations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, courses: clientCourses } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing or invalid messages history" }, { status: 400 });
    }

    const coursesToUse: Course[] = clientCourses && Array.isArray(clientCourses) && clientCourses.length > 0
      ? clientCourses
      : defaultCourses;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. Falling back to SSTA Chatbot Demo Mode.");
      const mockResponse = getMockResponse(messages);
      return NextResponse.json({ text: mockResponse });
    }

    // Initialize Gemini API Client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Format courses list into text for model context
    const coursesListText = coursesToUse.map((c: Course) => {
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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
    });

    // Format messages history for Gemini API
    const formattedHistory = messages.slice(0, -1).map((msg: ChatMessage) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const latestMessage = messages[messages.length - 1].content;

    // Start chat session with formatted history
    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(latestMessage);
    const responseText = result.response.text();

    return NextResponse.json({ text: responseText });
  } catch (error) {
    console.error("Error in SSTA Chatbot API:", error);
    // Graceful fallback to mock responses on API failure
    try {
      const body = await req.json().catch(() => ({}));
      const mockResponse = getMockResponse(body.messages || []);
      return NextResponse.json({ text: mockResponse });
    } catch {
      return NextResponse.json({
        text: "I apologize, but I am having trouble connecting to my knowledge base right now. Please feel free to email our team at admin@ssta.net.au for course details!"
      });
    }
  }
}

// Graceful fallback helper for offline/demo/missing-key scenarios
function getMockResponse(messages: ChatMessage[]): string {
  const latestMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";

  if (latestMessage.includes("security")) {
    return `SSTA offers several industry-ready security qualifications:
* **Certificate II in Security Operations (CPP20218)**: Our most popular licensing pathway for unarmed guards and crowd controllers. Cost is $1,195 (plus $500 enrolment fee).
* **Certificate III in Security Operations (CPP31318)**: Advanced training for armed guards and cash-in-transit officers. Cost is $2,840.
* **Certificate IV in Security Management (CPP40719)**: For supervisors and business operations. Cost is $2,650.
* **Batons & Handcuffs Skill Set**: Specialist 1-day course for licensed officers ($450).

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
