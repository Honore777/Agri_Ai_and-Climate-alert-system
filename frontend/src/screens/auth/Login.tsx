'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Leaf, Loader2 } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import { dashboardPathFor, getToken, getStoredUser } from '@/utils/auth';
import { useTranslation } from '@/i18n/LocaleContext';

function RegisteredBanner() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  if (searchParams.get('registered') !== '1') return null;
  return (
    <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-4">
      <p className="text-sm font-medium text-brand-800">{t('auth.registeredBanner')}</p>
    </div>
  );
}

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error } = useAuth();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect already-authenticated users straight to their dashboard
  useEffect(() => {
    const user = getStoredUser();
    if (getToken() && user) {
      router.replace(dashboardPathFor(user.role));
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  const validateForm = () => {
    if (!email.trim()) return t('auth.errors.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t('auth.errors.emailInvalid');
    if (!password) return t('auth.errors.passwordRequired');
    if (password.length < 6) return t('auth.errors.passwordShort');
    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = validateForm();
    if (message) {
      setFormError(message);
      return;
    }
    setFormError('');

    const success = await login(email.trim(), password);
    if (success) {
      const user = getStoredUser();
      router.push(dashboardPathFor(user?.role));
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      </div>
    );
  }

  const displayError = formError || error;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Full-bleed farmer photo + dark overlay keeps the form readable */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/farmer-woman.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-950/70 to-emerald-950/80" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg">
              <Leaf className="h-6 w-6 text-white" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-white drop-shadow">
              Agri<span className="text-brand-300">AI</span>
            </span>
          </Link>
          <p className="mt-3 text-white/80">{t('auth.signInTitle')}</p>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white p-8 shadow-2xl">
          <Suspense fallback={null}>
            <RegisteredBanner />
          </Suspense>

          {displayError && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={t('auth.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="input-field disabled:cursor-not-allowed disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="input-field pr-11 disabled:cursor-not-allowed disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-sm text-gray-400">{t('common.or')}</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              {t('auth.registerWithCode')}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-white/70">
          {t('auth.secureTagline')}
        </p>
      </div>
    </div>
  );
}
