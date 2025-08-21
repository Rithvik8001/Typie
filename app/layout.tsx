import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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
    default: "Typie — Minimal Typing Test",
    template: "%s • Typie",
  },
  description:
    "A clean, accessible typing test with live WPM, accuracy, and Supabase-backed results.",
  applicationName: "Typie",
  keywords: [
    "typing test",
    "wpm",
    "accuracy",
    "next.js",
    "supabase",
    "shadcn",
    "tailwind",
  ],
  authors: [{ name: "Typie" }],
  openGraph: {
    title: "Typie — Minimal Typing Test",
    description:
      "Practice speed and accuracy with a clean, focused typing experience.",
    url: "https://typie.app",
    siteName: "Typie",
    images: [],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Typie — Minimal Typing Test",
    description:
      "Practice speed and accuracy with a clean, focused typing experience.",
    images: [],
    creator: "@typie_app",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
