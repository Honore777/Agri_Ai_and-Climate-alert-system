'use client';

import React from 'react';
import { Organization } from '../../types/organization.types';

/**
 * ORGANIZATION CARD COMPONENT
 *
 * PRINCIPLE: Components should be DUMB
 * - Just display what's in props
 * - Call callbacks when user interacts
 * - No API calls
 * - No state management
 *
 * Analogy: Card = Picture frame
 *   - You hand it data, it displays it
 *   - You click frame, it tells you via callback
 */

interface OrganizationCardProps {
  // DATA flowing DOWN
  organization: Organization;
  isSelected: boolean;

  // CALLBACKS flowing UP
  onSelect: (id: number) => void;
  onAddAdmin: (org: Organization) => void;
  onToggleStatus: (org: Organization) => void;
  onDelete: (id: number) => void;
}

const OrganizationCard: React.FC<OrganizationCardProps> = ({
  organization,
  isSelected,
  onSelect,
  onAddAdmin,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <div
      onClick={() => onSelect(organization.id)}
      className={`
        p-6 rounded-lg border-2 cursor-pointer transition-all
        ${!organization.is_active ? 'opacity-70' : ''}
        ${isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
        }
      `}
    >
      {/* TAILWIND LESSON: Conditional styling based on props */}

      {/* Title with type + status badges */}
      <div className="flex justify-between items-start mb-3 gap-2">
        <h3 className="text-xl font-bold text-gray-900">
          {organization.name}
        </h3>
        <div className="flex flex-col items-end gap-1">
          <span className={`
            px-3 py-1 rounded-full text-sm font-semibold
            ${organization.type === 'cooperative'
              ? 'bg-green-100 text-green-800'
              : 'bg-purple-100 text-purple-800'
            }
          `}>
            {organization.type}
          </span>
          {!organization.is_active && (
            <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
              Deactivated
            </span>
          )}
        </div>
      </div>

      {/* Region info */}
      <p className="text-gray-600 mb-2">
        <span className="font-semibold">Region:</span> {organization.region}
      </p>

      {/* Registration code */}
      <p className="text-gray-500 text-sm mb-4 font-mono bg-gray-100 p-2 rounded">
        Code: {organization.registration_code}
      </p>

      {/* Created date */}
      <p className="text-gray-500 text-xs mb-4">
        Created: {new Date(organization.created_at).toLocaleDateString()}
      </p>

      {/* Actions: add admin, toggle status, delete */}
      <div className="flex flex-col gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();  // ← Don't trigger onSelect
            onAddAdmin(organization);
          }}
          className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
        >
          + Add Admin
        </button>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(organization);
            }}
            className={`
              flex-1 px-3 py-2 rounded transition-colors font-medium
              ${organization.is_active
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-green-500 text-white hover:bg-green-600'
              }
            `}
          >
            {organization.is_active ? 'Deactivate' : 'Reactivate'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();  // ← Don't trigger onSelect
              onDelete(organization.id);
            }}
            className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationCard;
