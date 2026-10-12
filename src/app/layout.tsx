import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope, Noto_Serif_Telugu } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700"] });
const body = Manrope({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600"] });
const telugu = Noto_Serif_Telugu({ subsets: ["telugu"], variable: "--font-telugu", weight: ["400", "600"] });

export const metadata: Metadata = {
  title: "Sunil & Pooja — Wedding Invitation",
  description: "Join Sunil and Pooja for their wedding celebrations, 11–13 December 2026.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#641f2c" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${body.variable} ${telugu.variable}`}>{children}</body></html>;
}
