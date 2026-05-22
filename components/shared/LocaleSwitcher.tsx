'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const LOCALES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'rw', label: 'RW', flag: '🇷🇼' },
];

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchLocale = async (next: string) => {
    if (next === locale) return;
    await fetch('/api/locale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locale: next }),
    });
    startTransition(() => router.refresh());
  };

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={pending}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition ${
            locale === code
              ? 'bg-blue-100 text-blue-700 font-semibold'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={code === 'en' ? 'English' : 'Kinyarwanda'}
        >
          <span>{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
