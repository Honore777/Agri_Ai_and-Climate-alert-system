'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import CooperativeAdminDashboard from '@/screens/admin/CooperativeAdminDashboard';

export default function CooperativeAdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={['cooperative_admin']}>
      <CooperativeAdminDashboard />
    </AuthGuard>
  );
}
