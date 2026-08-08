import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/app/auth/useAuth';
import { useAppTranslation } from './translation';
import { AppLayout } from './layouts/AppLayout';
import { PageLoader, SalonRoutes } from './router';

const Login = React.lazy(() =>
  import('@/features/auth/components/Login').then((module) => ({ default: module.Login }))
);
const Onboarding = React.lazy(() =>
  import('@/features/onboarding/components/Onboarding').then((module) => ({
    default: module.Onboarding,
  }))
);
const TenantSelector = React.lazy(() =>
  import('@/app/auth/TenantSelector').then((m) => ({ default: m.TenantSelector }))
);

function AppContent() {
  const { profile } = useApp();
  const isFirstTime = useUiStore((state) => state.isFirstTime);
  const { status } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'dashboard';
  const { i18n } = useAppTranslation();

  useEffect(() => {
    if (profile?.language) {
      i18n.changeLanguage(profile.language);
    }
  }, [profile?.language, i18n]);

  if (status === 'loading') {
    return <PageLoader />;
  }

  if (status === 'signedOut') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    );
  }

  if (status === 'tenantRequired') {
    return (
      <Suspense fallback={<PageLoader />}>
        <TenantSelector />
      </Suspense>
    );
  }

  return (
    <AppLayout activeTab={currentPath}>
      <Suspense fallback={null}>{isFirstTime && <Onboarding />}</Suspense>
      <SalonRoutes />
    </AppLayout>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
