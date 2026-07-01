import type { Metadata, Viewport } from "next";
import { Afacad, Josefin_Sans } from "next/font/google";
import Header from "@/components/Header";
import RegistrarServiceWorker from "@/components/RegistrarServiceWorker";
import "./globals.css";

const afacad = Afacad({
  subsets: ["latin"],
  variable: "--font-afacad",
  display: "swap"
});

const josefin = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Orçamentos · Oriente Móveis",
  description: "Sistema de orçamentos para móveis planejados e marcenaria — Oriente Móveis",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Oriente Móveis"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#C1121F",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${afacad.variable} ${josefin.variable} font-principal bg-neutral-50 text-oriente-gray antialiased`}>
        <RegistrarServiceWorker />
        <Header />
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">{children}</main>
      </body>
    </html>
  );
}
