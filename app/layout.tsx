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

const SITE_TITLE = "Gardenia — نبحث عن مواهب تشبه روحَ المكان";
const SITE_DESCRIPTION =
  "انضمّي إلى عائلة Gardenia. تصفّحي الوظائف المتاحة في الصالون، واختاري ما يناسبكِ. كل تقديم يصل مباشرةً لصاحبة الصالون.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gardenia-sallon.com"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/logo-new.png",
    shortcut: "/logo-new.png",
    apple: "/logo-new.png",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ar_AR",
    siteName: "Gardenia",
    images: [
      {
        url: "/logo-new.png",
        width: 1200,
        height: 630,
        alt: "Gardenia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/logo-new.png"],
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
