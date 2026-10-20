'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../../messages/en.json';
import rw from '../../messages/rw.json';

export type Locale = 'en' | 'rw';

const dictionaries: Record<Locale, typeof en> = { en, rw };
const STORAGE_KEY = 'agri_locale';

type Messages = typeof en;

function lookup(messages: Messages, key: string): string | undefined {
  // Dot-notation lookup: 'landing.heroTitle1' -> messages.landing.heroTitle1
  let node: unknown = messages;
  for (const part of key.split('.')) {
    if (node == null || typeof node !== 'object') return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Translate a dot key. Falls back to English, then to the key itself. */
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Restore saved language after mount (localStorage is client-only)
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'rw') setLocaleState(saved);
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next === 'rw' ? 'rw' : 'en';
  };

  const t = useMemo(() => {
    const messages = dictionaries[locale];
    return (key: string) =>
      lookup(messages, key) ?? lookup(dictionaries.en, key) ?? key;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useTranslation must be used inside <LocaleProvider>');
  return ctx;
}
