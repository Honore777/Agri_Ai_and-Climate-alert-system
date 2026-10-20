'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { LogOut, Settings } from 'lucide-react';
import Logo from './Logo';
import ImigongoBand from './ImigongoBand';
import LanguageSwitcher from './LanguageSwitcher';
import ProfileModal from '@/components/shared/ProfileModal';
import useAuth from '@/hooks/useAuth';
import { getStoredUser } from '@/utils/auth';
import { useTranslation } from '@/i18n/LocaleContext';

/**
 * Shared dashboard header: brand, page title, language switcher,
 * signed-in user, logout. Imigongo band adds the Rwandan accent.
 */
export default function DashboardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(getStoredUser());

  const handleProfileSaved = (updated: { email: string; full_name: string }) => {
    localStorage.setItem('user_name', updated.full_name || updated.email);
    localStorage.setItem('user_email', updated.email);
    setUser(getStoredUser());
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <Logo />
          <div className="hidden border-l border-gray-200 pl-6 sm:block">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {user && (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs capitalize text-gray-500">
                  {t(`roles.${user.role}`) !== `roles.${user.role}`
                    ? t(`roles.${user.role}`)
                    : user.role.replace('_', ' ')}
                </p>
              </div>
              <button
                onClick={() => setShowProfile(true)}
                title="Account settings"
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-2 text-gray-600 transition-colors hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? t('common.signingOut') : t('common.signOut')}
          </button>
        </div>
      </div>
      <ImigongoBand height="h-5" variant="white" />
      {/* Portal: the sticky header's backdrop-blur would trap a fixed modal
          in the header's stacking context — mount it on <body> instead. */}
      {showProfile &&
        user &&
        createPortal(
          <ProfileModal
            initialEmail={user.email}
            initialName={user.name}
            onSaved={handleProfileSaved}
            onClose={() => setShowProfile(false)}
          />,
          document.body
        )}
    </header>
  );
}
