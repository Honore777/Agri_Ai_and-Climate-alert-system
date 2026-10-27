'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import apiClient from '@/services/api/axios';
import predictionsService, { SavedPrediction } from '@/services/predictions.service';
import PredictionImage from '@/components/prediction/PredictionImage';
import WeatherPanel from '@/components/prediction/WeatherPanel';
import { getErrorMessage } from '@/utils/errors';
import { diseaseLabel } from '@/utils/disease';
import { useTranslation } from '@/i18n/LocaleContext';

/**
 * What the farmer sent — all photos for a prediction, the AI result,
 * weather context, and an uploader to add more photos when the
 * agronomist asks for another angle.
 */
export default function PredictionDetailModal({
  predictionId,
  onClose,
}: {
  predictionId: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [prediction, setPrediction] = useState<SavedPrediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<SavedPrediction>(`/predictions/${predictionId}`);
      setPrediction(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this prediction'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predictionId]);

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files || files.length === 0 || !prediction) return;
    const list = Array.from(files).slice(0, 5);
    setIsUploading(true);
    setError(null);
    try {
      await predictionsService.addAttachments(prediction.id, list);
      setUploadDone(true);
      await load();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not upload photos'));
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const imageIds = prediction?.image_ids ?? (prediction ? [prediction.image_id] : []);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Prediction #{predictionId}
            </h2>
            {prediction && (
              <p className="mt-1 text-sm text-gray-500">
                {new Date(prediction.created_at).toLocaleString()}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          ) : error && !prediction ? (
            <p className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>
          ) : prediction ? (
            <>
              <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  AI result
                </p>
                <p className="mt-1 text-lg font-bold text-blue-900">
                  {diseaseLabel(t, prediction.predicted_disease)}
                  <span className="ml-2 text-sm font-semibold text-blue-700">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </p>
                {prediction.crop_type && (
                  <p className="mt-1 text-sm text-blue-800">Crop: {prediction.crop_type}</p>
                )}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Photos you sent ({imageIds.length})
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {imageIds.map((id) => (
                  <PredictionImage key={id} imageId={id} className="h-32" />
                ))}
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={isUploading}
                  className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 disabled:opacity-60"
                >
                  {isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5" />
                  )}
                  {isUploading ? 'Uploading...' : 'Add photo'}
                </button>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleAddPhotos(e.target.files)}
              />
              <p className="mt-2 text-xs text-gray-500">
                If your agronomist asked for more photos (e.g. a closer shot of the
                leaves), add them here — up to 5 at a time.
              </p>

              {uploadDone && (
                <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
                  {t('notices.photosAdded')}
                </p>
              )}
              {error && prediction && (
                <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>
              )}

              {prediction.weather_snapshot && (
                <div className="mt-5">
                  <WeatherPanel snapshot={prediction.weather_snapshot} />
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="border-t border-gray-200 p-4">
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
