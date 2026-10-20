'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import SystemAdminDashboard from '@/screens/admin/SystemAdminDashboard';

export default function SystemAdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={['system_admin', 'admin', 'super_admin']}>
      <SystemAdminDashboard />
    </AuthGuard>
  );
}
