/**
 * useAgronomist HOOK
 * 
 * Manages agronomist data:
 * - Load list of staff
 * - Hire new agronomist
 * - Update agronomist info
 * - Fire agronomist
 * 
 * Same pattern as useRegistrationCode!
 */

import { useEffect, useState } from 'react';
import { useAgronomistStore } from '../stores/agronomist.store';
import { agronomistService } from '../services/agronomist.service';
import { Agronomist, CreateAgronomistRequest, UpdateAgronomistRequest, UseAgronomistReturn } from '../types/agronomist.types';

export const useAgronomist = (): UseAgronomistReturn => {
  // STEP 1: Get from Zustand store
  const { agronomists, setAgronomists, addAgronomist, updateAgronomistStore, removeAgronomist } = useAgronomistStore();
  
  // STEP 2: Local UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // STEP 3: Load on mount
  useEffect(() => {
    loadAgronomists();
  }, []);
  
  // STEP 4: Define functions
  
  const loadAgronomists = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await agronomistService.getAllAgronomists();
      setAgronomists(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load agronomists');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createAgronomist = async (data: CreateAgronomistRequest): Promise<Agronomist> => {
    setIsCreating(true);
    setError(null);
    try {
      const newAgronomist = await agronomistService.createAgronomist(data);
      addAgronomist(newAgronomist); // ← Add to store
      return newAgronomist;
    } catch (err: any) {
      setError(err.message || 'Failed to create agronomist');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };
  
  const updateAgronomist = async (id: number, data: UpdateAgronomistRequest): Promise<Agronomist> => {
    setError(null);
    try {
      const updated = await agronomistService.updateAgronomist(id, data);
      updateAgronomistStore(id, updated); // ← Update in store
      return updated;
    } catch (err: any) {
      setError(err.message || 'Failed to update agronomist');
      throw err;
    }
  };
  
  const deleteAgronomist = async (id: number) => {
    setError(null);
    try {
      await agronomistService.deleteAgronomist(id);
      removeAgronomist(id); // ← Remove from store
    } catch (err: any) {
      setError(err.message || 'Failed to delete agronomist');
      throw err;
    }
  };
  
  // STEP 5: Return everything
  return {
    agronomists,
    isLoading,
    isCreating,
    error,
    loadAgronomists,
    createAgronomist,
    updateAgronomist,
    deleteAgronomist,
    clearError: () => setError(null),
  };
};

export default useAgronomist;