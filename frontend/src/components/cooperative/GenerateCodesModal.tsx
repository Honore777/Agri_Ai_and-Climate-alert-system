'use client';

import React, { useState } from 'react';

interface GenerateCodesModalProps {
  onSubmit: (count: number) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * GENERATE CODES MODAL - FORM COMPONENT
 * 
 * Form with LOCAL state (not in Zustand!)
 * User enters: quantity (how many codes)
 * On submit: calls parent's onSubmit function
 * 
 * Data flow:
 * User clicks button → Modal opens
 * User enters quantity in form
 * User clicks "Generate" → onSubmit(count) called
 * → Hook calls service → Backend generates codes
 * → Service returns new codes
 * → Hook updates Zustand store
 * → Parent component re-renders
 * → New codes appear in list ✨
 */

const GenerateCodesModal: React.FC<GenerateCodesModalProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  error,
}) => {
  // LOCAL STATE - form data
  const [count, setCount] = useState('5');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate
    const quantity = parseInt(count);
    if (isNaN(quantity) || quantity < 1 || quantity > 100) {
      setLocalError('Enter number between 1 and 100');
      return;
    }

    try {
      await onSubmit(quantity);
      setCount('5'); // Reset form
    } catch (err: any) {
      setLocalError(err.message || 'Failed to generate codes');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-green-500 p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold text-white">Generate Codes</h2>
          <p className="text-green-100 mt-1">Create new registration codes for farmers</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-900 text-sm">{error || localError}</p>
            </div>
          )}

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              How many codes? *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
              placeholder="Enter 1-100"
            />
            <p className="text-xs text-gray-500 mt-1">Max 100 codes at once</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? '⏳ Generating...' : '✨ Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenerateCodesModal;