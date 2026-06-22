import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "حلقة معاهدة القران الكريم",
  description: "منصة إدارة حلقة معاهدة القران الكريم",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "الحلقة",
  },
};

export const viewport: Viewport = {
  themeColor: "#1B6B4A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
