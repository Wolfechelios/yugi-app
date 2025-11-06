import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DuelVault - Yu-Gi-Oh! Card Collection Manager",
  description: "AI-powered Yu-Gi-Oh! card collection manager with advanced scanning and organization features. Build, manage, and catalog your card collection with ease.",
  keywords: ["DuelVault", "Yu-Gi-Oh", "card collection", "TCG", "AI scanning", "card management", "trading cards"],
  authors: [{ name: "DuelVault Team" }],
  openGraph: {
    title: "DuelVault - Yu-Gi-Oh! Card Collection Manager",
    description: "AI-powered Yu-Gi-Oh! card collection manager with advanced scanning and organization features",
    url: "https://duelvault.app",
    siteName: "DuelVault",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DuelVault - Yu-Gi-Oh! Card Collection Manager",
    description: "AI-powered Yu-Gi-Oh! card collection manager with advanced scanning and organization features",
  },
};

export const viewport = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
