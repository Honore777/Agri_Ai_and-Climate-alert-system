/**
 * REGION ASSIGNMENT ZUSTAND STORE
 * 
 * Global state for agronomist region assignments
 * Tracks which agronomist covers which region
 */

import { create } from 'zustand';
import { RegionAssignment } from '../types/region-assignment.types';

interface RegionAssignmentStore {
  // STATE
  assignments: RegionAssignment[];
  
  // SETTERS
  setAssignments: (assignments: RegionAssignment[]) => void;
  addAssignment: (assignment: RegionAssignment) => void;
  removeAssignment: (id: number) => void;
  
  // GETTERS
  getAssignmentById: (id: number) => RegionAssignment | undefined;
  getAgronomistAssignments: (agronomistId: number) => RegionAssignment[];
  getRegionAssignments: (region: string) => RegionAssignment[];
}

export const useRegionAssignmentStore = create<RegionAssignmentStore>((set, get) => ({
  // INITIAL STATE
  assignments: [],
  
  // SETTER: Replace entire assignments array
  // Used when: Hook loads assignments from backend
  setAssignments: (assignments) =>
    set({ assignments }),
  
  // SETTER: Add new assignment
  // Used when: Hook assigns agronomist to region
  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [...state.assignments, assignment],
    })),
  
  // SETTER: Remove assignment
  // Used when: Hook removes agronomist from region
  removeAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((assign) => assign.id !== id),
    })),
  
  // GETTER: Find assignment by id
  getAssignmentById: (id) => {
    const state = get();
    return state.assignments.find((assign) => assign.id === id);
  },
  
  // GETTER: Get all regions for one agronomist
  // Example: getAgronomistAssignments(5) returns all regions agronomist #5 covers
  getAgronomistAssignments: (agronomistId) => {
    const state = get();
    return state.assignments.filter((assign) => assign.agronomist_id === agronomistId);
  },
  
  // GETTER: Get all agronomists assigned to a region
  // Example: getRegionAssignments("Eastern") returns who covers Eastern region
  getRegionAssignments: (region) => {
    const state = get();
    return state.assignments.filter((assign) => assign.location_display === region);
  },
}));

export default useRegionAssignmentStore;
