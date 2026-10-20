'use client';

import React, { useState } from 'react';
import { Copy, Check, KeyRound, X } from 'lucide-react';

/**
 * Shows a freshly generated/created credential ONCE.
 * Used after creating an admin/agronomist or resetting a password —
 * passwords are never retrievable later (they're hashed), so this
 * modal is the admin's only chance to copy them.
 */
interface CredentialsModalProps {
  title: string;
  email: string;
  password: string;
  name?: string | null;
  onClose: () => void;
}

export default function CredentialsModal({
  title,
  email,
  password,
  name,
  onClose,
}: CredentialsModalProps) {
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const copy = async (text: string, which: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
              <KeyRound className="h-5 w-5 text-brand-600" />
            </span>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {name && (
          <p className="mt-4 text-sm text-gray-600">
            Account for <span className="font-semibold text-gray-900">{name}</span>
          </p>
        )}

        <div className="mt-4 space-y-3">
          {[
            { label: 'Email', value: email, which: 'email' as const },
            { label: 'Password', value: password, which: 'password' as const },
          ].map(({ label, value, which }) => (
            <div key={which} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-gray-500">{label}</span>
                <button
                  onClick={() => copy(value, which)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  {copied === which ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === which ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-1 select-all font-mono text-sm font-semibold text-gray-900">
                {value}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
          This password is shown only once — share it securely with the user.
          They can change it later from their account settings.
        </p>

        <button
          onClick={onClose}
          className="btn-primary mt-5 w-full"
        >
          Done
        </button>
      </div>
    </div>
  );
}
