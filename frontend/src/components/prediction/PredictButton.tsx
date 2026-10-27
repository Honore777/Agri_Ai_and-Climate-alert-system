'use client';

import React from 'react';
import { Loader2, ScanSearch } from 'lucide-react';
import { useTranslation } from '@/i18n/LocaleContext';

interface PredictButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const PredictButton: React.FC<PredictButtonProps> = ({
  onClick,
  isLoading,
  disabled = false
}) => {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('predict.analyzing')}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <ScanSearch className="h-4 w-4" />
          {t('predict.getPrediction')}
        </span>
      )}
    </button>
  );
};

export default PredictButton;