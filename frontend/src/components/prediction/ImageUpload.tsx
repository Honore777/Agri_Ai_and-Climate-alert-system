'use client';

import React, { useRef } from 'react';
import { FolderOpen } from 'lucide-react';
import { useTranslation } from '@/i18n/LocaleContext';

interface ImageUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onFileSelect, disabled = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('predict.imageOnly'));
      return;
    }

    onFileSelect(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
         onClick={handleClick}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <p className="flex items-center justify-center gap-2 text-blue-600 font-medium">
        <FolderOpen className="h-4 w-4" />
        {disabled ? t('predict.processing') : t('predict.selectImage')}
      </p>
      <p className="text-sm text-gray-500 mt-2">{t('predict.dragDrop')}</p>
      <p className="text-xs text-gray-400 mt-1">{t('predict.formats')}</p>
    </div>
  );
};

export default ImageUpload;