/**
 * Agronomist Service
 * 
 * Manages staff in the cooperative/institution
 * - Hire agronomists (create)
 * - View staff (read)
 * - Update info (update)
 * - Fire agronomists (delete)
 */

import apiClient from './api/axios';
import { Agronomist, CreateAgronomistRequest, UpdateAgronomistRequest } from '../types/agronomist.types';

export const agronomistService = {
  /**
   * Get all agronomists in my organization
   * 
   * Backend: GET /agronomists
   * Auth: Required (only sees agronomists from my org)
   * Response: Array of Agronomist
   */
  getAllAgronomists: async (): Promise<Agronomist[]> => {
    const response = await apiClient.get('/agronomists');
    return response.data;
  },

  /**
   * Hire a new agronomist
   * 
   * Backend: POST /agronomists
   * Body: {
   *   first_name: string,
   *   last_name: string,
   *   email: string,
   *   phone_number: string
   * }
   * Auth: Required (coop_admin only)
   * Response: Newly created Agronomist object with id
   * 
   * Example usage in hook:
   * const newAgronomist = await agronomistService.createAgronomist({
   *   first_name: 'John',
   *   last_name: 'Doe',
   *   email: 'john@example.com',
   *   phone_number: '+250123456789'
   * });
   */
  createAgronomist: async (data: CreateAgronomistRequest): Promise<Agronomist> => {
    const response = await apiClient.post('/agronomists', data);
    return response.data;
  },

  /**
   * Update agronomist information
   * 
   * Backend: PUT /agronomists/{id}
   * Body: {
   *   first_name?: string,
   *   last_name?: string,
   *   email?: string,
   *   phone_number?: string,
   *   is_active?: boolean
   * }
   * Auth: Required
   * Response: Updated Agronomist object
   * 
   * Note: All fields are OPTIONAL, so you can update just one field
   */
  updateAgronomist: async (id: number, data: UpdateAgronomistRequest): Promise<Agronomist> => {
    const response = await apiClient.put(`/agronomists/${id}`, data);
    return response.data;
  },

  /**
   * Delete/fire an agronomist
   * 
   * Backend: DELETE /agronomists/{id}
   * Auth: Required (coop_admin only)
   * Response: { success: true }
   */
  deleteAgronomist: async (id: number): Promise<void> => {
    await apiClient.delete(`/agronomists/${id}`);
  },

  /**
   * Get details of one agronomist
   * 
   * Backend: GET /agronomists/{id}
   * Auth: Required
   * Response: Agronomist object with all details and assignments
   */
  getAgronomistById: async (id: number): Promise<Agronomist> => {
    const response = await apiClient.get(`/agronomists/${id}`);
    return response.data;
  },
};

export default agronomistService;