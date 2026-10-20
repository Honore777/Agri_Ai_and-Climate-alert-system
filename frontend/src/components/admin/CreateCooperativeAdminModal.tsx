'use client';

import React, { useState } from 'react';

/**
 * CREATE COOPERATIVE ADMIN MODAL
 * 
 * PRINCIPLE: Form components handle local state
 * - User fills out form fields
 * - Validation happens locally
 * - On submit, call parent's callback
 * - Parent handles API call and error display
 */

interface CreateCooperativeAdminModalProps {
  organizationName: string;
  organizationId: number;
  onSubmit: (data: CooperativeAdminFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export interface CooperativeAdminFormData {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;
}

const CreateCooperativeAdminModal: React.FC<CreateCooperativeAdminModalProps> = ({
  organizationName,
  onSubmit,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  // LOCAL FORM STATE
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+250');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // VALIDATION
  const validateForm = (): boolean => {
    // Full name
    if (!fullName.trim()) {
      setLocalError('Full name is required');
      return false;
    }

    // Email
    if (!email.trim()) {
      setLocalError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Invalid email format');
      return false;
    }

    // Phone number
    if (!phoneNumber.trim()) {
      setLocalError('Phone number is required');
      return false;
    }
    if (!/^\+\d{1,3}\d{1,14}$/.test(phoneNumber.replace(/\s/g, ''))) {
      setLocalError('Invalid phone number format (use +250... format)');
      return false;
    }

    // Password
    if (!password) {
      setLocalError('Password is required');
      return false;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setLocalError('Password must contain at least one uppercase letter');
      return false;
    }
    if (!/[a-z]/.test(password)) {
      setLocalError('Password must contain at least one lowercase letter');
      return false;
    }
    if (!/\d/.test(password)) {
      setLocalError('Password must contain at least one digit');
      return false;
    }
    if (!/[!@#$%^&*(),.?":{}< >]/.test(password)) {
      setLocalError('Password must contain at least one special character (!@#$%^&*(),.?":{}< >)');
      return false;
    }

    // Confirm password
    if (password !== passwordConfirm) {
      setLocalError('Passwords do not match');
      return false;
    }

    return true;
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        password: password,
        password_confirm: passwordConfirm,
      });
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create cooperative admin');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 border-b">
          <h2 className="text-2xl font-bold">Create Cooperative Admin</h2>
          <p className="text-blue-100 text-sm mt-1">For: {organizationName}</p>
        </div>

        {/* ERROR ALERT */}
        {(error || localError) && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-900 font-semibold text-sm">
              {error || localError}
            </p>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* FULL NAME */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., admin@cooperative.local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* PHONE NUMBER */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+250788000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-gray-500 text-xs mt-1">Format: +250...</p>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="text-gray-500 text-xs mt-1">
              Must contain: uppercase, lowercase, digit, special character
            </p>
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Confirm Password *
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {isLoading ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCooperativeAdminModal;