'use client';

import React, { useState } from 'react';
import { CheckCircle2, ClipboardList, History, MapPin } from 'lucide-react';
import { useAgronomistReview } from '@/hooks/useAgronomistReview';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useTranslation } from '@/i18n/LocaleContext';
import PredictionCard from '@/components/agronomist/PredictionCard';
import PredictionReviewForm from '@/components/agronomist/PredictionReviewForm';
import PredictionImage from '@/components/prediction/PredictionImage';
import WeatherPanel from '@/components/prediction/WeatherPanel';

/**
 * AGRONOMIST DASHBOARD
 *
 * Two tabs:
 * - Pending: unreviewed predictions from farmers in the agronomist's
 *   organization + assigned regions
 * - Reviewed: the agronomist's past work (confirmations/corrections)
 */
const AgronomistDashboard: React.FC = () => {
  const { t } = useTranslation();
  const {
    pendingPredictions,
    reviewedItems,
    isLoading,
    isLoadingReviewed,
    error,
    selectPredictionId,
    isSubmitting,
    selectPrediction,
    submitReview,
    clearError,
  } = useAgronomistReview();
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');

  const selectedPrediction = pendingPredictions.find(
    p => p.id === selectPredictionId
  );

  const tabs = [
    { key: 'pending' as const, label: 'Pending Reviews', icon: ClipboardList, count: pendingPredictions.length },
    { key: 'reviewed' as const, label: 'My Reviewed Work', icon: History, count: reviewedItems.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader title={t('dashboard.agronomistTitle')} subtitle="Review farmer predictions" />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* TABS */}
        <div className="mb-8 flex gap-2 border-b border-gray-200">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                activeTab === key
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeTab === key ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-900">{error}</p>
            <button onClick={clearError} className="font-semibold text-red-600 hover:text-red-900">
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'pending' ? (
          isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600" />
              <p className="font-semibold text-gray-600">Loading predictions...</p>
            </div>
          ) : pendingPredictions.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white py-20 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">No pending predictions</h3>
              <p className="text-gray-600">All predictions have been reviewed. Check back later!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingPredictions.map(prediction => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction}
                  isSelected={selectPredictionId === prediction.id}
                  onSelectPrediction={selectPrediction}
                />
              ))}
            </div>
          )
        ) : isLoadingReviewed ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-300 border-t-blue-600" />
            <p className="font-semibold text-gray-600">Loading your review history...</p>
          </div>
        ) : reviewedItems.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white py-20 text-center">
            <History className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No reviews yet</h3>
            <p className="text-gray-600">Predictions you confirm or correct will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewedItems.map(item => (
              <div key={item.review_id} className="card p-6">
                <div className="flex flex-wrap items-start gap-5">
                  <div className="w-40 shrink-0">
                    <PredictionImage imageId={item.prediction.image_id} className="h-32" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">
                          Prediction #{item.prediction.id}
                        </h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {item.status === 'confirmed' ? 'Confirmed' : 'Corrected'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Reviewed {new Date(item.reviewed_at).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      Farmer: <span className="font-semibold">{item.prediction.farmer_name || item.prediction.farmer_email || `#${item.prediction.farmer_id}`}</span>
                      {' · '}AI predicted{' '}
                      <span className="font-semibold">{item.prediction.predicted_disease}</span>
                      {' '}({(item.prediction.confidence * 100).toFixed(1)}%)
                    </p>
                    {item.prediction.farmer_location && (
                      <p className="mt-1 flex items-start gap-1.5 text-sm text-gray-600">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                        <span>
                          {item.prediction.farmer_location}
                          {item.prediction.farmer_latitude != null && item.prediction.farmer_longitude != null && (
                            <span className="ml-1 text-gray-500">
                              · GPS {item.prediction.farmer_latitude.toFixed(4)}, {item.prediction.farmer_longitude.toFixed(4)}
                            </span>
                          )}
                        </span>
                      </p>
                    )}
                    <p className="mt-1 text-sm text-gray-600">
                      Your verdict: crop <span className="font-semibold">{item.crop_type}</span>
                      {item.corrected_disease && (
                        <>
                          , actual disease{' '}
                          <span className="font-semibold text-orange-700">{item.corrected_disease}</span>
                        </>
                      )}
                    </p>
                    {item.notes && (
                      <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {item.prediction.weather_snapshot && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <WeatherPanel snapshot={item.prediction.weather_snapshot} compact />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* REVIEW FORM MODAL */}
      {selectedPrediction && (
        <PredictionReviewForm
          prediction={selectedPrediction}
          onSubmit={(reviewData) => submitReview(selectedPrediction.id, reviewData)}
          isSubmitting={isSubmitting}
          onCancel={() => selectPrediction(null)}
        />
      )}
    </div>
  );
};

export default AgronomistDashboard;
