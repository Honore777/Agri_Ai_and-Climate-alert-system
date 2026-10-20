'use client';

import { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, UserCheck } from 'lucide-react';
import apiClient from '@/services/api/axios';
import { getErrorMessage } from '@/utils/errors';

interface AgronomistInfo {
  full_name: string;
  assigned_region: string;
  email: string;
  phone_number?: string;
}

const AgronomistInfoSection = () => {
  const [agronomist, setAgronomist] = useState<AgronomistInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgronomist();
  }, []);

  const loadAgronomist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<AgronomistInfo>('/agronomists/my-agronomist');
      setAgronomist(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No agronomist is assigned to your region yet');
      } else {
        setError(getErrorMessage(err, 'Failed to load agronomist information'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/2 rounded bg-gray-200"></div>
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
        <p className="font-semibold text-yellow-800">{error}</p>
      </div>
    );
  }

  if (!agronomist) return null;

  const hasPhone = Boolean(agronomist.phone_number && agronomist.phone_number !== 'Not provided');

  return (
    <div className="card p-8">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900">
        <UserCheck className="h-6 w-6 text-brand-600" />
        Your Assigned Agronomist
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Full Name</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{agronomist.full_name}</p>
        </div>

        <div className="rounded-xl border-2 border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100 p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Assigned Region
          </p>
          <p className="mt-2 flex items-center gap-2 text-xl font-bold text-gray-900">
            <MapPin className="h-5 w-5 text-brand-600" />
            {agronomist.assigned_region}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Email</p>
          <a
            href={`mailto:${agronomist.email}`}
            className="mt-2 block break-all text-lg font-bold text-blue-600 hover:text-blue-800"
          >
            {agronomist.email}
          </a>
          <a
            href={`mailto:${agronomist.email}`}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700"
          >
            <Mail className="h-4 w-4" />
            Send Email
          </a>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 transition hover:shadow-md">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Phone Number</p>
          <p className="mt-2 text-lg font-bold text-brand-700">
            {agronomist.phone_number || 'Not provided'}
          </p>
          {hasPhone && (
            <a
              href={`tel:${agronomist.phone_number}`}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700"
            >
              <Phone className="h-4 w-4" />
              Call Agronomist
            </a>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-xl border-l-4 border-brand-500 bg-brand-50 p-6">
        <p className="mb-2 font-semibold text-brand-900">How will they help you?</p>
        <ul className="space-y-1.5 text-sm text-brand-800">
          <li>Reviews your disease predictions</li>
          <li>Provides expert guidance and advice</li>
          <li>Sends messages with best practices</li>
          <li>Helps improve your crop yield</li>
        </ul>
      </div>
    </div>
  );
};

export default AgronomistInfoSection;
