import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

// Temporary migration component
import MigrateReadingProgress from "./components/MigrateReadingProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Daily Prayer Readings',
  description:
    "Daily Bible readings for morning and evening prayer from the St. Paul's Bloor Street Anglican Church lectionary (2025)",
  icons: {
    icon: '/church.svg',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MigrateReadingProgress /> 
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
