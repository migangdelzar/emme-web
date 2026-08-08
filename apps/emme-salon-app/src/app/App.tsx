import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useBusinessProfileContext, useUiStore } from '@emme/features';
import { useAuth } from '@emme/core';
import { useAppTranslation } from '@emme/i18n';
import { AppLayout } from './layouts/AppLayout';
import { PageLoader, SalonRoutes } from './router';

const Login = React.lazy(() =>
  import('@emme/features').then((module) => ({ default: module.Login }))
);
const Onboarding = React.lazy(() =>
  import('@emme/features').then((module) => ({
    default: module.Onboarding,
  }))
);
const TenantSelector = React.lazy(() =>
  import('@emme/features').then((m) => ({ default: m.TenantSelector }))
);

function AppContent() {
  const { profile } = useBusinessProfileContext();
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
