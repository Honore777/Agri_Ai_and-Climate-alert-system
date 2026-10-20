/**
 * useRegionAssignment HOOK
 * 
 * Manages region assignments:
 * - Which agronomist covers which region
 * - Load, create, delete assignments
 * 
 * Same pattern, simpler operations!
 */

import { useEffect, useState } from 'react';
import { useRegionAssignmentStore } from '../stores/region-assignment.store';
import { regionAssignmentService } from '../services/region-assignment.service';
import { RegionAssignment, CreateRegionAssignmentRequest, UseRegionAssignmentReturn } from '../types/region-assignment.types';

export const useRegionAssignment = (): UseRegionAssignmentReturn => {
  // STEP 1: Get from Zustand store
  const { assignments, setAssignments, addAssignment, removeAssignment } = useRegionAssignmentStore();
  
  // STEP 2: Local UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // STEP 3: Load on mount
  useEffect(() => {
    loadAssignments();
  }, []);
  
  // STEP 4: Define functions
  
  const loadAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await regionAssignmentService.getAllAssignments();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };
  
  const assignAgronomistToRegion = async (data: CreateRegionAssignmentRequest): Promise<RegionAssignment> => {
    setIsCreating(true);
    setError(null);
    try {
      const newAssignment = await regionAssignmentService.assignAgronomistToRegion(data);
      addAssignment(newAssignment); // ← Add to store
      return newAssignment;
    } catch (err: any) {
      setError(err.message || 'Failed to assign agronomist');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };
  
  const removeAgronomistFromRegion = async (id: number) => {
    setError(null);
    try {
      await regionAssignmentService.removeAssignment(id);
      removeAssignment(id); // ← Remove from store
    } catch (err: any) {
      setError(err.message || 'Failed to remove assignment');
      throw err;
    }
  };
  
  // STEP 5: Return everything
  return {
    assignments,
    isLoading,
    isCreating,
    error,
    loadAssignments,
    assignAgronomistToRegion,
    removeAgronomistFromRegion,
    clearError: () => setError(null),
  };
};

export default useRegionAssignment;