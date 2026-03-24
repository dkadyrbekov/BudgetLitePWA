import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Budget Lite",
  description: "A simple mobile-first personal budget app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
