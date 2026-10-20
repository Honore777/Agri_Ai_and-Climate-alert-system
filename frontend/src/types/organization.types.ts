export interface Organization {
  id: number;
  name: string;
  type: 'cooperative' | 'institution';
  registration_code: string;
  region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationCreateRequest {
  name: string;
  type: 'cooperative' | 'institution';
  region: string;
}

export interface UseOrganizationReturn {
  organizations: Organization[];
  isLoading: boolean;
  error: string | null;
  selectedOrgId: number | null;
  isCreating: boolean;
  
  loadOrganizations: () => Promise<void>;
  selectOrganization: (id: number | null) => void;
  createOrganization: (data: OrganizationCreateRequest) => Promise<Organization>;
  setOrganizationStatus: (id: number, isActive: boolean) => Promise<void>;
  deleteOrganization: (id: number) => Promise<void>;
  clearError: () => void;
}