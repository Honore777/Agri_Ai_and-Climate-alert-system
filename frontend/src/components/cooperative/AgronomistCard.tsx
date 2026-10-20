'use client';

import React from 'react';
import { Agronomist } from '../../types/agronomist.types';

interface AgronomistCardProps {
  agronomist: Agronomist;
  onDelete: (id: number) => void;
}

/**
 * AGRONOMIST CARD - DUMB COMPONENT
 * 
 * Shows a single agronomist (staff member)
 * Displays: name, email, phone, status
 * Can delete agronomist
 */

const AgronomistCard: React.FC<AgronomistCardProps> = ({ agronomist, onDelete }) => {
  const handleDelete = () => {
    // ✅ FIXED: Use full_name instead of first_name + last_name
    if (window.confirm(`Remove ${agronomist.full_name} as agronomist?`)) {
      onDelete(agronomist.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Name & Status */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900">
          {agronomist.full_name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
          agronomist.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {agronomist.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>
          <span className="font-medium">Email:</span> {agronomist.email}
        </p>
        <p>
          <span className="font-medium">Phone:</span> {agronomist.phone_number}
        </p>
        <p>
          <span className="font-medium">Regions:</span>{' '}
          {agronomist.assigned_regions && agronomist.assigned_regions.length > 0
            ? agronomist.assigned_regions.join(', ')
            : 'Not assigned'}
        </p>
        <p className="text-xs text-gray-500">
          Hired: {new Date(agronomist.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-medium transition-colors text-sm"
      >
        Remove
      </button>
    </div>
  );
};

export default AgronomistCard;