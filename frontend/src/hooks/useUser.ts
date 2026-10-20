/**
 * USE USER HOOK
 * 
 * Handles user management operations
 * - Create users (system admin only)
 * - Validate user data
 */

import { useState, useCallback } from 'react';
import apiClient from '../services/api/axios';
import { getErrorMessage } from '../utils/errors';

interface UserCreateData {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
  organization_id?: number;
}

export interface ManagedUser {
  id: number;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  organization_id: number | null;
  location_path: string | null;
  created_at: string | null;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  role: string;
  organization_id: number | null;
}

const useUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<ManagedUser[]>([]);

  // CREATE USER
  const createUser = useCallback(
    async (userData: UserCreateData): Promise<User> => {
      setIsLoading(true);
      setError(null);

      try {
        // DEBUG: Log what we're sending
        console.log('[useUser] Sending request with data:', {
          email: userData.email,
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          password: '***',
          role: userData.role,
          organization_id: userData.organization_id,
        });

        const response = await apiClient.post<User>(
          '/users/',
          {
            email: userData.email,
            full_name: userData.full_name,
            phone_number: userData.phone_number,
            password: userData.password,
            role: userData.role,
            organization_id: userData.organization_id,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        return response.data;
      } catch (err: any) {
        const errorMessage =
          getErrorMessage(err, 'Failed to create user');
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // LIST MEMBERS — optionally scoped to one organization
  const listUsers = useCallback(async (organizationId?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = organizationId ? { organization_id: organizationId } : {};
      const response = await apiClient.get<ManagedUser[]>('/users/', { params });
      setMembers(response.data);
      return response.data;
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to load users');
      setError(msg);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ACTIVATE / DEACTIVATE a user account
  const setUserStatus = useCallback(
    async (userId: number, isActive: boolean) => {
      setError(null);
      try {
        const response = await apiClient.patch<ManagedUser>(
          `/users/${userId}/status`,
          { is_active: isActive }
        );
        setMembers((prev) =>
          prev.map((m) => (m.id === userId ? response.data : m))
        );
        return response.data;
      } catch (err: any) {
        const msg = getErrorMessage(err, 'Failed to update user status');
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  // ADMIN: reset a member's password → returns a temp password (shown once)
  const resetUserPassword = useCallback(async (userId: number) => {
    setError(null);
    try {
      const response = await apiClient.post<{
        user_id: number;
        email: string;
        temporary_password: string;
      }>(`/users/${userId}/reset-password`);
      return response.data;
    } catch (err: any) {
      const msg = getErrorMessage(err, 'Failed to reset password');
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // SELF: update own profile (email/name/phone/password)
  const updateMyProfile = useCallback(
    async (data: {
      email?: string;
      full_name?: string;
      phone_number?: string;
      current_password?: string;
      new_password?: string;
    }) => {
      setError(null);
      try {
        const response = await apiClient.put('/users/me', data);
        return response.data;
      } catch (err: any) {
        const msg = getErrorMessage(err, 'Failed to update profile');
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  // CLEAR ERROR
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createUser,
    listUsers,
    setUserStatus,
    resetUserPassword,
    updateMyProfile,
    members,
    isLoading,
    error,
    clearError,
  };
};

export default useUser;
