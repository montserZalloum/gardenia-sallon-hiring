import type { Metadata } from "next";
import { Cairo, El_Messiri, Amiri, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const elMessiri = El_Messiri({
  variable: "--font-display",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const amiri = Amiri({
  variable: "--font-serif",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif-latin",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gardenia — التوظيف",
  description: "موقع التوظيف الإلكتروني لصالون Gardenia",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${elMessiri.variable} ${amiri.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
