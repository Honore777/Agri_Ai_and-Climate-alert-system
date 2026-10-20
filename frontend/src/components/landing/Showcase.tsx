'use client';

import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface ShowcaseItem {
  key: string;
  image: string;
  badge?: string;      // e.g. "01" for steps
  icon?: LucideIcon;   // for features
  title: string;
  description: string;
}

/**
 * Auto-rotating showcase: one item at a time, image + text crossfade.
 * Indicators are clickable so visitors can jump to any slide.
 */
export default function Showcase({
  items,
  intervalMs = 6000,
}: {
  items: ShowcaseItem[];
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  const current = items[index];

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-gray-900/5">
      <div className="grid items-center lg:grid-cols-2">
        {/* Images — stacked, crossfade */}
        <div className="relative h-72 overflow-hidden sm:h-96 lg:h-[420px]">
          {items.map((item, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.key}
              src={item.image}
              alt={item.title}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

        {/* Text — remount keyed on index for the fade-in animation */}
        <div className="px-8 py-10 sm:px-12 lg:py-0">
          <div key={index} className="animate-fade-in-up">
            {current.badge && (
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
                {current.badge}
              </span>
            )}
            {current.icon && (
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                <current.icon className="h-7 w-7 text-brand-600" />
              </span>
            )}
            <h3 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
              {current.title}
            </h3>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {current.description}
            </p>
          </div>

          {/* Indicators */}
          <div className="mt-8 flex items-center gap-2.5 pb-2">
            {items.map((item, i) => (
              <button
                key={item.key}
                onClick={() => setIndex(i)}
                aria-label={`Go to ${item.title}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? 'w-8 bg-brand-600'
                    : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
