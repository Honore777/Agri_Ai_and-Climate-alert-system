import type { Metadata } from 'next';
import Register from '@/screens/auth/Register';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return <Register />;
}
