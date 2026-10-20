/**
 * Registration Code Service
 * 
 * This service handles ALL communication with backend for registration codes.
 * It's stateless - just takes in data, calls API, returns response.
 * 
 * The hook will handle:
 * - Updating Zustand store
 * - Managing loading/error state
 * 
 * The service only handles:
 * - Making HTTP requests
 * - Returning data
 * - Throwing errors (which the hook catches)
 */

import apiClient from './api/axios';
import { RegistrationCode, CodeVerificationResponse } from '../types/registration-code.types';

export const registrationCodeService = {
  /**
   * Get all registration codes for my organization
   * 
   * Backend: GET /registration-codes
   * Auth: Required (only sees codes from my org)
   * Response: Array of RegistrationCode
   */
  getAllCodes: async (): Promise<RegistrationCode[]> => {
    const response = await apiClient.get('/registration-codes');
    return response.data;
  },

  /**
   * Generate N new registration codes
   * 
   * Backend: POST /registration-codes/generate
   * Body: { role: "farmer", quantity: number }
   * Auth: Required (coop_admin only)
   * Response: { codes: string[] }
   * 
   * Location is NOT captured here - farmer provides location during registration
   * 
   * Example: generateCodes(5) creates 5 codes for farmers
   */
  generateCodes: async (count: number): Promise<string[]> => {
    const response = await apiClient.post('/registration-codes/generate', {
      role: 'farmer',    // ✅ Role specified by admin
      quantity: count    // ✅ How many codes needed
      // ✅ Organization ID comes from backend (current_user.organization_id)
      // ✅ Location NOT needed here - farmer provides it during registration
    });
    return response.data.codes;  // ✅ Response has 'codes' array
  },

  /**
   * Verify if a registration code is valid
   * 
   * Backend: POST /registration-codes/verify
   * Body: { code: string }
   * Auth: Optional (farmers check codes)
   * Response: { valid: boolean, organization_id?: number }
   * 
   * Used by: Farmers registering, or coop admins testing codes
   */
  verifyCode: async (code: string): Promise<CodeVerificationResponse> => {
    const response = await apiClient.post('/registration-codes/verify', { code });
    return response.data;
  },

  /**
   * Delete a registration code
   * 
   * Backend: DELETE /registration-codes/{id}
   * Auth: Required (coop_admin can only delete their org's codes)
   * Response: { success: true }
   * 
   * Only coop admins can delete codes from their org
   */
  deleteCode: async (id: number): Promise<void> => {
    await apiClient.delete(`/registration-codes/${id}`);
  },

  /**
   * Get details of one registration code
   * 
   * Backend: GET /registration-codes/{id}
   * Auth: Required
   * Response: RegistrationCode object with all details
   */
  getCodeById: async (id: number): Promise<RegistrationCode> => {
    const response = await apiClient.get(`/registration-codes/${id}`);
    return response.data;
  },
};

export default registrationCodeService;