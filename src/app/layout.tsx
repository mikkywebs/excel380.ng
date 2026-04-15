import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppConfigProvider } from "@/contexts/AppConfigContext";

export const metadata: Metadata = {
  metadataBase: new URL("https://excel380.ng"),
  title: "Excel 380 | Nigeria's #1 CBT Practice Platform",
  description: "Master JAMB, WAEC, NECO, and NABTEB with thousands of real past questions, AI-powered insights, and realistic exam simulations.",
  keywords: ["JAMB", "WAEC", "NECO", "NABTEB", "CBT Practice", "Nigeria Exams", "Exam Prep"],
  openGraph: {
    title: "Excel 380 | Master Your Exams",
    description: "The ultimate practice platform for Nigerian students.",
    url: "https://excel380.ng",
    siteName: "Excel 380",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_NG",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <AppConfigProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AppConfigProvider>
      </body>
    </html>
  );
}
