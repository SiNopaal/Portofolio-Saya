import type { Metadata, Viewport } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const siteUrl = "https://naufalmauu.software";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Naufal Maulana Izzuddin — Frontend Engineer & AI Automations",
    template: "%s | Naufal Maulana",
  },
  description:
    "Naufal Maulana Izzuddin is a Frontend Engineer, UI/UX Designer, and AI Automation Developer from Indonesia specializing in modern web interfaces, responsive design systems, and autonomous bot workflows.",
  keywords: [
    "Naufal Maulana Izzuddin",
    "Frontend Engineer",
    "UI/UX Designer",
    "AI Automations",
    "Next.js",
    "React",
    "TypeScript",
    "TailwindCSS",
    "Figma",
    "Indonesia",
    "Software Engineer",
  ],
  authors: [{ name: "Naufal Maulana Izzuddin", url: siteUrl }],
  creator: "Naufal Maulana Izzuddin",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Naufal Maulana Izzuddin — Frontend Engineer & AI Automations",
    description:
      "Architecting fluid web interfaces, responsive design systems, and AI-powered automations.",
    siteName: "Naufal Maulana Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Naufal Maulana Izzuddin — Frontend Engineer & AI Automations",
    description:
      "Architecting fluid web interfaces, responsive design systems, and AI-powered automations.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0e18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${kanit.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0b0e18] text-slate-100 overflow-x-hidden selection:bg-cyan-500 selection:text-black">
        {children}
        <div className="noise-overlay opacity-[0.015]" aria-hidden />
      </body>
    </html>
  );
}
