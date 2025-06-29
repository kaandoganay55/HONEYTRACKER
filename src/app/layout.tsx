import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionWrapper from '@/components/SessionWrapper';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "A beautiful task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
                    var theme = localStorage.getItem('theme');
                    if (theme === 'light' || theme === 'dark') {
                      document.documentElement.setAttribute('data-theme', theme);
                    } else {
                      // Default to light mode
                      document.documentElement.setAttribute('data-theme', 'light');
                      localStorage.setItem('theme', 'light');
                    }
                  } else {
                    // Fallback for SSR
                    document.documentElement.setAttribute('data-theme', 'light');
                  }
                } catch (e) {
                  // Fallback on any error
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
