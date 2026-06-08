// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";

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

export const metadata: Metadata = {
  title: 'The Daily Office',
  description:
    "Daily Bible readings for morning and evening prayer from the St. Paul's Bloor Street Anglican Church lectionary (2025/26)",
  icons: {
    icon: '/church.svg',
    apple: '/icon-192x192.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bible Readings',
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
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
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registered:', registration);
                  },
                  function(err) {
                    console.log('Service Worker registration failed:', err);
                  }
                );
              });
            }
          `}
        </Script>
        <MigrateReadingProgress /> 
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}