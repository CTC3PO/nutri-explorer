import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/shared/components/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#16a34a",
};

export const metadata: Metadata = {
  title: "Nutri-Global Explorer",
  description: "Scan and explore food nutritional quality globally.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriX"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased selection:bg-brand-100 selection:text-brand-900 pb-16">
        <main className="min-h-[100dvh] max-w-md mx-auto bg-white/50 relative shadow-2xl pb-safe">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
