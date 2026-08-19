import type { Metadata } from "next";
import { Fraunces, Marcellus, Spectral, Space_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "sonner";
import Footer from "@/components/layout/Footer";
import Providers from "./providers";
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "SOZAN / NAZM",
  description: "A modern expression of Chikankari.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${marcellus.variable} ${spectral.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {
          <Providers>
            <CartProvider>
              <WishlistProvider>
                {children}

                <Footer />
              </WishlistProvider>
            </CartProvider>
          </Providers>
        }
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
