'use client';

import { useState } from 'react';
import { MessageSquare, ScanSearch, Sprout, UserCheck } from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { usePrediction } from '@/hooks/usePredictions';
import { ImageUpload } from '@/components/prediction/ImageUpload';
import { ImagePreview } from '@/components/prediction/ImagePreview';
import { PredictButton } from '@/components/prediction/PredictButton';
import { PredictionResult } from '@/components/prediction/PredictionResult';
import AgronomistInfoSection from '@/components/farmer/AgronomistInfoSection';
import LocationCard from '@/components/farmer/LocationCard';
import MessagesSection from '@/components/farmer/MessagesSection';
import { useTranslation } from '@/i18n/LocaleContext';

type Tab = 'upload' | 'agronomist' | 'messages';

const TABS: { id: Tab; labelKey: string; icon: typeof ScanSearch }[] = [
  { id: 'upload', labelKey: 'dashboard.tabs.detection', icon: ScanSearch },
  { id: 'agronomist', labelKey: 'dashboard.tabs.agronomist', icon: UserCheck },
  { id: 'messages', labelKey: 'dashboard.tabs.messages', icon: MessageSquare },
];

export default function FarmerDashboard() {
  const { predict, prediction, inferenceResult, isLoading, isSaving, error, clearPrediction } =
    usePrediction();
  const { t } = useTranslation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropType, setCropType] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    clearPrediction();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    clearPrediction();
  };

  const handlePredictClick = async () => {
    if (selectedFile) {
      await predict(selectedFile, cropType);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title={t('dashboard.farmerTitle')} subtitle={t('dashboard.farmerSubtitle')} />

      {/* Navigation Tabs */}
      <div className="sticky top-[60px] z-30 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl gap-1 px-6">
          {TABS.map(({ id, labelKey, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {activeTab === 'upload' && (
          <>
          <LocationCard />
          <div className="card p-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">{t('farmer.detectionTitle')}</h2>
            <p className="mb-8 text-gray-600">{t('farmer.detectionSubtitle')}</p>

            <ImageUpload onFileSelect={handleFileSelect} disabled={isLoading || isSaving} />
            <ImagePreview file={selectedFile} onClear={handleClearFile} />

            {selectedFile && (
              <div className="mb-4 mt-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  {t('farmer.cropType')}{' '}
                  <span className="font-normal text-gray-400">({t('common.optional')})</span>
                </label>
                <input
                  type="text"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder={t('farmer.cropTypePlaceholder')}
                  className="input-field"
                  disabled={isLoading || isSaving}
                />
              </div>
            )}

            {selectedFile && (
              <PredictButton
                onClick={handlePredictClick}
                isLoading={isLoading || isSaving}
                disabled={!selectedFile}
              />
            )}

            <PredictionResult
              prediction={prediction}
              inferenceResult={inferenceResult}
              error={error}
              isSaving={isSaving}
            />

            <div className="mt-12 rounded-xl border border-brand-200 bg-brand-50 p-6">
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-brand-900">
                <Sprout className="h-5 w-5" />
                {t('farmer.tipsTitle')}
              </h3>
              <ul className="space-y-1.5 text-sm text-brand-800">
                <li>{t('farmer.tips.clear')}</li>
                <li>{t('farmer.tips.focus')}</li>
                <li>{t('farmer.tips.blurry')}</li>
                <li>{t('farmer.tips.formats')}</li>
                <li>{t('farmer.tips.saved')}</li>
              </ul>
            </div>
          </div>
          </>
        )}

        {activeTab === 'agronomist' && <AgronomistInfoSection />}
        {activeTab === 'messages' && <MessagesSection />}
      </main>
    </div>
  );
}
