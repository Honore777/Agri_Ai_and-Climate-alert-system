'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { CreateRegionAssignmentRequest } from '../../types/region-assignment.types';
import { Agronomist } from '../../types/agronomist.types';
import axios from '../../services/api/axios';

interface AssignAgronomistModalProps {
  agronomists: Agronomist[];
  onSubmit: (data: CreateRegionAssignmentRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * ASSIGN AGRONOMIST MODAL - FORM COMPONENT
 * 
 * Form to assign agronomist to a region/location
 * Features:
 * - Select: agronomist, location level (province/district/sector/cell/village)
 * - Cascading dropdowns for location hierarchy
 * 
 * Data flow:
 * Form submit → onSubmit({ agronomist_id, assignment_level, location_id })
 * → Hook calls service
 * → Backend creates Assignment record
 * → From now on: predictions from that location go to this agronomist
 * → Service returns assignment
 * → Hook adds to store
 * → List updates ✨
 */

const AssignAgronomistModal: React.FC<AssignAgronomistModalProps> = ({
  agronomists,
  onSubmit,
  onCancel,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = useState({
    agronomist_id: '',
    assignment_level: 'district',  // Default: district level
    location_id: '',
  });

  // Location data for cascading dropdowns
  const [locations, setLocations] = useState({
    provinces: [],
    districts: [],
    sectors: [],
    cells: [],
    villages: [],
  });

  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');

  const [localError, setLocalError] = useState<string | null>(null);
  const [loadingLocs, setLoadingLocs] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadDistricts(selectedProvince);
    } else {
      setLocations(prev => ({...prev, districts: [], sectors: [], cells: [], villages: []}));
    }
  }, [selectedProvince]);

  // Load sectors when district changes
  useEffect(() => {
    if (selectedDistrict) {
      loadSectors(selectedDistrict);
    } else {
      setLocations(prev => ({...prev, sectors: [], cells: [], villages: []}));
    }
  }, [selectedDistrict]);

  // Load cells when sector changes
  useEffect(() => {
    if (selectedSector) {
      loadCells(selectedSector);
    } else {
      setLocations(prev => ({...prev, cells: [], villages: []}));
    }
  }, [selectedSector]);

  // Load villages when cell changes
  useEffect(() => {
    if (selectedCell) {
      loadVillages(selectedCell);
    } else {
      setLocations(prev => ({...prev, villages: []}));
    }
  }, [selectedCell]);

  const loadProvinces = async () => {
    setLoadingLocs(true);
    try {
      const response = await axios.get('/locations/provinces');
      setLocations(prev => ({ ...prev, provinces: response.data }));
    } catch (err) {
      console.error('Error loading provinces:', err);
    } finally {
      setLoadingLocs(false);
    }
  };

  const loadDistricts = async (provinceId: string) => {
    setLoadingLocs(true);
    try {
      const response = await axios.get(`/locations/provinces/${provinceId}/districts`);
      setLocations(prev => ({ ...prev, districts: response.data, sectors: [], cells: [], villages: [] }));
    } catch (err) {
      console.error('Error loading districts:', err);
    } finally {
      setLoadingLocs(false);
    }
  };

  const loadSectors = async (districtId: string) => {
    setLoadingLocs(true);
    try {
      const response = await axios.get(`/locations/districts/${districtId}/sectors`);
      setLocations(prev => ({ ...prev, sectors: response.data, cells: [], villages: [] }));
    } catch (err) {
      console.error('Error loading sectors:', err);
    } finally {
      setLoadingLocs(false);
    }
  };

  const loadCells = async (sectorId: string) => {
    setLoadingLocs(true);
    try {
      const response = await axios.get(`/locations/sectors/${sectorId}/cells`);
      setLocations(prev => ({ ...prev, cells: response.data, villages: [] }));
    } catch (err) {
      console.error('Error loading cells:', err);
    } finally {
      setLoadingLocs(false);
    }
  };

