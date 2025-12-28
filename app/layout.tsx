import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HFree - Wedding Industry Freelancer Platform",
    template: "%s | HFree",
  },
  description:
    "Connect with verified wedding photographers, videographers, and specialists. HFree makes hiring wedding professionals easy, efficient, and professional. First 100 users get 1 year FREE!",
  keywords: [
    "wedding photographers",
    "wedding videographers",
    "freelance wedding professionals",
    "hire wedding specialists",
    "wedding industry platform",
    "wedding freelancers India",
    "photography jobs",
    "videography jobs",
    "HFree",
  ],
  authors: [{ name: "HFree" }],
  creator: "HFree",
  publisher: "HFree",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hfree.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "HFree",
    title: "HFree - Connecting Wedding Professionals",
    description:
      "The platform connecting wedding companies with verified photographers, videographers & specialists. Fast, efficient, and professional hiring. First 100 users get 1 year FREE!",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "HFree - Wedding Industry Freelancer Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HFree - Connecting Wedding Professionals",
    description:
      "Connect with verified wedding photographers, videographers & specialists. First 100 users get 1 year FREE!",
    creator: "@hfree",
    images: ["/twitter-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          {children}
          <Toaster />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
