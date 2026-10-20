'use client';

import React from 'react';
import { RegionAssignment } from '../../types/region-assignment.types';
import RegionAssignmentCard from './RegionAssignmentCard';

interface RegionAssignmentsListProps {
  assignments: RegionAssignment[];
  isLoading: boolean;
  onDelete: (id: number) => void;
}

/**
 * REGION ASSIGNMENTS LIST - LIST COMPONENT
 * Maps assignments array to individual cards
 * Shows which agronomist covers which region
 */

const RegionAssignmentsList: React.FC<RegionAssignmentsListProps> = ({
  assignments,
  isLoading,
  onDelete,
}) => {
  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-12 w-12 border-4 border-blue-300 border-t-blue-600 rounded-full" />
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  // EMPTY STATE
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 font-semibold text-lg">No assignments yet</p>
        <p className="text-gray-500 mt-2">Click &quot;Assign Agronomist&quot; to assign staff to regions</p>
      </div>
    );
  }

  // STATS
  const activeCount = assignments.filter(a => a.is_active).length;
  const uniqueAgronomists = new Set(assignments.map(a => a.agronomist_id)).size;
  const uniqueRegions = new Set(assignments.map(a => a.location_display)).size;

  // NORMAL STATE
  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{assignments.length}</p>
          <p className="text-xs text-blue-900 font-medium">Total Assignments</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
          <p className="text-2xl font-bold text-purple-600">{uniqueAgronomists}</p>
          <p className="text-xs text-purple-900 font-medium">Agronomists</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
          <p className="text-2xl font-bold text-green-600">{uniqueRegions}</p>
          <p className="text-xs text-green-900 font-medium">Regions Covered</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-600">{activeCount}</p>
          <p className="text-xs text-yellow-900 font-medium">Active</p>
        </div>
      </div>

      {/* Grid of assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignments.map((assignment) => (
          <RegionAssignmentCard
            key={assignment.id}
            assignment={assignment}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default RegionAssignmentsList;