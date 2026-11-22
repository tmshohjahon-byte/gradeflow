import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#090D16",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gradeflow-jade.vercel.app"),
  title: "GradeFlow — Intellektual Ta'lim Monitoringi & AI Mentor",
  description: "Talabalar va o'quvchilar uchun zamonaviy akademik tahlil, GPA monitoringi va AI mentor tizimi",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logo.jpg", type: "image/jpeg" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "GradeFlow — Intellektual Ta'lim Monitoringi & AI Mentor",
    description: "Talabalar va o'quvchilar uchun zamonaviy akademik tahlil, GPA monitoringi va AI mentor tizimi",
    images: [{ url: "/logo.jpg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GradeFlow",
  },
  formatDetection: {
    telephone: false,
  },
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
