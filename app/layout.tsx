import type { Metadata, Viewport } from "next";
import "./globals.css";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14251E",
};

export const metadata: Metadata = {
  appleWebApp: { capable: true, title: "Stylebender", statusBarStyle: "black-translucent" },
  title: "Stylebender — Discover your style",
  description: "Your personal AI menswear stylist.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/stylebender-symbol.svg", type: "image/svg+xml" },
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
