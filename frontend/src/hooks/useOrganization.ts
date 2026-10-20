import { useState, useEffect } from 'react';
import organizationService from '../services/organization.service';
import { useOrganizationStore } from '../stores/organization.store';
import { Organization, OrganizationCreateRequest, UseOrganizationReturn } from '../types/organization.types';

/**
 * USE ORGANIZATION HOOK
 * 
 * THIS IS THE ORCHESTRATION LAYER - THE MAGIC HAPPENS HERE!
 * 
 * It combines:
 * 1. Service layer (API calls)
 * 2. Zustand store (state management)
 * 3. Local state (loading, error)
 * 4. Business logic (validation, side effects)
 * 
 * Components DON'T call service directly.
 * Components DON'T update store directly.
 * Components ONLY use this hook!
 * 
 * ANALOGY: Hook = Manager of a restaurant
 *   - Takes orders (from component)
 *   - Talks to kitchen (calls service)
 *   - Updates dining room (updates store)
 *   - Reports back (returns state)
 */

export const useOrganization = (): UseOrganizationReturn => {
  // Get store state and actions
  const {
    organizations,
    selectedOrgId,
    setOrganizations,
    addOrganization,
    updateOrganization,
    removeOrganization,
    selectOrganization,
  } = useOrganizationStore();
  
  // Local state for async operations
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * EFFECT 1: Load organizations on mount
   * 
   * When component using this hook mounts,
   * automatically fetch organizations from API
   */
  useEffect(() => {
    loadOrganizations();
  }, []);
  
  /**
   * FUNCTION 1: Load organizations from API
   * 
   * Steps:
   * 1. Set loading=true (show spinner)
   * 2. Call API via service
   * 3. Update store with data
   * 4. Clear error
   * 5. Set loading=false (hide spinner)
   */
  const loadOrganizations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await organizationService.getAllOrganizations();
      setOrganizations(data);  // ← Store it
    } catch (err: any) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * FUNCTION 2: Create new organization
   * 
   * Steps:
   * 1. Validate input
   * 2. Call API via service
   * 3. Add to store (instant UI update)
   * 4. Return new org to component
   */
  const createOrganization = async (
    data: OrganizationCreateRequest
  ): Promise<Organization> => {
    setIsCreating(true);
    setError(null);
    try {
      // Validate
      if (!data.name.trim()) {
        throw new Error('Organization name is required');
      }
      
      // Call API
      const newOrg = await organizationService.createOrganization(data);
      
      // Add to store (all components see it instantly!)
      addOrganization(newOrg);
      
      return newOrg;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };
  
  /**
   * FUNCTION 3: Delete organization
   * 
   * Steps:
   * 1. Call API via service
   * 2. Remove from store
   * 3. Clear selection if was selected
   */
  const deleteOrganization = async (id: number) => {
    setError(null);
    try {
      // Call API
      await organizationService.deleteOrganization(id);
      
      // Update store
      removeOrganization(id);
      
      // Clear selection if this was selected
      if (selectedOrgId === id) {
        selectOrganization(null);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };
  
  /**
   * FUNCTION 3b: Activate/deactivate an organization
   *
   * Deactivation blocks logins for every member — softer than delete.
   */
  const setOrganizationStatus = async (id: number, isActive: boolean) => {
    setError(null);
    try {
      const updated = await organizationService.setOrganizationStatus(id, isActive);
      updateOrganization(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * FUNCTION 4: Clear error
   */
  const clearError = () => {
    setError(null);
  };
  
  // RETURN everything component needs
  return {
    // State
    organizations,
    isLoading,
    error,
    selectedOrgId,
    isCreating,
    
    // Functions
    loadOrganizations,
    selectOrganization,
    createOrganization,
    setOrganizationStatus,
    deleteOrganization,
    clearError,
  };
};

export default useOrganization;