'use client';

import React from 'react';

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
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <span className="animate-spin mr-2">⏳</span>
          Analyzing Image...
        </span>
      ) : (
        '🔍 Get Prediction'
      )}
    </button>
  );
};

export default PredictButton;