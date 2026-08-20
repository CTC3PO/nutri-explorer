import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "NutriVision AI | Multimodal Food Intelligence",
  description: "Visual Grounding VLM, Open Food Facts Vector Engine, and Chemical Risk Knowledge Graph.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-[#eef2f6] text-slate-900 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
