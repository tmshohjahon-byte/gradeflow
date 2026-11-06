import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GradeFlow — Intellektual Ta'lim Monitoringi & AI Mentor",
  description: "Talabalar va o'quvchilar uchun zamonaviy akademik tahlil va AI mentor tizimi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark">
      <body className="min-h-screen bg-[#090D16] text-[#E2E8F0] antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
