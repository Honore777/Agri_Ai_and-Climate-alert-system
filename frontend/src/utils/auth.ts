export type UserRole =
  | 'farmer'
  | 'agronomist'
  | 'cooperative_admin'
  | 'system_admin'
  | 'admin'
  | 'super_admin';

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

const ROLE_ROUTES: Record<string, string> = {
  farmer: '/dashboard/farmer',
  agronomist: '/dashboard/agronomist',
  cooperative_admin: '/dashboard/cooperative',
  system_admin: '/dashboard/admin',
  admin: '/dashboard/admin',
  super_admin: '/dashboard/admin',
};

export const dashboardPathFor = (role?: string | null): string =>
  (role && ROLE_ROUTES[role]) || '/login';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === 'undefined') return null;
  const role = localStorage.getItem('user_role');
  if (!role) return null;
  return {
    id: Number(localStorage.getItem('user_id')) || 0,
    name: localStorage.getItem('user_name') || 'User',
    email: localStorage.getItem('user_email') || '',
    role: role as UserRole,
  };
};

export const setStoredAuth = (
  token: string,
  user: { id: number; email: string; first_name?: string; last_name?: string; full_name?: string; user_role: string }
) => {
  const name =
    user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || 'User';
  localStorage.setItem('access_token', token);
  localStorage.setItem('user_id', String(user.id));
  localStorage.setItem('user_role', user.user_role);
  localStorage.setItem('user_name', name);
  localStorage.setItem('user_email', user.email);
};

export const clearAuth = () => {
  ['access_token', 'user_id', 'user_role', 'user_name', 'user_email'].forEach((key) =>
    localStorage.removeItem(key)
  );
};
