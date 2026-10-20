'use client';

import React, { useState, useEffect } from 'react';
import useOrganization from '@/hooks/useOrganization';
import useUser, { ManagedUser } from '@/hooks/useUser';
import useAuthStore from '@/stores/auth.store';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useTranslation } from '@/i18n/LocaleContext';
import OrganizationsList from '@/components/admin/OrganizationsList';
import MembersPanel from '@/components/admin/MembersPanel';
import CredentialsModal from '@/components/shared/CredentialsModal';
import CreateOrganizationModal from '@/components/admin/CreateOrganizationModal';
import CreateCooperativeAdminModal, { CooperativeAdminFormData } from '@/components/admin/CreateCooperativeAdminModal';
import { Organization } from '@/types/organization.types';

/**
 * SYSTEM ADMIN DASHBOARD
 * 
 * THE COMPLETE ORCHESTRATION!
 * 
 * This page:
 * 1. Uses the hook to get state + functions
 * 2. Manages local UI state (show modal?)
 * 3. Passes data DOWN to components (props)
 * 4. Receives callbacks UP from components
 * 5. Calls hook functions to update everything
 * 
 * MAGIC: When hook updates store → this component re-renders → children re-render ✅
 */

const SystemAdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  // HOOKS
  const {
    organizations,
    isLoading,
    error,
    selectedOrgId,
    isCreating,
    selectOrganization,
    createOrganization,
    setOrganizationStatus,
    deleteOrganization,
    clearError,
  } = useOrganization();

  const {
    createUser,
    listUsers,
    setUserStatus,
    resetUserPassword,
    members,
    isLoading: isUsersLoading,
    error: userError,
  } = useUser();

  const currentUser = useAuthStore((s: any) => s.user);
  
  // LOCAL UI STATE
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newOrgForAdmin, setNewOrgForAdmin] = useState<{ id: number; name: string } | null>(null);
  const [credentials, setCredentials] = useState<{ title: string; email: string; password: string; name?: string | null } | null>(null);

  // Handle create from modal
  const handleCreateOrganization = async (data: any) => {
    try {
      const newOrg = await createOrganization(data);
      setShowCreateModal(false); // Close organization creation modal
      
      // Show cooperative admin creation modal for the new organization
      setNewOrgForAdmin({
        id: newOrg.id,
        name: newOrg.name,
      });
      setShowCreateAdminModal(true);
    } catch {
      // Error already in hook state
    }
  };

  // Handle creating cooperative admin
  const handleCreateCooperativeAdmin = async (adminData: CooperativeAdminFormData) => {
    if (!newOrgForAdmin) return;

    try {
      const payload = {
        full_name: adminData.full_name,
        email: adminData.email,
        phone_number: adminData.phone_number,
        password: adminData.password,
        role: 'cooperative_admin',
        organization_id: newOrgForAdmin.id,
      };

      console.log('[SystemAdminDashboard] Creating cooperative admin with data:', payload);

      await createUser(payload);

      // Success! Close modal, refresh members if this org is selected
      setShowCreateAdminModal(false);
      if (newOrgForAdmin.id === selectedOrgId) {
        listUsers(newOrgForAdmin.id);
      }
      // Show credentials once — passwords can't be retrieved later
      setCredentials({
        title: `Cooperative Admin — ${newOrgForAdmin.name}`,
        email: adminData.email,
        password: adminData.password,
        name: adminData.full_name,
      });
      setNewOrgForAdmin(null);
    } catch (err) {
      // Error already in hook state
      throw err;
    }
  };

  // Load members whenever the selected organization changes
  useEffect(() => {
    if (selectedOrgId) {
      listUsers(selectedOrgId);
    }
  }, [selectedOrgId]);

  // Re-open the coop-admin modal for ANY organization (fixes the
  // "cancel and it's gone forever" trap — admins can be added later)
  const handleAddAdminForOrg = (org: Organization) => {
    setNewOrgForAdmin({ id: org.id, name: org.name });
    setShowCreateAdminModal(true);
  };

  // Activate / deactivate a whole organization
  const handleToggleOrgStatus = async (org: Organization) => {
    const action = org.is_active ? 'deactivate' : 'reactivate';
    if (
      window.confirm(
        `Are you sure you want to ${action} "${org.name}"?` +
        (org.is_active
          ? '\n\nAll member logins and registration codes will be frozen until reactivation.'
          : '')
      )
    ) {
      try {
        await setOrganizationStatus(org.id, !org.is_active);
      } catch {
        // Error already in hook state
      }
    }
  };

  // Activate / deactivate a single member
  const handleToggleUserStatus = async (user: ManagedUser) => {
    const action = user.is_active ? 'deactivate' : 'reactivate';
    if (window.confirm(`Are you sure you want to ${action} ${user.email}?`)) {
      try {
        await setUserStatus(user.id, !user.is_active);
      } catch {
        // Error already in hook state
      }
    }
  };

  // Reset a member's password → generated temp password shown once
  const handleResetPassword = async (user: ManagedUser) => {
    if (!window.confirm(`Generate a temporary password for ${user.email}?\nTheir current password will stop working immediately.`)) {
      return;
    }
    try {
      const res = await resetUserPassword(user.id);
      setCredentials({
        title: 'Temporary password generated',
        email: res.email,
        password: res.temporary_password,
        name: user.full_name,
      });
    } catch {
      // Error already in hook state
    }
  };

  // Handle delete with confirmation
  const handleDeleteOrganization = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        await deleteOrganization(id);
      } catch {
      // Error already in hook state
    }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader title={t('dashboard.adminTitle')} subtitle="Manage organizations and institutions" />

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* ERROR ALERT */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
            <p className="text-red-900 font-semibold">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TITLE & CREATE BUTTON */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Organizations
              <span className="ml-3 text-lg font-semibold bg-blue-100 text-blue-900 px-3 py-1 rounded-full">
                {organizations.length}
              </span>
            </h2>
            <p className="text-gray-600 mt-2">Create and manage cooperatives and institutions</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isCreating}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-semibold"
          >
            + Create Organization
          </button>
        </div>

        {/* ORGANIZATIONS LIST */}
        <OrganizationsList
          organizations={organizations}
          selectedOrgId={selectedOrgId}
          isLoading={isLoading}
          onSelectOrganization={selectOrganization}
          onAddAdmin={handleAddAdminForOrg}
          onToggleStatus={handleToggleOrgStatus}
          onDeleteOrganization={handleDeleteOrganization}
        />

        {/* MEMBERS PANEL — shown when an org is selected */}
        {selectedOrgId && (
          <MembersPanel
            members={members}
            isLoading={isUsersLoading}
            orgName={organizations.find((o) => o.id === selectedOrgId)?.name}
            currentUserId={currentUser?.id ?? null}
            onToggleStatus={handleToggleUserStatus}
            onResetPassword={handleResetPassword}
          />
        )}
      </main>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <CreateOrganizationModal
          onSubmit={handleCreateOrganization}
          onCancel={() => setShowCreateModal(false)}
          isLoading={isCreating}
          error={error}
        />
      )}

      {/* CREATE COOPERATIVE ADMIN MODAL */}
      {showCreateAdminModal && newOrgForAdmin && (
        <CreateCooperativeAdminModal
          organizationName={newOrgForAdmin.name}
          organizationId={newOrgForAdmin.id}
          onSubmit={handleCreateCooperativeAdmin}
          onCancel={() => {
            setShowCreateAdminModal(false);
            setNewOrgForAdmin(null);
          }}
          isLoading={isUsersLoading}
          error={userError}
        />
      )}

      {/* CREDENTIALS MODAL — shown once after creating/resetting */}
      {credentials && (
        <CredentialsModal
          title={credentials.title}
          email={credentials.email}
          password={credentials.password}
          name={credentials.name}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  );
};

export default SystemAdminDashboard;