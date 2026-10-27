'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/LocaleContext';

interface ImagePreviewProps {
  file: File | null;
  onClear: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ file, onClear }) => {
  const { t } = useTranslation();
  // State to store preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // useEffect: Convert file to preview URL when file changes
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    // FileReader converts file to displayable URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [file]);  // ← Only runs when 'file' changes

  // If no file or no preview yet, render nothing
  if (!file || !previewUrl) {
    return null;
  }

  // Convert bytes to MB
  const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
      {/* Header with title and clear button */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('predict.preview')}</h3>
        <button
          onClick={onClear}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded transition text-sm"
        >
          {t('predict.clear')}
        </button>
      </div>

      {/* Display the image */}
      <div className="bg-white rounded p-4">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-64 object-cover rounded border border-gray-200"
        />
      </div>

      {/* Show file information */}
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>{t('predict.fileName')}:</strong> {file.name}</p>
        <p><strong>{t('predict.fileSize')}:</strong> {fileSizeMB} MB</p>
        <p><strong>{t('predict.fileType')}:</strong> {file.type}</p>
      </div>
    </div>
  );
};

export default ImagePreview;