import type { Metadata } from 'next';
import Login from '@/screens/auth/Login';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return <Login />;
}
