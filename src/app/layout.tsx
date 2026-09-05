import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WORDLY - Personalized Word Puzzle Experience",
  description: "A premium modern word game platform.",
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
          <Navigation />
          <div className="flex-1 pb-20 md:pb-0 overflow-y-auto">
            {children}
          </div>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
