import type { Metadata } from "next";
import SmoothScroll from "@/components/providers/SmoothScroll";
import PageTransition from "@/components/providers/PageTransition";
import Header from "@/components/layout/Header";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { Fraunces, Geist, Plus_Jakarta_Sans } from "next/font/google";
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

// Display — hero name, headlines and project titles
const displayFont = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
      className={`${geistSans.variable} ${displayFont.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
          {/* Outside PageTransition: its transform would make `fixed` page-relative. */}
          <LoadingScreen />
          <SmoothScroll>
            <Header />
            <PageTransition>{children}</PageTransition>
          </SmoothScroll>
        </body>
    </html>
  );
}
