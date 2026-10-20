/**
 * AGRONOMIST ZUSTAND STORE
 * 
 * Global state for agronomist staff management
 * Holds list of all agronomists in the cooperative
 */

import { create } from 'zustand';
import { Agronomist } from '../types/agronomist.types';

interface AgronomistStore {
  // STATE
  agronomists: Agronomist[];
  
  // SETTERS
  setAgronomists: (agronomists: Agronomist[]) => void;
  addAgronomist: (agronomist: Agronomist) => void;
  updateAgronomistStore: (id: number, updated: Agronomist) => void;
  removeAgronomist: (id: number) => void;
  
  // GETTERS
  getAgronomistById: (id: number) => Agronomist | undefined;
  getActiveAgronomists: () => Agronomist[];
}

export const useAgronomistStore = create<AgronomistStore>((set, get) => ({
  // INITIAL STATE
  agronomists: [],
  
  // SETTER: Replace entire agronomists array
  // Used when: Hook loads agronomists from backend
  setAgronomists: (agronomists) =>
    set({ agronomists }),
  
  // SETTER: Add new agronomist
  // Used when: Hook creates new agronomist
  addAgronomist: (agronomist) =>
    set((state) => ({
      agronomists: [...state.agronomists, agronomist],
    })),
  
  // SETTER: Update existing agronomist
  // Used when: Hook updates agronomist info
  updateAgronomistStore: (id, updated) =>
    set((state) => ({
      agronomists: state.agronomists.map((agro) =>
        agro.id === id ? updated : agro
      ),
    })),
  
  // SETTER: Remove agronomist
  // Used when: Hook deletes agronomist
  removeAgronomist: (id) =>
    set((state) => ({
      agronomists: state.agronomists.filter((agro) => agro.id !== id),
    })),
  
  // GETTER: Find agronomist by id
  getAgronomistById: (id) => {
    const state = get();
    return state.agronomists.find((agro) => agro.id === id);
  },
  
  // GETTER: Get only active agronomists
  getActiveAgronomists: () => {
    const state = get();
    return state.agronomists.filter((agro) => agro.is_active);
  },
}));

export default useAgronomistStore;
