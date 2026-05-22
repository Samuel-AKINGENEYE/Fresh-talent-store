import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fresh Talent Store - Tech. Fresh. For You.",
  description: "Your premier electronics store in Kigali, Rwanda. Quality products, fast delivery, great prices.",
  authors: [{ name: "Samuel AKINGENEYE", url: "https://github.com/Samuel-AKINGENEYE" }],
  creator: "Samuel AKINGENEYE",
  publisher: "Samuel AKINGENEYE",
  keywords: ["electronics", "Kigali", "Rwanda", "ecommerce", "Fresh Talent Store"],
  robots: "index, follow",
  openGraph: {
    title: "Fresh Talent Store",
    description: "Tech. Fresh. For You.",
    type: "website",
    locale: "en_RW",
    siteName: "Fresh Talent Store",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WishlistProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
