import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NexusAI - Enterprise Agentic RAG Platform",
  description:
    "Production-grade, modular, asynchronous platform for AI agents and Retrieval-Augmented Generation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-surface text-on-surface flex overflow-hidden">
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Viewport container */}
        <div className="flex-grow flex flex-col h-full overflow-hidden">
          {/* Topbar action panel */}
          <Topbar />

          {/* Page view container */}
          <main className="flex-grow overflow-y-auto custom-scrollbar bg-surface p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
