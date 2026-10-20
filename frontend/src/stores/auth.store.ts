import { create } from 'zustand';

interface AuthStore {
  accessToken: string | null;
  user: any | null;
  isLoggedIn: boolean;
  setAccessToken: (token: string) => void;
  setUser: (user: any) => void;
  logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  user: null,
  isLoggedIn: false,

  setAccessToken: (token) => set({ accessToken: token }),
  setUser: (user) => set({ user, isLoggedIn: true }),
  logout: () => set({ accessToken: null, user: null, isLoggedIn: false }),
}));

export default useAuthStore;

