'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import FarmerDashboard from '@/screens/farmer/FarmerDashboard';

export default function FarmerDashboardPage() {
  return (
    <AuthGuard allowedRoles={['farmer']}>
      <FarmerDashboard />
    </AuthGuard>
  );
}
