'use client';

import React, { useState } from 'react';

/**
 * CREATE ORGANIZATION MODAL
 * 
 * PRINCIPLE: Forms have LOCAL state
 * - Local state = temporary while user types
 * - When submit → send to hook
 * - Hook updates global store
 * 
 * LOCAL state: { name, type, region } (form inputs)
 * Don't put this in Zustand - it's temporary!
 */

interface CreateOrganizationModalProps {
  // CALLBACKS flowing UP
  onSubmit: (data: { name: string; type: string; region: string }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  error,
}) => {
  // LOCAL STATE - temporary form data
  const [name, setName] = useState('');
  const [type, setType] = useState<'cooperative' | 'institution'>('cooperative');
  const [region, setRegion] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate
    if (!name.trim()) {
      setLocalError('Organization name is required');
      return;
    }
    if (!region.trim()) {
      setLocalError('Region is required');
      return;
    }

    try {
      // Call parent's onSubmit with form data
      await onSubmit({
        name: name.trim(),
        type,
        region: region.trim(),
      });

      // Success - clear form
      setName('');
      setRegion('');
      setType('cooperative');
    } catch (err: any) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* TAILWIND LESSON: Modal overlay pattern */}
      
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
          <h2 className="text-2xl font-bold text-white">Create Organization</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error alert */}
          {(localError || error) && (
            <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700">
              {localError || error}
            </div>
          )}

          {/* Name input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Kigali Cooperative"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type select */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'cooperative' | 'institution')}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cooperative">Cooperative</option>
              <option value="institution">Institution</option>
            </select>
          </div>

          {/* Region input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Region *
            </label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g., Northern Rwanda"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrganizationModal;