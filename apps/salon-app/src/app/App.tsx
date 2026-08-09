import React, { Suspense, useEffect } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import { AuthGate } from '@emme/auth';
import { Login } from '../features/auth/components/Login';
import { TenantSelector } from '../features/auth/components/TenantSelector';
import { useBusinessProfileContext } from '../features/settings/context/BusinessProfileContext';
import { useUiStore } from '../features/shared/uiStore';
import { useAppTranslation } from '@emme/i18n';
import { AppLayout } from './layouts/AppLayout';
import { PageLoader, SalonRoutes } from './router';

const Onboarding = React.lazy(() =>
  import('../features/onboarding/components/Onboarding').then((module) => ({
    default: module.Onboarding,
  }))
);
function AppContent() {
  const { profile } = useBusinessProfileContext();
  const isFirstTime = useUiStore((state) => state.isFirstTime);
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'dashboard';
  const { i18n } = useAppTranslation();

  useEffect(() => {
    if (profile?.language) {
      i18n.changeLanguage(profile.language);
    }
  }, [profile?.language, i18n]);

  return (
    <AuthGate
      loadingFallback={<PageLoader />}
      signedOutFallback={<Login />}
      tenantRequiredFallback={<TenantSelector />}
    >
      <AppLayout activeTab={currentPath}>
        <Suspense fallback={null}>{isFirstTime && <Onboarding />}</Suspense>
        <SalonRoutes />
      </AppLayout>
    </AuthGate>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
