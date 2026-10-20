/**
 * REGISTRATION CODE ZUSTAND STORE
 * 
 * This is the GLOBAL STATE for registration codes.
 * All components that need codes read from here.
 * 
 * ZUSTAND PATTERN:
 * create<StoreType>((set, get) => ({
 *   // STATE
 *   state: value,
 *   
 *   // SETTERS - update state
 *   setState: (newValue) => set({ state: newValue }),
 *   
 *   // GETTERS - read state
 *   getState: () => get().state
 * }))
 */

import { create } from 'zustand';
import { RegistrationCode } from '../types/registration-code.types';

interface RegistrationCodeStore {
  // STATE
  codes: RegistrationCode[];
  
  // SETTERS - used by hook to update store
  setCodes: (codes: RegistrationCode[]) => void;
  addCodes: (newCodes: RegistrationCode[]) => void;
  addCode: (code: RegistrationCode) => void;
  removeCode: (id: number) => void;
  
  // GETTERS - read state
  getCodeById: (id: number) => RegistrationCode | undefined;
  getUnusedCodes: () => RegistrationCode[];
}

export const useRegistrationCodeStore = create<RegistrationCodeStore>((set, get) => ({
  // INITIAL STATE
  codes: [],
  
  // SETTER: Replace entire codes array
  // Used when: Hook loads codes from backend
  // Example: setCodes([code1, code2, code3])
  setCodes: (codes) =>
    set({ codes }),
  
  // SETTER: Add multiple codes
  // Used when: Hook generates 5 new codes
  // Example: addCodes([newCode1, newCode2, ...])
  addCodes: (newCodes) =>
    set((state) => ({
      codes: [...state.codes, ...newCodes],
    })),
  
  // SETTER: Add single code
  // Used when: One code is created
  addCode: (code) =>
    set((state) => ({
      codes: [...state.codes, code],
    })),
  
  // SETTER: Remove code by id
  // Used when: Hook deletes a code
  // Example: removeCode(123)
  removeCode: (id) =>
    set((state) => ({
      codes: state.codes.filter((code) => code.id !== id),
    })),
  
  // GETTER: Find code by id
  // Used by: Components showing code details
  getCodeById: (id) => {
    const state = get();
    return state.codes.find((code) => code.id === id);
  },
  
  // GETTER: Get all unused codes
  // Used by: Dashboard showing "available codes"
  getUnusedCodes: () => {
    const state = get();
    return state.codes.filter((code) => !code.is_used);
  },
}));

export default useRegistrationCodeStore;
