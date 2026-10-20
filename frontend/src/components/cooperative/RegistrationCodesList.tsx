'use client';

import React from 'react';
import { RegistrationCode } from '../../types/registration-code.types';
import RegistrationCodeCard from './RegistrationCodeCard';

interface RegistrationCodesListProps {
  codes: RegistrationCode[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

/**
 * REGISTRATION CODES LIST - LIST COMPONENT
 * 
 * Maps array of codes to individual cards
 * RECEIVES: codes array from hook (via parent)
 * RECEIVES: isLoading flag from hook
 * RECEIVES: onDelete callback from parent
 * 
 * This is the BRIDGE between hook and cards:
 * Hook has: codes, isLoading, deleteCode()
 * List receives them as props
 * List passes individual code + delete callback to each card
 * When card calls onDelete(id) → parent calls hook.deleteCode(id)
 * 
 * Data flow visualization:
 * Hook: { codes: [code1, code2, ...] }
 *   ↓
 * List receives: codes array
 *   ↓
 * List maps: codes.map(code => <Card code={code} />)
 *   ↓
 * Cards render individually
 */

const RegistrationCodesList: React.FC<RegistrationCodesListProps> = ({
  codes,
  isLoading,
  onDelete,
}) => {
  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-300 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">Loading registration codes...</p>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (codes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 font-semibold text-lg">No codes generated yet</p>
        <p className="text-gray-500 mt-2">Click &quot;Generate Codes&quot; to create registration codes for farmers</p>
      </div>
    );
  }

  // STATS
  const usedCount = codes.filter(c => c.is_used).length;
  const availableCount = codes.length - usedCount;

  // NORMAL STATE - render grid
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{codes.length}</p>
          <p className="text-xs text-blue-900 font-medium">Total Codes</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-2xl font-bold text-green-600">{availableCount}</p>
          <p className="text-xs text-green-900 font-medium">Available</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-600">{usedCount}</p>
          <p className="text-xs text-yellow-900 font-medium">Used</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">
            {((usedCount / codes.length) * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-purple-900 font-medium">Usage Rate</p>
        </div>
      </div>

      {/* Grid of codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {codes.map((code) => (
          <RegistrationCodeCard
            key={code.id}
            code={code}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default RegistrationCodesList;