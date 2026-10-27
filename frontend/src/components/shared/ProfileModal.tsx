'use client';

import React, { useEffect, useState } from 'react';
import { X, UserCog } from 'lucide-react';
import apiClient from '@/services/api/axios';
import { getErrorMessage } from '@/utils/errors';
import { useTranslation } from '@/i18n/LocaleContext';

/**
 * Self-service account settings — every signed-in user can update
 * their email, name, phone, and password (current password required
 * for password changes, enforced server-side).
 */
interface ProfileModalProps {
  initialEmail: string;
  initialName: string;
  initialPhone?: string;
  onSaved: (updated: { email: string; full_name: string }) => void;
  onClose: () => void;
}

export default function ProfileModal({
  initialEmail,
  initialName,
  initialPhone = '',
  onSaved,
  onClose,
}: ProfileModalProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: initialEmail,
    full_name: initialName,
    phone_number: initialPhone,
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Prefill from the live profile (name/phone may differ from localStorage)
  useEffect(() => {
    apiClient
      .get<{ email: string; full_name?: string; phone_number?: string }>('/users/me')
      .then((res) =>
        setForm((f) => ({
          ...f,
          email: res.data.email ?? f.email,
          full_name: res.data.full_name ?? f.full_name,
          phone_number: res.data.phone_number ?? '',
        }))
      )
      .catch(() => {});
  }, []);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Only send fields that actually changed / are set
    const payload: Record<string, string> = {};
    if (form.email !== initialEmail) payload.email = form.email;
    if (form.full_name !== initialName) payload.full_name = form.full_name;
    if (form.phone_number) payload.phone_number = form.phone_number;
    if (form.new_password) {
      if (!form.current_password) {
        setError('Enter your current password to set a new one.');
        setIsSaving(false);
        return;
      }
      if (form.new_password !== form.confirm_password) {
        setError('New passwords do not match.');
        setIsSaving(false);
        return;
      }
      payload.current_password = form.current_password;
      payload.new_password = form.new_password;
    } else if (form.confirm_password || form.current_password) {
      setError('Enter a new password in all password fields.');
      setIsSaving(false);
      return;
    }

    try {
      const res = await apiClient.put('/users/me', payload);
      setSaved(true);
      onSaved(res.data);
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <UserCog className="h-5 w-5 text-brand-600" />
            </span>
            <h2 className="text-lg font-bold text-gray-900">Account settings</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}
        {saved && (
          <p className="mt-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            {t('notices.profileUpdated')}
          </p>
        )}

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
            <input className="input-field" value={form.full_name} onChange={set('full_name')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={set('email')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input className="input-field" value={form.phone_number} onChange={set('phone_number')} />
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="mb-3 text-sm font-semibold text-gray-900">Change password</p>
            <div className="space-y-3">
              <input
                type="password"
                className="input-field"
                placeholder="Current password"
                value={form.current_password}
                onChange={set('current_password')}
              />
              <input
                type="password"
                className="input-field"
                placeholder="New password (min 8 chars, mixed case, digit, symbol)"
                value={form.new_password}
                onChange={set('new_password')}
              />
              <input
                type="password"
                className={`input-field ${
                  form.confirm_password && form.new_password !== form.confirm_password
                    ? 'border-red-400'
                    : ''
                }`}
                placeholder="Confirm new password"
                value={form.confirm_password}
                onChange={set('confirm_password')}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSaving} className="btn-primary mt-6 w-full disabled:opacity-50">
          {isSaving ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
