import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Rochester, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Font untuk "THE WEDDING OF"
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ['italic', 'normal'],
});

// Font untuk Nama "April & Even" (Kaligrafi)
const rochester = Rochester({
  variable: "--font-rochester",
  subsets: ["latin"],
  weight: "400",
});

// Font untuk Butang & Info
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Aimi & Zul Wedding RSVP",
  description: "Official Wedding Invitation of Aimi & Zulhilmi",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${playfair.variable} 
          ${rochester.variable} 
          ${cormorant.variable} 
          antialiased
        `}
      >
        {children}
      </body>
    </html>
  );
}