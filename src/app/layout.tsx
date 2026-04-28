import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { RootWrapper } from "@/components/layout/RootWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ALCHEMIST | 案件管理・ヒアリングツール",
  description: "プロフェッショナルな案件管理とヒアリングをサポートするALCHEMISTシステム",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ fontFamily: 'var(--font-geist-sans), system-ui, -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif' }}
    >
      <body className="min-h-full flex flex-col font-sans">
        <PwaRegister />
        <RootWrapper>
          {children}
        </RootWrapper>
      </body>
    </html>
  );
}
