'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Leaf, Loader2, MapPin } from 'lucide-react';
import apiClient from '@/services/api/axios';
import { useTranslation } from '@/i18n/LocaleContext';

interface Location {
  id: number;
  name: string;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  registrationCode: string;
  fullName: string;
  phoneNumber: string;
  provinceId: string;
  districtId: string;
  sectorId: string;
  cellId: string;
  villageId: string;
}

interface Locations {
  provinces: Location[];
  districts: Location[];
  sectors: Location[];
  cells: Location[];
  villages: Location[];
}

type FieldName = keyof FormData;
type ValidationErrors = Partial<Record<FieldName, string>>;
type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;

const EMPTY_FORM: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  registrationCode: '',
  fullName: '',
  phoneNumber: '',
  provinceId: '',
  districtId: '',
  sectorId: '',
  cellId: '',
  villageId: '',
};

const EMPTY_LOCATIONS: Locations = {
  provinces: [],
  districts: [],
  sectors: [],
  cells: [],
  villages: [],
};

const selectClass = (invalid?: string) =>
  `w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white disabled:bg-gray-100 disabled:text-gray-400 ${
    invalid ? 'border-red-500' : 'border-gray-300'
  }`;

export default function Register() {
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [locations, setLocations] = useState<Locations>(EMPTY_LOCATIONS);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingLocations(true);
      try {
        const response = await apiClient.get<Location[]>('/locations/provinces');
        setLocations((prev) => ({ ...prev, provinces: response.data || [] }));
      } catch (err) {
        console.error('Error loading provinces:', err);
      } finally {
        setLoadingLocations(false);
      }
    };
    fetchProvinces();
  }, []);

  const fetchDistricts = async (provinceId: string) => {
    if (!provinceId) return;
    try {
      const response = await apiClient.get<Location[]>(`/locations/provinces/${provinceId}/districts`);
      setLocations((prev) => ({
        ...prev,
        districts: response.data || [],
        sectors: [],
        cells: [],
        villages: [],
      }));
      setFormData((prev) => ({ ...prev, districtId: '', sectorId: '', cellId: '', villageId: '' }));
    } catch (err) {
      console.error('Error loading districts:', err);
    }
  };

  const fetchSectors = async (districtId: string) => {
    if (!districtId) return;
    try {
      const response = await apiClient.get<Location[]>(`/locations/districts/${districtId}/sectors`);
      setLocations((prev) => ({ ...prev, sectors: response.data || [], cells: [], villages: [] }));
      setFormData((prev) => ({ ...prev, sectorId: '', cellId: '', villageId: '' }));
    } catch (err) {
      console.error('Error loading sectors:', err);
    }
  };

  const fetchCells = async (sectorId: string) => {
    if (!sectorId) return;
    try {
      const response = await apiClient.get<Location[]>(`/locations/sectors/${sectorId}/cells`);
      setLocations((prev) => ({ ...prev, cells: response.data || [], villages: [] }));
      setFormData((prev) => ({ ...prev, cellId: '', villageId: '' }));
    } catch (err) {
      console.error('Error loading cells:', err);
    }
  };

  const fetchVillages = async (cellId: string) => {
    if (!cellId) return;
    try {
      const response = await apiClient.get<Location[]>(`/locations/cells/${cellId}/villages`);
      setLocations((prev) => ({ ...prev, villages: response.data || [] }));
      setFormData((prev) => ({ ...prev, villageId: '' }));
    } catch (err) {
      console.error('Error loading villages:', err);
    }
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!formData.email) errors.email = t('auth.errors.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = t('auth.errors.emailInvalid');

    if (!formData.password) errors.password = t('auth.errors.passwordRequired');
    else if (formData.password.length < 8)
      errors.password = t('auth.errors.passwordShort8');

    if (!formData.confirmPassword)
      errors.confirmPassword = t('auth.errors.confirmRequired');
    else if (formData.password !== formData.confirmPassword)
      errors.confirmPassword = t('auth.errors.passwordMismatch');

    if (!formData.registrationCode)
      errors.registrationCode = t('auth.errors.codeRequired');
    if (!formData.fullName.trim())
      errors.fullName = t('auth.errors.fullNameRequired');

    if (!formData.phoneNumber.trim())
      errors.phoneNumber = t('auth.errors.phoneRequired');
    else if (!/^[\d\s+\-().]*$/.test(formData.phoneNumber))
      errors.phoneNumber = t('auth.errors.phoneInvalid');

    if (!formData.provinceId) errors.provinceId = t('auth.errors.provinceRequired');
    if (!formData.districtId) errors.districtId = t('auth.errors.districtRequired');
    if (!formData.sectorId) errors.sectorId = t('auth.errors.sectorRequired');
    if (!formData.cellId) errors.cellId = t('auth.errors.cellRequired');
    if (!formData.villageId) errors.villageId = t('auth.errors.villageRequired');

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: ChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name as FieldName]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCascade = (e: ChangeEvent, fetchNext: (id: string) => Promise<void>) => {
    handleChange(e);
    fetchNext(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    setLoading(true);
    try {
      await apiClient.post('/auth/register', {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        registration_code: formData.registrationCode.trim(),
        phone_number: formData.phoneNumber.trim(),
        full_name: formData.fullName.trim(),
        province_id: parseInt(formData.provinceId),
        district_id: parseInt(formData.districtId),
        sector_id: parseInt(formData.sectorId),
        cell_id: parseInt(formData.cellId),
        village_id: parseInt(formData.villageId),
      });

      router.push('/login?registered=1');
    } catch (err: any) {
      setLoading(false);
      const status = err.response?.status;
      const detail = err.response?.data?.detail;

      if (status === 400 && typeof detail === 'string') {
        if (detail.includes('already registered')) {
          setError(t('auth.errors.emailTaken'));
        } else if (detail.includes('password')) {
          setError(t('auth.errors.weakPassword'));
        } else {
          setError(detail);
        }
      } else if (status === 422) {
        setError(t('auth.errors.invalidInput'));
      } else if (err.message === 'Network Error') {
        setError(t('auth.errors.networkError'));
      } else {
        setError(typeof detail === 'string' && detail ? detail : t('auth.errors.registerFailed'));
      }
    }
  };

  const renderSelect = (
    label: string,
    name: FieldName,
    options: Location[],
    disabled: boolean,
    onChange: (e: ChangeEvent) => void,
    placeholder?: string
  ) => (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={onChange}
        disabled={disabled}
        className={selectClass(validationErrors[name])}
      >
        <option value="">{placeholder || `${t('auth.select')} ${label}`}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {validationErrors[name] && (
        <p className="mt-1 text-sm text-red-600">{validationErrors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Full-bleed farmer photo + dark overlay keeps the form readable */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/farmer-man.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-950/70 to-emerald-950/80" />
      <div className="relative w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow">
              Agri<span className="text-brand-300">AI</span>
            </span>
          </Link>
          <p className="mt-3 text-white/80">{t('auth.registerTitle')}</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white p-8 shadow-2xl">
          {error && (
            <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('auth.fullName')}
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className={`input-field ${validationErrors.fullName ? 'border-red-500' : ''}`}
                />
                {validationErrors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('auth.phoneNumber')}
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder={t('auth.phonePlaceholder')}
                  className={`input-field ${validationErrors.phoneNumber ? 'border-red-500' : ''}`}
                />
                {validationErrors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phoneNumber}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.emailPlaceholder')}
                className={`input-field ${validationErrors.email ? 'border-red-500' : ''}`}
              />
              {validationErrors.email && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-field pr-11 ${validationErrors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`input-field pr-11 ${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            <p className="-mt-3 text-xs text-gray-500">{t('auth.passwordHint')}</p>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('auth.registrationCode')}
              </label>
              <input
                type="text"
                name="registrationCode"
                value={formData.registrationCode}
                onChange={handleChange}
                placeholder={t('auth.registrationCodePlaceholder')}
                className={`input-field ${validationErrors.registrationCode ? 'border-red-500' : ''}`}
              />
              {validationErrors.registrationCode && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.registrationCode}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-500">{t('auth.registrationCodeHint')}</p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                <MapPin className="h-4 w-4 text-brand-600" />
                {t('auth.yourLocation')}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {renderSelect(
                  t('auth.province'),
                  'provinceId',
                  locations.provinces,
                  loadingLocations || locations.provinces.length === 0,
                  (e) => handleCascade(e, fetchDistricts),
                  loadingLocations
                    ? t('auth.loadingLocations')
                    : locations.provinces.length === 0
                      ? t('auth.noProvinces')
                      : `${t('auth.select')} ${t('auth.province')}`
                )}
                {renderSelect(
                  t('auth.district'),
                  'districtId',
                  locations.districts,
                  !formData.provinceId || locations.districts.length === 0,
                  (e) => handleCascade(e, fetchSectors)
                )}
                {renderSelect(
                  t('auth.sector'),
                  'sectorId',
                  locations.sectors,
                  !formData.districtId || locations.sectors.length === 0,
                  (e) => handleCascade(e, fetchCells)
                )}
                {renderSelect(
                  t('auth.cell'),
                  'cellId',
                  locations.cells,
                  !formData.sectorId || locations.cells.length === 0,
                  (e) => handleCascade(e, fetchVillages)
                )}
                <div className="md:col-span-2">
                  {renderSelect(
                    t('auth.village'),
                    'villageId',
                    locations.villages,
                    !formData.cellId || locations.villages.length === 0,
                    handleChange
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t('auth.creatingAccount') : t('auth.createAccount')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('auth.haveAccount')}{' '}
            <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
