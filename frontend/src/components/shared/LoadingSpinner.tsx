'use client';

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
