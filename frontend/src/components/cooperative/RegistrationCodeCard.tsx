'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { RegistrationCode } from '../../types/registration-code.types';

interface RegistrationCodeCardProps {
  code: RegistrationCode;
  onDelete: (id: number) => void;
}

/**
 * REGISTRATION CODE CARD - DUMB COMPONENT
 * 
 * Shows a single registration code.
 * RECEIVES: code data from props
 * RECEIVES: onDelete callback from parent
 * DOES: Renders code, handles delete button
 * 
 * Data flow:
 * CooperativeAdminDashboard (hook state)
 *   ↓
 * RegistrationCodesList (maps codes to cards)
 *   ↓
 * RegistrationCodeCard (displays single code)
 */

const RegistrationCodeCard: React.FC<RegistrationCodeCardProps> = ({ code, onDelete }) => {
  const handleDelete = () => {
    if (window.confirm('Delete this code? It cannot be used to register anymore.')) {
      onDelete(code.id);
    }
  };

  const isUsed = code.is_used;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Code Display */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <p className="text-lg font-mono font-bold text-gray-900 break-all">{code.code}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
            {isUsed
              ? <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Used</>
              : <><Clock className="h-3.5 w-3.5 text-yellow-600" /> Available</>}
          </p>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 whitespace-nowrap ${
          isUsed 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isUsed ? 'Used' : 'Available'}
        </span>
      </div>

      {/* Details */}
      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>Created: {new Date(code.created_at).toLocaleDateString()}</p>
        {code.is_used && (code.used_by_name || code.used_by_email) && (
          <p>
            Used by: <span className="font-medium text-gray-800">{code.used_by_name ?? 'Farmer'}</span>
            {code.used_by_email && <span className="text-gray-500"> ({code.used_by_email})</span>}
          </p>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={isUsed}
        className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
          isUsed
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-red-500 text-white hover:bg-red-600'
        }`}
      >
        Delete
      </button>
    </div>
  );
};

export default RegistrationCodeCard;