  const loadVillages = async (cellId: string) => {
    setLoadingLocs(true);
    try {
      const response = await axios.get(`/locations/cells/${cellId}/villages`);
      setLocations(prev => ({ ...prev, villages: response.data }));
    } catch (err) {
      console.error('Error loading villages:', err);
    } finally {
      setLoadingLocs(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    setFormData(prev => ({ ...prev, assignment_level: level, location_id: '' }));
    // Reset location selections when level changes
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedSector('');
    setSelectedCell('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate
    if (!formData.agronomist_id) {
      setLocalError('Please select an agronomist');
      return;
    }
    if (!formData.assignment_level) {
      setLocalError('Please select location level');
      return;
    }
    if (!formData.location_id) {
      setLocalError('Please select a location');
      return;
    }

    try {
      await onSubmit({
        agronomist_id: parseInt(formData.agronomist_id),
        assignment_level: formData.assignment_level,
        location_id: parseInt(formData.location_id),
      });
      setFormData({ agronomist_id: '', assignment_level: 'district', location_id: '' });
    } catch (err: any) {
      setLocalError(err.message || 'Failed to assign agronomist');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl my-auto">
        {/* Header */}
        <div className="bg-purple-500 p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold text-white">Assign Agronomist</h2>
          <p className="text-purple-100 mt-1">Assign to geographic region with flexible location levels</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-900 text-sm">{error || localError}</p>
            </div>
          )}

          {/* Agronomist Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Select Agronomist *
            </label>
            <select
              name="agronomist_id"
              value={formData.agronomist_id}
              onChange={handleChange}
              disabled={isLoading || loadingLocs || agronomists.length === 0}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="">-- Select an agronomist --</option>
              {agronomists.map(agro => (
                <option key={agro.id} value={agro.id}>
                  {agro.full_name} ({agro.email})
                </option>
              ))}
            </select>
            {agronomists.length === 0 && (
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                <AlertTriangle className="h-3.5 w-3.5" /> No agronomists available. Hire one first.
              </p>
            )}
          </div>

          {/* Location Level Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Assignment Level *
            </label>
            <select
              value={formData.assignment_level}
              onChange={handleLevelChange}
              disabled={isLoading || loadingLocs}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
            >
              <option value="province">Province (Covers all districts in province)</option>
              <option value="district">District (Covers all sectors in district)</option>
              <option value="sector">Sector (Covers all cells in sector)</option>
              <option value="cell">Cell (Covers all villages in cell)</option>
              <option value="village">Village (Specific village only)</option>
            </select>
          </div>

          {/* Location Selection - Cascade based on level */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm">📍 Select Location</h3>

            {/* Province */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Province</label>
              <select
                value={selectedProvince}
                onChange={(e) => {
                  setSelectedProvince(e.target.value);
                  setSelectedDistrict('');
                  setSelectedSector('');
                  setSelectedCell('');
                  if (formData.assignment_level === 'province') {
                    setFormData(prev => ({ ...prev, location_id: e.target.value }));
                  }
                }}
                disabled={loadingLocs || locations.provinces.length === 0 || !['province', 'district', 'sector', 'cell', 'village'].includes(formData.assignment_level)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
              >
                <option value="">-- Select Province --</option>
                {locations.provinces.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* District */}
            {['district', 'sector', 'cell', 'village'].includes(formData.assignment_level) && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedSector('');
                    setSelectedCell('');
                    if (formData.assignment_level === 'district') {
                      setFormData(prev => ({ ...prev, location_id: e.target.value }));
                    }
                  }}
                  disabled={loadingLocs || locations.districts.length === 0 || !selectedProvince}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                >
                  <option value="">-- Select District --</option>
                  {locations.districts.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sector */}
            {['sector', 'cell', 'village'].includes(formData.assignment_level) && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Sector</label>
                <select
                  value={selectedSector}
                  onChange={(e) => {
                    setSelectedSector(e.target.value);
                    setSelectedCell('');
                    if (formData.assignment_level === 'sector') {
                      setFormData(prev => ({ ...prev, location_id: e.target.value }));
                    }
                  }}
                  disabled={loadingLocs || locations.sectors.length === 0 || !selectedDistrict}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                >
                  <option value="">-- Select Sector --</option>
                  {locations.sectors.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Cell */}
            {['cell', 'village'].includes(formData.assignment_level) && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Cell</label>
                <select
                  value={selectedCell}
                  onChange={(e) => {
                    setSelectedCell(e.target.value);
                    if (formData.assignment_level === 'cell') {
                      setFormData(prev => ({ ...prev, location_id: e.target.value }));
                    }
                  }}
                  disabled={loadingLocs || locations.cells.length === 0 || !selectedSector}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                >
                  <option value="">-- Select Cell --</option>
                  {locations.cells.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Village */}
            {formData.assignment_level === 'village' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Village</label>
                <select
                  value={formData.location_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
                  disabled={loadingLocs || locations.villages.length === 0 || !selectedCell}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                >
                  <option value="">-- Select Village --</option>
                  {locations.villages.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || loadingLocs}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingLocs || agronomists.length === 0 || !formData.location_id}
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-bold disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? '⏳ Assigning...' : '✓ Assign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignAgronomistModal;