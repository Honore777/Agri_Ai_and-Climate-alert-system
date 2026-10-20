/**
 * Region Assignment Service
 * 
 * Manages the relationship: Agronomist → Regions
 * Example: Agronomist "John" covers regions "Eastern" and "Central"
 * 
 * When a farmer in "Eastern" region uploads an image,
 * the system finds John and assigns the prediction to him
 */

import apiClient from './api/axios';
import { RegionAssignment, CreateRegionAssignmentRequest } from '../types/region-assignment.types';

export const regionAssignmentService = {
  /**
   * Get all region assignments in my organization
   * 
   * Backend: GET /assignments/organization
   * Auth: Required (only sees assignments from my org)
   * Response: Array of AssignmentResponse
   */
  getAllAssignments: async (): Promise<RegionAssignment[]> => {
    const response = await apiClient.get('/assignments/organization');  // ✅ FIXED
    return response.data;
  },

  /**
   * Assign an agronomist to a location region with flexible level
   * 
   * Backend: POST /assignments
   * Body: {
   *   agronomist_id: number,       // Which agronomist?
   *   assignment_level: string,    // "province", "district", "sector", "cell", "village"
   *   location_id: number          // ID of that location (not a region name)
   * }
   * Auth: Required (coop_admin only)
   * Response: Newly created Assignment
   * 
   * Example usage in hook:
   * const assignment = await regionAssignmentService.assignAgronomistToRegion({
   *   agronomist_id: 5,              // Assign John (user_id 5)
   *   assignment_level: "district",  // To district level
   *   location_id: 3                 // Gasabo district (district_id = 3)
   * });
   * 
   * Now when a farmer in Gasabo uploads prediction:
   * Backend sees: farmer.district_id = 3
   * Finds assignment: agronomist_id = 5 (John)
   * Automatically assigns prediction to John!
   */
  assignAgronomistToRegion: async (data: CreateRegionAssignmentRequest): Promise<RegionAssignment> => {
    const response = await apiClient.post('/assignments', data);
    return response.data;
  },

  /**
   * Remove an assignment
   * 
   * Backend: DELETE /assignments/{id}
   * Auth: Required
   * Response: { success: true }
   */
  removeAssignment: async (id: number): Promise<void> => {
    await apiClient.delete(`/assignments/${id}`);  // ✅ FIXED
  },

  /**
   * Get assignment details
   * 
   * Backend: GET /region-assignments/{id}
   * Auth: Required
   * Response: RegionAssignment object
   */
  getAssignmentById: async (id: number): Promise<RegionAssignment> => {
    const response = await apiClient.get(`/region-assignments/${id}`);
    return response.data;
  },

  /**
   * Get all assignments for one agronomist
   * 
   * Backend: GET /region-assignments/agronomist/{agronomist_id}
   * Auth: Required
   * Response: Array of RegionAssignment
   * 
   * Example: agronomistRegions = getAgronomistRegions(5)
   * Shows: John covers ["Eastern", "Central", "Western"]
   */
  getAgronomistRegions: async (agronomistId: number): Promise<RegionAssignment[]> => {
    const response = await apiClient.get(`/region-assignments/agronomist/${agronomistId}`);
    return response.data;
  },
};

export default regionAssignmentService;