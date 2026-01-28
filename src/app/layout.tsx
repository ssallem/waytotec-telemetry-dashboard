import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { MeshGradient } from "@/components/MeshGradient";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Waytotec Telemetry Dashboard",
  description: "Analytics dashboard for Waytotec Control System",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        <MeshGradient />
        <div className="min-h-screen relative z-10">
          <Navigation />

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="py-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Waytotec Control System Telemetry
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
