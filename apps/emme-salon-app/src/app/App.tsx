import React, { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar, MobileNav } from '@/shared/layout/Navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { useUiStore } from '@/stores/uiStore';
import { useAuth } from '@/auth/useAuth';
import { Toaster } from '@/shared/ui/sonner';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { useTranslation } from 'react-i18next';
import { els } from '@emme/i18n';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Lazy load feature components
const Dashboard = React.lazy(() => import('@/features/dashboard/components/Dashboard').then(module => ({ default: module.Dashboard })));
const Appointments = React.lazy(() => import('@/features/appointments/components/Appointments').then(module => ({ default: module.Appointments })));
const Clients = React.lazy(() => import('@/features/clients/components/Clients').then(module => ({ default: module.Clients })));
const Services = React.lazy(() => import('@/features/services/components/Services').then(module => ({ default: module.Services })));
const Finances = React.lazy(() => import('@/features/finances/components/Finances').then(module => ({ default: module.Finances })));
const Settings = React.lazy(() => import('@/features/settings/components/Settings').then(module => ({ default: module.Settings })));
const Login = React.lazy(() => import('@/features/auth/components/Login').then(module => ({ default: module.Login })));
const Onboarding = React.lazy(() => import('@/features/onboarding/components/Onboarding').then(module => ({ default: module.Onboarding })));
const TenantSelector = React.lazy(() => import('@/auth/TenantSelector').then(m => ({ default: m.TenantSelector })));

function PageLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
      <Loader2 className="size-8 animate-spin text-primary opacity-50" />
    </div>
  );
}

function AppContent() {
  const { profile } = useApp();
  const isFirstTime = useUiStore((state) => state.isFirstTime);
  const { status, tenant } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || 'dashboard';
  const { i18n } = useTranslation();

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
    <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden font-sans selection:bg-primary/5">
      <Suspense fallback={null}>
        {isFirstTime && <Onboarding />}
      </Suspense>
      
      <Sidebar activeTab={currentPath} />

      <main data-testid={els.layout.main.testId} className="flex-1 pb-32 lg:pb-0 h-screen overflow-y-auto custom-scrollbar relative">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-10 lg:px-16 py-8 lg:py-12">
          {/* Mobile Header - Ultra Minimalist */}
          <div className="lg:hidden flex items-center justify-between mb-10 sticky top-0 z-[60] bg-background/5 backdrop-blur-xl -mx-6 px-8 py-5 border-b border-black/[0.02]">
            <div className="flex flex-col">
              <h1 className="text-xl font-display font-bold tracking-[-0.03em] flex items-center">
                <span className="text-primary mr-1">emme</span>
                <span className="text-foreground/60">nails</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground/20">
                Studio Manager
              </p>
            </div>
            <div className="size-10 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-black/[0.04] select-none scale-90">
              <Sparkles className="size-5 text-primary" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="relative min-h-[60vh]"
            >
              <Suspense fallback={<PageLoader />}>
                <Routes location={location}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/agenda" element={<Appointments />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/finances" element={<Finances />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <MobileNav activeTab={currentPath} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <HashRouter>
            <AppContent />
          </HashRouter>
          <Toaster position="top-center" richColors />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
