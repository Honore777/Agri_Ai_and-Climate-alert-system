'use client';

import React, { useState } from 'react';
import { CreateAgronomistRequest } from '../../types/agronomist.types';

interface CreateAgronomistModalProps {
  onSubmit: (data: CreateAgronomistRequest) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * CREATE AGRONOMIST MODAL - FORM COMPONENT
 * 
 * Form to hire new agronomist
 * Fields: first_name, last_name, email, phone_number
 * 
 * Data flow:
 * Form submit → onSubmit(data) called
 * → Hook calls service
 * → Backend creates User with role="agronomist"
 * → Sends temporary password via email (TODO)
 * → Service returns new agronomist
 * → Hook adds to store
 * → List updates with new agronomist ✨
 */

const CreateAgronomistModal: React.FC<CreateAgronomistModalProps> = ({
  onSubmit,
  onCancel,
  isLoading,
  error,
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validate
    if (!formData.first_name.trim()) {
      setLocalError('First name is required');
      return;
    }
    if (!formData.last_name.trim()) {
      setLocalError('Last name is required');
      return;
    }
    if (!formData.email.trim()) {
      setLocalError('Email is required');
      return;
    }
    if (!formData.phone_number.trim()) {
      setLocalError('Phone number is required');
      return;
    }
    if (!formData.password.trim()) {
      setLocalError('Password is required');
      return;
    }
    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setLocalError('Password must include uppercase letter');
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      setLocalError('Password must include lowercase letter');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setLocalError('Password must include number');
      return;
    }
    if (!/[!@#$%^&*]/.test(formData.password)) {
      setLocalError('Password must include special character (!@#$%^&*)');
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ first_name: '', last_name: '', email: '', phone_number: '', password: '' });
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create agronomist');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-blue-500 p-6 rounded-t-lg">
          <h2 className="text-2xl font-bold text-white">Hire Agronomist</h2>
          <p className="text-blue-100 mt-1">Add new staff member to your cooperative</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Alert */}
          {(error || localError) && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-900 text-sm">{error || localError}</p>
            </div>
          )}

          {/* First Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="John"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Doe"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="john@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number *
            </label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="+250 123 456 789"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="At least 8 chars, uppercase, lowercase, number, special char"
            />
            <p className="text-xs text-gray-600 mt-2">
              Must have: 8+ chars, A-Z, a-z, 0-9, !@#$%^&*
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoading ? '⏳ Creating...' : '➕ Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAgronomistModal;