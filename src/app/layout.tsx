import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SSTA | Select Security Training Academy",
  description:
    "Training courses from Select Security Training Academy across security, first aid, construction and more.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { Chatbot } from "@/components/Chatbot";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
