'use client';

import { Languages } from 'lucide-react';
import { useTranslation, type Locale } from '@/i18n/LocaleContext';

const LOCALES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'rw', label: 'KIN' },
  { id: 'fr', label: 'FR' },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-0.5" aria-label="Language / Ururimi">
      <Languages className="mx-1.5 h-3.5 w-3.5 text-gray-400" />
      {LOCALES.map((l) => (
        <button
          key={l.id}
          onClick={() => setLocale(l.id)}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
            locale === l.id
              ? 'bg-brand-600 text-white'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
