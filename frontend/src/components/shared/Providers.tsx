'use client';

import React from 'react';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { LocaleProvider } from '@/i18n/LocaleContext';

/**
 * Root client providers. Keeps layout.tsx a server component while
 * still giving every page access to i18n and error boundaries.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <ErrorBoundary>{children}</ErrorBoundary>
    </LocaleProvider>
  );
}
