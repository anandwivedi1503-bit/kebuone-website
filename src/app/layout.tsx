import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import EvuddyAssistant from "./components/EvuddyAssistant/EvuddyAssistant";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDeva = Noto_Sans_Devanagari({
  variable: "--font-noto-deva",
  subsets: ["devanagari"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "EVUDDY | Electric Scooter Rentals",
  description:
    "Book EVUDDY electric scooters in minutes. Flexible rentals and Rent to Own, with live tracking across Indian cities.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#18B368",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
  lang="en"
  data-scroll-behavior="smooth"
  className={`${display.variable} ${geistSans.variable} ${geistMono.variable} ${notoDeva.variable} h-full antialiased`}
>
      <body className={`${display.variable} ${geistSans.variable} ${geistMono.variable} ${notoDeva.variable} min-h-full flex flex-col font-sans`}>
        {children}
        <EvuddyAssistant />
      </body>
    </html>
  );
}