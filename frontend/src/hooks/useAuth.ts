import { useState } from 'react';
import authService from '../services/auth.service';
import useAuthStore from '../stores/auth.store';
import { clearAuth, setStoredAuth } from '../utils/auth';
import { getErrorMessage } from '../utils/errors';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAccessToken, setUser, logout } = useAuthStore();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(email, password);
      const { access_token, user } = response;

      setAccessToken(access_token);
      setUser(user);
      setStoredAuth(access_token, user);

      return true;
    } catch (err: any) {
      setError(getErrorMessage(err));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Backend logout failed:', err);
    } finally {
      logout();
      clearAuth();
    }
  };

  return { login, isLoading, error, logout: handleLogout };
};

export default useAuth;
