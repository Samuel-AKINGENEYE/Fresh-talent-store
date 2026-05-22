import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const SUPPORTED_LOCALES = ['en', 'rw'] as const;
type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupported(locale: string | undefined): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale is provided when using [locale] routing; fall back to cookie
  let locale = await requestLocale;

  if (!isSupported(locale)) {
    const cookieStore = await cookies();
    const fromCookie = cookieStore.get('locale')?.value;
    locale = isSupported(fromCookie) ? fromCookie : 'en';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
