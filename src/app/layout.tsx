import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MyVegMarket",
  description: "Dubai's Premium Sourcing Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Material Symbols */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-[#111713] min-h-screen flex flex-col`}
      >
        {/* ✅ Global Navbar (fixed) */}
        <Navbar />

        {/* ✅ This padding pushes all pages below fixed Navbar */}
        <div className="pt-[76px] flex-1">{children}</div>

        {/* ✅ Global Footer */}
        <Footer />
      </body>
    </html>
  );
}
