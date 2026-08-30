import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { MobileNav } from "@/components/mobile-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Form / Function — Personal Workout Guide", template: "%s | Form / Function" },
  description: "A fast, practical workout plan and exercise encyclopedia built for the gym floor.",
  applicationName: "Form / Function",
  keywords: ["workout plan", "exercise guide", "gym program", "exercise alternatives", "progressive overload"],
  openGraph: {
    title: "Form / Function — Personal Workout Guide",
    description: "Your weekly workout, exercise form guides, alternatives, and progress tools in one fast gym companion.",
    type: "website",
    siteName: "Form / Function",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} dark h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <SiteHeader />
        {children}
        <SiteFooter />
        <MobileNav />
      </body>
    </html>
  );
}
