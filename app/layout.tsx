import type { Metadata } from "next";
import SmoothScroll from "@/components/providers/SmoothScroll";
import PageTransition from "@/components/providers/PageTransition";
import Header from "@/components/layout/Header";
import { Fraunces, Geist, Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Body — already in the project
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Secondary — labels, nav, metadata. Variable font with the optical-size
// axis, so small labels get the crisper low-opsz cut automatically.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});

// Display — geometric sans stand-in for PP Neue Montreal
// TODO: visit https://monof-template.webflow.io/ in DevTools → Computed → font-family
//       to confirm the exact typeface, then swap this out if needed.
const displayFont = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Keep Geist Mono available for shadcn internals
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eric — Designer & Engineer",
  description: "Portfolio of Eric, designer and software engineer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displayFont.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          <SmoothScroll>
            <Header />
            <PageTransition>{children}</PageTransition>
          </SmoothScroll>
        </body>
    </html>
  );
}
