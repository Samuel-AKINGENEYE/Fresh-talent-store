// SEO Metadata configuration
export const siteConfig = {
  name: 'Fresh Talent Store',
  title: 'Fresh Talent Store - Tech. Fresh. For You.',
  description: 'Premium electronics store in Kigali, Rwanda. Shop smartphones, laptops, audio devices, and accessories with fast delivery.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fresh-talent-store.vercel.app',
  ogImage: '/og-image.jpg',
  links: {
    twitter: 'https://twitter.com/freshtalent',
    github: 'https://github.com/Samuel-AKINGENEYE/Fresh-talent-store',
  },
};

// Default metadata for pages
export const defaultMetadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'electronics',
    'Kigali',
    'Rwanda',
    'smartphones',
    'laptops',
    'audio',
    'accessories',
    'online shopping',
    'tech store',
    'Fresh Talent Store',
  ],
  authors: [{ name: 'Samuel AKINGENEYE', url: 'https://github.com/Samuel-AKINGENEYE' }],
  creator: 'Samuel AKINGENEYE',
  publisher: 'Fresh Talent Store',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_RW',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-image.jpg`],
    creator: '@freshtalent',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};
