import type { Metadata } from "next";
import { M_PLUS_1_Code, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { RootWrapper } from "@/components/layout/RootWrapper";
import { cn } from "@/lib/utils";

const mplusCode = M_PLUS_1_Code({
  subsets: ["latin"],
  variable: "--font-mplus",
  weight: ["400", "500", "700"],
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "700", "900"],
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

import { AuthProvider } from "@/components/auth/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={cn(mplusCode.variable, notoSansJp.variable, "h-full antialiased")}
    >
      <body className="h-full overflow-hidden flex flex-col font-sans bg-background text-foreground">
        <PwaRegister />
        <AuthProvider>
          <RootWrapper>
            {children}
          </RootWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
