import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bridge — an AI that doesn't wait",
  description:
    "Bridge is an autonomous AI companion. It remembers what matters to you, notices what needs attention, and initiates the conversation instead of waiting for a prompt.",
  keywords: [
    "AI companion",
    "life navigation",
    "relationships",
    "family",
    "mental wellness",
  ],
  openGraph: {
    title: "Bridge",
    description: "AI for life's real moments",
    url: "https://vitalitybridge.app",
    siteName: "Bridge",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
