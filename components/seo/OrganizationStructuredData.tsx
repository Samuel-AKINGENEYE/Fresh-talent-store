'use client';

export default function OrganizationStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fresh Talent Store',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://fresh-talent-store.vercel.app',
    logo: 'https://fresh-talent-store.vercel.app/logo.png',
    email: 'info@freshtalent.rw',
    telephone: '+250788123456',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'KG 123 St',
      addressLocality: 'Kigali',
      addressCountry: 'RW',
    },
    sameAs: [
      'https://www.facebook.com/freshtalent',
      'https://www.instagram.com/freshtalent',
      'https://twitter.com/freshtalent',
    ],
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
