import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppConfigProvider } from "@/contexts/AppConfigContext";

export const metadata: Metadata = {
  title: "Excel 380 - CBT Practice Platform",
  description: "Nigeria's leading exam practice platform",
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
