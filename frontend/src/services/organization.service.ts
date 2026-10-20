import apiClient from './api/axios';
import { getErrorMessage } from '../utils/errors';
import { Organization, OrganizationCreateRequest } from '../types/organization.types';

/**
 * ORGANIZATION SERVICE
 * 
 * This layer ONLY talks to the backend API.
 * It doesn't manage state, just makes HTTP calls.
 * 
 * Each function = one API endpoint
 */

export const organizationService = {
  /**
   * Fetch all organizations
   * GET /api/v1/organizations
   */
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const response = await apiClient.get<Organization[]>('/organizations');
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to load organizations'));
    }
  },

  /**
   * Get single organization
   * GET /api/v1/organizations/{id}
   */
  async getOrganization(id: number): Promise<Organization> {
    try {
      const response = await apiClient.get<Organization>(`/organizations/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Organization not found'));
    }
  },

  /**
   * Create new organization
   * POST /api/v1/organizations
   * 
   * Request body: { name, type, region }
   * Response: full Organization object
   */
  async createOrganization(data: OrganizationCreateRequest): Promise<Organization> {
    try {
      const response = await apiClient.post<Organization>('/organizations', data);
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to create organization'));
    }
  },

  /**
   * Activate/deactivate organization
   * PATCH /api/v1/organizations/{id}/status
   */
  async setOrganizationStatus(id: number, isActive: boolean): Promise<Organization> {
    try {
      const response = await apiClient.patch<Organization>(
        `/organizations/${id}/status`,
        { is_active: isActive }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to update organization status'));
    }
  },

  /**
   * Delete organization
   * DELETE /api/v1/organizations/{id}
   */
  async deleteOrganization(id: number): Promise<void> {
    try {
      await apiClient.delete(`/organizations/${id}`);
    } catch (error: any) {
      throw new Error(getErrorMessage(error, 'Failed to delete organization'));
    }
  },
};

export default organizationService;