'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import AgronomistDashboard from '@/screens/agronomist/AgronomistDashboard';

export default function AgronomistDashboardPage() {
  return (
    <AuthGuard allowedRoles={['agronomist']}>
      <AgronomistDashboard />
    </AuthGuard>
  );
}
