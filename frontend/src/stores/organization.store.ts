import { create } from 'zustand';
import { Organization } from '../types/organization.types';

/**
 * ORGANIZATION STORE
 * 
 * Single source of truth for organization data.
 * All state lives here.
 * Components read from this, never directly from API.
 * 
 * CONCEPT: Think of this as the "database in the browser"
 */

interface OrganizationStore {
  // STATE
  organizations: Organization[];
  selectedOrgId: number | null;
  
  // ACTIONS (setters)
  setOrganizations: (orgs: Organization[]) => void;
  addOrganization: (org: Organization) => void;
  updateOrganization: (org: Organization) => void;
  removeOrganization: (id: number) => void;
  selectOrganization: (id: number | null) => void;
  
  // HELPERS
  getSelectedOrganization: () => Organization | undefined;
  getOrganizationById: (id: number) => Organization | undefined;
}

export const useOrganizationStore = create<OrganizationStore>((set, get) => ({
  // Initial state
  organizations: [],
  selectedOrgId: null,
  
  // ACTION 1: Set entire list (from API)
  setOrganizations: (orgs) => set({ organizations: orgs }),
  
  // ACTION 2: Add one to list (after create)
  addOrganization: (org) => 
    set((state) => ({
      organizations: [...state.organizations, org],
    })),
  
  // ACTION 2b: Update one in place (status changes, edits)
  updateOrganization: (org) =>
    set((state) => ({
      organizations: state.organizations.map((o) => (o.id === org.id ? org : o)),
    })),

  // ACTION 3: Remove one from list (after delete)
  removeOrganization: (id) =>
    set((state) => ({
      organizations: state.organizations.filter((o) => o.id !== id),
    })),
  
  // ACTION 4: Select one to view details
  selectOrganization: (id) => set({ selectedOrgId: id }),
  
  // HELPER 1: Get currently selected
  getSelectedOrganization: () => {
    const state = get();
    return state.organizations.find((o) => o.id === state.selectedOrgId);
  },
  
  // HELPER 2: Find by ID
  getOrganizationById: (id) => {
    const state = get();
    return state.organizations.find((o) => o.id === id);
  },
}));