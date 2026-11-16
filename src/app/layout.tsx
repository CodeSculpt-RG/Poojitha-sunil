import type { Metadata, Viewport } from "next";
import { FallingPetals } from "@/components/FallingPetals";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sunil & Poojitha — Wedding Invitation",
  description:
    "Join Sunil and Poojitha for their wedding celebrations, 11–13 December 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#671C2D",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          as="image"
          href="/media/invitation-hero-wide-v2.webp"
          media="(orientation: landscape)"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/media/invitation-hero-portrait-v2.webp"
          media="(orientation: portrait)"
          fetchPriority="high"
        />
      </head>
      <body>
        <FallingPetals />
        {children}
      </body>
    </html>
  );
}
