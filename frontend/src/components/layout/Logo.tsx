'use client';

import { Leaf } from 'lucide-react';
import Link from 'next/link';

export default function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
        <Leaf className="h-5 w-5 text-white" />
      </span>
      <span className="text-xl font-bold tracking-tight text-gray-900">
        Agri<span className="text-brand-600">AI</span>
      </span>
    </Link>
  );
}