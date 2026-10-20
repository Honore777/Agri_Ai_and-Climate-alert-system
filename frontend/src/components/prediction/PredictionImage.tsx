'use client';

import React, { useEffect, useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';
import apiClient from '@/services/api/axios';

/**
 * Fetches a prediction photo through the authenticated API and renders
 * it as an object URL. Used anywhere a prediction image is shown —
 * pending cards, review history, farmer results.
 */
export default function PredictionImage({
  imageId,
  className = 'h-48',
}: {
  imageId: number;
  /** Tailwind height/shape classes for the container */
  className?: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setFailed(false);
      try {
        const res = await apiClient.get(`/images/${imageId}`, { responseType: 'blob' });
        const blob = new Blob([res.data], { type: 'image/jpeg' });
        url = URL.createObjectURL(blob);
        if (!cancelled) setImageUrl(url);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [imageId]);

  return (
    <div
      className={`flex w-full items-center justify-center overflow-hidden rounded-lg bg-gray-100 ${className}`}
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      ) : failed || !imageUrl ? (
        <span className="flex items-center gap-1.5 text-xs text-gray-400">
          <ImageOff className="h-4 w-4" /> No image
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="Prediction" className="h-full w-full object-cover" />
      )}
    </div>
  );
}
