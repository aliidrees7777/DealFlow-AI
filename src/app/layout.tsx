// app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DealFlow AI — Transaction coordinator demo",
  description:
    "AI-powered deal extraction, contract preview, and context-aware assistant.",
};
import Header from "@/components/layout/Header";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header /> {/* Header hamesha yahan rahega */}
        {children} {/* Yahan / ya /dealspage ka content load hoga */}
      </body>
    </html>
  );
}
