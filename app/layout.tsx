import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Stylebender — Discover your style",
  description: "Your personal AI menswear stylist.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
