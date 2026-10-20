/**
 * REGION ASSIGNMENT TYPES
 * 
 * Assigns agronomists to regions
 * Example: Agronomist "John Doe" (john@example.com) covers "Gasabo District"
 */

export interface RegionAssignment {
  id: number;
  organization_id: number;        // Which cooperative
  agronomist_id: number;          // Which agronomist
  agronomist_name: string;        // ✅ Full name of agronomist (required)
  agronomist_email: string;       // ✅ NEW: Email for contact (required)
  location_id: number;            // ✅ ID of the assigned location
  assignment_level: string;       // ✅ "province", "district", "sector", "cell", "village"
  location_display: string;       // ✅ Human readable: "Gasabo District"
  created_at: string;             // ✅ When assigned (ISO format)
  is_active: boolean;
  
  // Optional raw location IDs for advanced use
  province_id?: number;
  district_id?: number;
  sector_id?: number;
  cell_id?: number;
  village_id?: number;
}

export interface CreateRegionAssignmentRequest {
  agronomist_id: number;
  assignment_level: string;   // ✅ "province", "district", "sector", "cell", "village"
  location_id: number;        // ✅ ID of province/district/sector/cell/village (not a region name)
}

export interface UseRegionAssignmentReturn {
  // STATE
  assignments: RegionAssignment[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  
  // FUNCTIONS
  loadAssignments: () => Promise<void>;
  assignAgronomistToRegion: (data: CreateRegionAssignmentRequest) => Promise<RegionAssignment>;
  removeAgronomistFromRegion: (id: number) => Promise<void>;
  clearError: () => void;
}