/**
 * AGRONOMIST TYPES
 * 
 * Agronomists are staff members who review farmer predictions
 * and provide guidance. They're assigned to specific regions.
 */

export interface Agronomist {
  id: number;
  organization_id: number;        // Which cooperative employs them
  full_name: string;              // ✅ FIXED: Backend returns full_name (not separate first/last)
  email: string;
  phone_number: string;
  assigned_regions?: string[];    // Optional: regions they cover
  is_active: boolean;
  created_at: string;
}

export interface CreateAgronomistRequest {
  first_name: string;  // Frontend form collects separate fields
  last_name: string;   // But sends combined to backend
  email: string;
  phone_number: string;
  password: string;    // ✅ NEW: Agronomist sets their own password immediately
}

export interface UpdateAgronomistRequest {
  first_name?: string;  // Optional update fields
  last_name?: string;
  email?: string;
  phone_number?: string;
  is_active?: boolean;
}

export interface UseAgronomistReturn {
  // STATE
  agronomists: Agronomist[];
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  
  // FUNCTIONS
  loadAgronomists: () => Promise<void>;
  createAgronomist: (data: CreateAgronomistRequest) => Promise<Agronomist>;
  updateAgronomist: (id: number, data: UpdateAgronomistRequest) => Promise<Agronomist>;
  deleteAgronomist: (id: number) => Promise<void>;
  clearError: () => void;
}