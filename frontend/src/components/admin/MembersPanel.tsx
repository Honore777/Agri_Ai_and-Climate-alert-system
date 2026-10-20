'use client';

import React from 'react';
import { MapPin, KeyRound } from 'lucide-react';
import { ManagedUser } from '@/hooks/useUser';

/**
 * MEMBERS PANEL
 *
 * Rich member cards for an organization: role, location, joined date,
 * plus admin actions — activate/deactivate and password reset.
 * Deactivation blocks login; reset generates a temp password shown once.
 */

interface MembersPanelProps {
  members: ManagedUser[];
  isLoading: boolean;
  orgName: string | undefined;
  currentUserId: number | null;
  onToggleStatus: (user: ManagedUser) => void;
  onResetPassword: (user: ManagedUser) => void;
}

const MembersPanel: React.FC<MembersPanelProps> = ({
  members,
  isLoading,
  orgName,
  currentUserId,
  onToggleStatus,
  onResetPassword,
}) => {
  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      cooperative_admin: 'bg-purple-100 text-purple-800',
      agronomist: 'bg-blue-100 text-blue-800',
      farmer: 'bg-green-100 text-green-800',
      system_admin: 'bg-red-100 text-red-800',
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
          styles[role] || 'bg-gray-100 text-gray-700'
        }`}
      >
        {role.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Members
          {orgName && (
            <span className="ml-2 text-base font-normal text-gray-500">
              of {orgName}
            </span>
          )}
        </h3>
        <span className="text-sm font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
          {members.length}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-8 w-8 border-4 border-blue-300 border-t-blue-600 rounded-full" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 font-semibold">No members found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {members.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between px-5 py-4 ${
                !user.is_active ? 'opacity-60 bg-gray-50' : ''
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-semibold text-gray-900 truncate">
                    {user.full_name || user.email}
                  </p>
                  {roleBadge(user.role)}
                  {!user.is_active && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      deactivated
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {user.email}
                  {user.phone_number ? ` · ${user.phone_number}` : ''}
                </p>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                  {user.location_path && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.location_path}
                    </span>
                  )}
                  {user.created_at && (
                    <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {user.id !== currentUserId && (
                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => onResetPassword(user)}
                    title="Generate a temporary password"
                    className="inline-flex items-center gap-1.5 rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Reset password
                  </button>
                  <button
                    onClick={() => onToggleStatus(user)}
                    className={`
                      px-4 py-1.5 rounded text-sm font-medium transition-colors
                      ${user.is_active
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-green-500 text-white hover:bg-green-600'
                      }
                    `}
                  >
                    {user.is_active ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersPanel;
