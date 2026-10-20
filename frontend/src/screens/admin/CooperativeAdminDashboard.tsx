'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ClipboardList, UserCheck, MapPin, Compass, Users,
  Plus, Search, Stethoscope,
} from 'lucide-react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { useTranslation } from '@/i18n/LocaleContext';
import useRegistrationCode from '@/hooks/useRegistrationCode';
import useAgronomist from '@/hooks/useAgronomist';
import useRegionAssignment from '@/hooks/useRegionAssignment';
import useUser, { ManagedUser } from '@/hooks/useUser';
import useAuthStore from '@/stores/auth.store';
import RegistrationCodesList from '@/components/cooperative/RegistrationCodesList';
import GenerateCodesModal from '@/components/cooperative/GenerateCodesModal';
import AgronomistsList from '@/components/cooperative/AgronomistsList';
import CreateAgronomistModal from '@/components/cooperative/CreateAgronomistModal';
import RegionAssignmentsList from '@/components/cooperative/RegionAssignmentsList';
import AssignAgronomistModal from '@/components/cooperative/AssignAgronomistModal';
import MembersPanel from '@/components/admin/MembersPanel';
import CredentialsModal from '@/components/shared/CredentialsModal';

/**
 * COOPERATIVE ADMIN DASHBOARD
 *
 * Manages everything inside ONE organization:
 *  - Registration Codes → farmer onboarding
 *  - Agronomists (Staff) → hires + search
 *  - Region Assignments → which agronomist covers which area
 *  - Members → everyone in the org, with activate/deactivate + password reset
 */

type TabType = 'codes' | 'agronomists' | 'assignments' | 'members';

