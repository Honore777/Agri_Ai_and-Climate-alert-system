/**
 * useRegistrationCode HOOK
 * 
 * This hook is the SMART LAYER that:
 * 1. Fetches registration codes from backend
 * 2. Stores them in Zustand (global state)
 * 3. Manages UI state (loading, error)
 * 4. Provides functions to create/delete/verify codes
 * 
 * PATTERN:
 * - Get from Zustand store
 * - Add local UI state (isLoading, error)
 * - Define functions that call service + update store
 * - Return everything
 */

import { useEffect, useState } from 'react';
import { useRegistrationCodeStore } from '../stores/registration-code.store';
import { registrationCodeService } from '../services/registration-code.service';
import { RegistrationCode, UseRegistrationCodeReturn } from '../types/registration-code.types';

export const useRegistrationCode = (): UseRegistrationCodeReturn => {
  // STEP 1: Get store functions and state
  const { codes, setCodes, removeCode } = useRegistrationCodeStore();
  
  // STEP 2: Local UI state (NOT in Zustand, just for this hook)
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // STEP 3: Load codes when component first mounts
  useEffect(() => {
    loadCodes();
  }, []);
  
  // STEP 4: Define functions
  
  const loadCodes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await registrationCodeService.getAllCodes();
      setCodes(data); // ← Update Zustand store
    } catch (err: any) {
      setError(err.message || 'Failed to load codes');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generateCodes = async (count: number): Promise<RegistrationCode[]> => {
    setIsGenerating(true);
    setError(null);
    try {
      // Call service to generate codes
      await registrationCodeService.generateCodes(count);
      
      // Immediately fetch all codes to get full objects with IDs
      const allCodes = await registrationCodeService.getAllCodes();
      
      // Update store with all codes
      setCodes(allCodes);
      
      return allCodes;
    } catch (err: any) {
      setError(err.message || 'Failed to generate codes');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };
  
  const deleteCode = async (id: number) => {
    setError(null);
    try {
      await registrationCodeService.deleteCode(id);
      removeCode(id); // ← Remove from store
    } catch (err: any) {
      setError(err.message || 'Failed to delete code');
      throw err;
    }
  };
  
  const verififyCode = async (code: string) => {
    try {
      const response = await registrationCodeService.verifyCode(code);
      return response;
    } catch (err: any) {
      setError(err.message || 'Code verification failed');
      throw err;
    }
  };
  
  // STEP 5: Return everything
  return {
    codes,
    isLoading,
    isGenerating,
    error,
    loadCodes,
    generateCodes,
    deleteCode,
    verififyCode,
    clearError: () => setError(null),
  };
};

export default useRegistrationCode;