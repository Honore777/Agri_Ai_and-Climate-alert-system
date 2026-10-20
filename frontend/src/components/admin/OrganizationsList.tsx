'use client';

import React from 'react';
import { Organization } from '../../types/organization.types';
import OrganizationCard from './OrganizationCard';

/**
 * ORGANIZATIONS LIST COMPONENT
 * 
 * PRINCIPLE: List components iterate and render cards
 * - Maps over array from props
 * - Passes each item to child component
 * - Passes callbacks from parent down to children
 */

interface OrganizationsListProps {
  organizations: Organization[];
  selectedOrgId: number | null;
  isLoading: boolean;

  onSelectOrganization: (id: number) => void;
  onAddAdmin: (org: Organization) => void;
  onToggleStatus: (org: Organization) => void;
  onDeleteOrganization: (id: number) => void;
}

const OrganizationsList: React.FC<OrganizationsListProps> = ({
  organizations,
  selectedOrgId,
  isLoading,
  onSelectOrganization,
  onAddAdmin,
  onToggleStatus,
  onDeleteOrganization,
}) => {
  // LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-300 border-t-blue-600 rounded-full" />
      </div>
    );
  }

  // EMPTY STATE
  if (organizations.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 font-semibold">No organizations yet</p>
        <p className="text-gray-500 text-sm">Click &quot;Create Organization&quot; to get started</p>
      </div>
    );
  }

  // NORMAL STATE - render grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* TAILWIND LESSON: Responsive grid
          - 1 column on mobile
          - 2 columns on tablet
          - 3 columns on desktop
      */}
      
      {organizations.map((org) => (
        <OrganizationCard
          key={org.id}
          organization={org}
          isSelected={selectedOrgId === org.id}
          onSelect={onSelectOrganization}
          onAddAdmin={onAddAdmin}
          onToggleStatus={onToggleStatus}
          onDelete={onDeleteOrganization}
        />
      ))}
    </div>
  );
};

export default OrganizationsList;