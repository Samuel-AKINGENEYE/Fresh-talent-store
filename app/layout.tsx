import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/shared/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <WishlistProvider>
            <CartProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
