'use client';

import { useCallback, useEffect, useState } from 'react';
import { Camera, Loader2, ScanSearch } from 'lucide-react';
import predictionsService, { SavedPrediction } from '@/services/predictions.service';
import PredictionImage from '@/components/prediction/PredictionImage';
import PredictionDetailModal from '@/components/farmer/PredictionDetailModal';
import { getErrorMessage } from '@/utils/errors';
import { diseaseLabel } from '@/utils/disease';
import { useTranslation } from '@/i18n/LocaleContext';

/**
 * Farmer's prediction history — every scan they've made, newest first.
 * Clicking a card opens the full detail (photos, AI result, weather)
 * and lets them attach more photos when the agronomist asks.
 */
export default function MyScansSection() {
  const { t } = useTranslation();
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setPredictions(await predictionsService.getMyPredictions());
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your scans'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="card flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">{error}</p>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="card p-12 text-center">
        <ScanSearch className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-xl font-semibold text-gray-900">No scans yet</h3>
        <p className="mt-2 text-gray-600">
          Photos you analyze appear here — open the Detection tab to make your first scan.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">My Scans</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {predictions.map((p) => (
          <button
            key={p.id}
            onClick={() => setOpenId(p.id)}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all hover:shadow-md"
          >
            <PredictionImage imageId={p.image_id} className="h-40 rounded-none" />
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-bold text-gray-900">{diseaseLabel(t, p.predicted_disease)}</p>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    p.confidence > 0.8
                      ? 'bg-green-100 text-green-700'
                      : p.confidence > 0.6
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {(p.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                #{p.id} · {new Date(p.created_at).toLocaleDateString()}
              </p>
              {(p.image_ids?.length ?? 1) > 1 && (
                <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-brand-700">
                  <Camera className="h-3.5 w-3.5" /> {p.image_ids!.length} photos
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {openId !== null && (
        <PredictionDetailModal predictionId={openId} onClose={() => setOpenId(null)} />
      )}
    </div>
  );
}
