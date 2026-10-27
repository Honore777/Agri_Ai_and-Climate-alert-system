'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, MapPin, Navigation, RefreshCw } from 'lucide-react';
import apiClient from '@/services/api/axios';
import { getErrorMessage } from '@/utils/errors';
import { useTranslation } from '@/i18n/LocaleContext';

interface UserLocation {
  location_path?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_source?: string | null;
  needs_precise_location: boolean;
}

/**
 * Farmer's location card: shows their administrative area and lets them
 * share precise GPS (browser geolocation) so predictions get accurate
 * weather snapshots and the agronomist can see exactly where the farm is.
 */
export default function LocationCard() {
  const { t } = useTranslation();
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<UserLocation>('/users/me/location');
      setLocation(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load your location'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const shareGps = () => {
    setError(null);
    setSaved(false);
    if (!navigator.geolocation) {
      setError('Your browser does not support GPS location.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await apiClient.put('/users/me/coordinates', {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            location_source: 'gps',
          });
          setSaved(true);
          await load();
        } catch (err) {
          setError(getErrorMessage(err, 'Could not save your coordinates'));
        } finally {
          setIsLocating(false);
        }
      },
      (geoErr) => {
        setIsLocating(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setError('Location permission denied. Allow location access in your browser, then try again.');
        } else {
          setError('Could not determine your position. Try again in an open area.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  if (isLoading) {
    return (
      <div className="card mb-6 p-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="card mb-6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            <MapPin className="h-4 w-4 text-brand-600" /> Your location
          </h3>
          <p className="mt-1.5 font-semibold text-gray-900">
            {location?.location_path || 'No administrative location set'}
          </p>
          {location?.latitude != null && location?.longitude != null ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
              <Navigation className="h-3.5 w-3.5 text-sky-600" />
              GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              {location.location_source === 'gps' && (
                <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> precise
                </span>
              )}
            </p>
          ) : (
            <p className="mt-1 text-sm italic text-amber-700">
              No GPS shared — weather uses your district center and the agronomist
              cannot see your exact field location.
            </p>
          )}
        </div>
        <button
          onClick={shareGps}
          disabled={isLocating}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {isLocating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" /> Locating...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4" />
              {location?.latitude != null ? 'Update GPS location' : 'Share my GPS location'}
            </>
          )}
        </button>
      </div>
      {saved && (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
          {t('notices.locationSaved')}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-800">{error}</p>
      )}
    </div>
  );
}
