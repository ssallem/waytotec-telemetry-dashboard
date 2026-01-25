import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Waytotec Telemetry Dashboard",
  description: "Analytics dashboard for Waytotec Control System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen">
          <Navigation />

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Waytotec Control System Telemetry</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
