'use client';

import Link from 'next/link';
import { Leaf, MapPin, ShieldCheck, GraduationCap } from 'lucide-react';
import Logo from './Logo';
import ImigongoBand from './ImigongoBand';
import { useTranslation } from '@/i18n/LocaleContext';

/**
 * Shared footer — Imigongo art band, platform description,
 * quick links, and team credits (Kepler College + NISR).
 */
export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-50">
      <ImigongoBand height="h-16" />

      <div className="mx-auto max-w-7xl px-6 pb-10 pt-14">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand + mission */}
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-600">
              {t('footer.description')}
            </p>
            <ul className="mt-5 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-600" />
                {t('footer.madeIn')}
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-600" />
                {t('footer.secure')}
              </li>
              <li className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-brand-600" />
                {t('footer.mission')}
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
              {t('footer.platform')}
            </h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/login" className="text-gray-600 transition-colors hover:text-brand-700">
                  {t('common.signIn')}
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-600 transition-colors hover:text-brand-700">
                  {t('auth.registerWithCode')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/farmer" className="text-gray-600 transition-colors hover:text-brand-700">
                  {t('dashboard.farmerTitle')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-900">
              <GraduationCap className="h-4 w-4 text-brand-600" />
              {t('footer.credits')}
            </h3>
            <p className="mt-5 text-sm leading-6 text-gray-600">
              {t('footer.poweredBy')}{' '}
              <span className="font-semibold text-gray-900">Data Scientist HONORE</span>
              {' & '}
              <span className="font-semibold text-gray-900">Data Scientist HONORINE</span>
            </p>
            <p className="mt-2 text-sm font-medium text-brand-700">
              KEPLER COLLEGE
            </p>
            <div className="mt-6 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/NISR.jpg"
                alt="National Institute of Statistics of Rwanda"
                className="h-14 w-auto rounded-lg border border-gray-200 bg-white object-contain p-1"
              />
              <p className="text-xs leading-5 text-gray-500">
                {t('footer.nsrNote')}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {t('landing.footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
