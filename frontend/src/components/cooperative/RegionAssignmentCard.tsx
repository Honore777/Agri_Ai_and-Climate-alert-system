'use client';

import React from 'react';
import { RegionAssignment } from '../../types/region-assignment.types';

interface RegionAssignmentCardProps {
  assignment: RegionAssignment;
  onDelete: (id: number) => void;
}

/**
 * REGION ASSIGNMENT CARD - DUMB COMPONENT
 * 
 * Shows: "Agronomist John covers Eastern region"
 * Can remove assignment
 */

const RegionAssignmentCard: React.FC<RegionAssignmentCardProps> = ({ assignment, onDelete }) => {
  const handleDelete = () => {
    // ✅ FIXED: Use agronomist_name and location_display
    if (window.confirm(`Remove ${assignment.agronomist_name} from ${assignment.location_display}?`)) {
      onDelete(assignment.id);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">
            {assignment.agronomist_name}
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            ✉️ {assignment.agronomist_email}
          </p>
          <p className="text-sm text-gray-600">
            📍 {assignment.location_display}
          </p>
        </div>
        
        {/* Status Badge */}
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 whitespace-nowrap ${
          assignment.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {assignment.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Details */}
      <div className="text-sm text-gray-600 space-y-1 mb-4">
        <p>
          <span className="font-medium">Assignment Level:</span> {assignment.assignment_level}
        </p>
        <p>
          <span className="font-medium">Assigned Date:</span> {new Date(assignment.created_at).toLocaleDateString()}
          {/* ✅ FIXED: Use created_at instead of assigned_date */}
        </p>
      </div>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={!assignment.is_active}
        className={`w-full px-3 py-2 rounded font-medium transition-colors text-sm ${
          assignment.is_active
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        Remove Assignment
      </button>
    </div>
  );
};

export default RegionAssignmentCard;