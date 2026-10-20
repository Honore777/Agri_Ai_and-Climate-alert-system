'use client';

import React from 'react';
import { Agronomist } from '../../types/agronomist.types';
import AgronomistCard from './AgronomistCard';

interface AgronomiststListProps {
  agronomists: Agronomist[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

/**
 * AGRONOMISTS LIST - LIST COMPONENT
 * Maps agronomists array to individual cards
 */

const AgronomistsList: React.FC<AgronomiststListProps> = ({
  agronomists,
  isLoading,
  onDelete,
}) => {
  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-300 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">Loading agronomists...</p>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (agronomists.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 font-semibold text-lg">No agronomists yet</p>
        <p className="text-gray-500 mt-2">Click &quot;Hire Agronomist&quot; to add staff members</p>
      </div>
    );
  }

  // STATS
  const activeCount = agronomists.filter(a => a.is_active).length;
  const inactiveCount = agronomists.length - activeCount;

  // NORMAL STATE
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{agronomists.length}</p>
          <p className="text-xs text-blue-900 font-medium">Total Staff</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-green-900 font-medium">Active</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
          <p className="text-xs text-gray-900 font-medium">Inactive</p>
        </div>
      </div>

      {/* Grid of agronomists */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agronomists.map((agronomist) => (
          <AgronomistCard
            key={agronomist.id}
            agronomist={agronomist}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default AgronomistsList;