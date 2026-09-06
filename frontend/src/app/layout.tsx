import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { AuthGateModal } from "@/components/auth/AuthGateModal";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "WORDLY — Daily Word Puzzle Game",
    template: "%s | WORDLY",
  },
  description: "Play classic Wordle, timed rush, chaos modifiers, survival challenges, and unlimited daily word puzzles with custom themes, multi-language support, and stats.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WORDLY",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Righteous&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className} flex flex-col md:flex-row min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            <AuthGateModal />
            <Navigation />
            <div className="flex-1 pb-20 md:pb-0 overflow-y-auto">
              {children}
            </div>
            <Toaster position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