const CooperativeAdminDashboard: React.FC = () => {
  const { t } = useTranslation();

  const codingHook = useRegistrationCode();
  const agronomistHook = useAgronomist();
  const assignmentHook = useRegionAssignment();
  const {
    listUsers, setUserStatus, resetUserPassword,
    members, isLoading: isMembersLoading, error: userError,
  } = useUser();
  const currentUser = useAuthStore((s: any) => s.user);

  // ========== LOCAL UI STATE ==========
  const [activeTab, setActiveTab] = useState<TabType>('codes');
  const [showCodesModal, setShowCodesModal] = useState(false);
  const [showAgronomistModal, setShowAgronomistModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [agronomistQuery, setAgronomistQuery] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [credentials, setCredentials] = useState<{
    title: string; email: string; password: string; name?: string | null;
  } | null>(null);

  // Members load lazily the first time the tab is opened
  useEffect(() => {
    if (activeTab === 'members') {
      listUsers();
    }
  }, [activeTab]);

  // Instant client-side filtering — autosuggest for busy admins
  const filteredAgronomists = useMemo(() => {
    const q = agronomistQuery.trim().toLowerCase();
    if (!q) return agronomistHook.agronomists;
    return agronomistHook.agronomists.filter(
      (a: any) =>
        a.full_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q)
    );
  }, [agronomistQuery, agronomistHook.agronomists]);

  const filteredMembers = useMemo(() => {
    const q = memberQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.full_name?.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone_number?.toLowerCase().includes(q)
    );
  }, [memberQuery, members]);

  // ========== HANDLERS ==========

  const handleGenerateCodes = async (count: number) => {
    try {
      await codingHook.generateCodes(count);
      setShowCodesModal(false);
    } catch {
      // Error already in hook state
    }
  };

  const handleDeleteCode = async (id: number) => {
    try {
      await codingHook.deleteCode(id);
    } catch {
      // Error already in hook state
    }
  };

  const handleCreateAgronomist = async (data: any) => {
    try {
      await agronomistHook.createAgronomist(data);
      setShowAgronomistModal(false);
      // Show the created credentials once — admin shares them with the hire
      setCredentials({
        title: 'Agronomist account created',
        email: data.email,
        password: data.password,
        name: data.full_name,
      });
    } catch {
      // Error already in hook state
    }
  };

  const handleDeleteAgronomist = async (id: number) => {
    try {
      await agronomistHook.deleteAgronomist(id);
    } catch {
      // Error already in hook state
    }
  };

  const handleAssignAgronomist = async (data: any) => {
    try {
      await assignmentHook.assignAgronomistToRegion(data);
      setShowAssignmentModal(false);
    } catch {
      // Error already in hook state
    }
  };

  const handleRemoveAssignment = async (id: number) => {
    try {
      await assignmentHook.removeAgronomistFromRegion(id);
    } catch {
      // Error already in hook state
    }
  };

  const handleToggleMemberStatus = async (user: ManagedUser) => {
    const action = user.is_active ? 'deactivate' : 'reactivate';
    if (window.confirm(`Are you sure you want to ${action} ${user.email}?`)) {
      try {
        await setUserStatus(user.id, !user.is_active);
      } catch {
        // Error already in hook state
      }
    }
  };

  const handleResetMemberPassword = async (user: ManagedUser) => {
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

  // ========== RENDER ==========

  const tabs: { key: TabType; label: string; icon: React.ReactNode; activeClass: string }[] = [
    {
      key: 'codes',
      label: 'Registration Codes',
      icon: <ClipboardList className="h-4 w-4" />,
      activeClass: 'border-blue-500 text-blue-600 bg-blue-50',
    },
    {
      key: 'agronomists',
      label: 'Agronomists (Staff)',
      icon: <Stethoscope className="h-4 w-4" />,
      activeClass: 'border-purple-500 text-purple-600 bg-purple-50',
    },
    {
      key: 'assignments',
      label: 'Region Assignments',
      icon: <MapPin className="h-4 w-4" />,
      activeClass: 'border-green-500 text-green-600 bg-green-50',
    },
    {
      key: 'members',
      label: 'All Members',
      icon: <Users className="h-4 w-4" />,
      activeClass: 'border-brand-500 text-brand-600 bg-brand-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <DashboardHeader title={t('dashboard.cooperativeTitle')} subtitle="Manage staff, registration codes, and assignments" />

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* STATISTICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              value: codingHook.codes.length,
              label: 'Registration Codes',
              icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
              classes: 'from-blue-50 to-blue-100 border-blue-200 text-blue-600',
            },
            {
              value: agronomistHook.agronomists.length,
              label: 'Agronomists',
              icon: <Stethoscope className="h-5 w-5 text-purple-600" />,
              classes: 'from-purple-50 to-purple-100 border-purple-200 text-purple-600',
            },
            {
              value: assignmentHook.assignments.length,
              label: 'Assignments',
              icon: <MapPin className="h-5 w-5 text-green-600" />,
              classes: 'from-green-50 to-green-100 border-green-200 text-green-600',
            },
            {
              value: new Set(assignmentHook.assignments.map(a => a.location_display)).size,
              label: 'Regions',
              icon: <Compass className="h-5 w-5 text-yellow-600" />,
              classes: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br rounded-lg p-4 border ${stat.classes.split(' ').slice(0, 2).join(' ')}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-3xl font-bold ${stat.classes.split(' ')[3]}`}>{stat.value}</p>
                {stat.icon}
              </div>
              <p className={`text-sm font-medium mt-1 ${stat.classes.split(' ')[3].replace('-600', '-900')}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-4 py-4 font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
                  activeTab === tab.key ? `border-b-2 ${tab.activeClass}` : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          <div className="p-6">

            {/* REGISTRATION CODES TAB */}
            {activeTab === 'codes' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Registration Codes</h2>
                  <button
                    onClick={() => setShowCodesModal(true)}
                    disabled={codingHook.isGenerating}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    Generate Codes
                  </button>
                </div>

                {codingHook.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-900 font-semibold">{codingHook.error}</p>
                    <button
                      onClick={codingHook.clearError}
                      className="text-red-600 hover:text-red-900 text-sm mt-2 font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <RegistrationCodesList
                  codes={codingHook.codes}
                  isLoading={codingHook.isLoading}
                  onDelete={handleDeleteCode}
                />
              </div>
            )}

            {/* AGRONOMISTS TAB */}
            {activeTab === 'agronomists' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">Agronomists (Staff)</h2>
                  <button
                    onClick={() => setShowAgronomistModal(true)}
                    disabled={agronomistHook.isCreating}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    Hire Agronomist
                  </button>
                </div>

                {/* Autosuggest search — instant filter for large teams */}
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={agronomistQuery}
                    onChange={(e) => setAgronomistQuery(e.target.value)}
                    placeholder="Search by name or email…"
                    className="input-field pl-9"
                  />
                </div>

                {agronomistHook.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-900 font-semibold">{agronomistHook.error}</p>
                    <button
                      onClick={agronomistHook.clearError}
                      className="text-red-600 hover:text-red-900 text-sm mt-2 font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <AgronomistsList
                  agronomists={filteredAgronomists}
                  isLoading={agronomistHook.isLoading}
                  onDelete={handleDeleteAgronomist}
                />
              </div>
            )}

            {/* REGION ASSIGNMENTS TAB */}
            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Region Assignments</h2>
                  <button
                    onClick={() => setShowAssignmentModal(true)}
                    disabled={assignmentHook.isCreating || agronomistHook.agronomists.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
                  >
                    <UserCheck className="h-4 w-4" />
                    Assign Agronomist
                  </button>
                </div>

                {assignmentHook.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-900 font-semibold">{assignmentHook.error}</p>
                    <button
                      onClick={assignmentHook.clearError}
                      className="text-red-600 hover:text-red-900 text-sm mt-2 font-semibold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <RegionAssignmentsList
                  assignments={assignmentHook.assignments}
                  isLoading={assignmentHook.isLoading}
                  onDelete={handleRemoveAssignment}
                />
              </div>
            )}

            {/* MEMBERS TAB — everyone in the org, with admin actions */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">All Members</h2>
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Search members by name, email or phone…"
                      className="input-field pl-9"
                    />
                  </div>
                </div>

                {userError && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-900 font-semibold">{userError}</p>
                  </div>
                )}

                <MembersPanel
                  members={filteredMembers}
                  isLoading={isMembersLoading}
                  orgName={undefined}
                  currentUserId={currentUser?.id ?? null}
                  onToggleStatus={handleToggleMemberStatus}
                  onResetPassword={handleResetMemberPassword}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODALS */}
      {showCodesModal && (
        <GenerateCodesModal
          onSubmit={handleGenerateCodes}
          onCancel={() => {
            setShowCodesModal(false);
            codingHook.clearError();
          }}
          isLoading={codingHook.isGenerating}
          error={codingHook.error}
        />
      )}

      {showAgronomistModal && (
        <CreateAgronomistModal
          onSubmit={handleCreateAgronomist}
          onCancel={() => {
            setShowAgronomistModal(false);
            agronomistHook.clearError();
          }}
          isLoading={agronomistHook.isCreating}
          error={agronomistHook.error}
        />
      )}

      {showAssignmentModal && (
        <AssignAgronomistModal
          agronomists={agronomistHook.agronomists}
          onSubmit={handleAssignAgronomist}
          onCancel={() => {
            setShowAssignmentModal(false);
            assignmentHook.clearError();
          }}
          isLoading={assignmentHook.isCreating}
          error={assignmentHook.error}
        />
      )}

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

export default CooperativeAdminDashboard;
