import React, { Suspense } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

const Dashboard = React.lazy(() =>
  import('@/features/dashboard/components/Dashboard').then((module) => ({
    default: module.Dashboard,
  }))
);
const Appointments = React.lazy(() =>
  import('@/features/appointments/components/Appointments').then((module) => ({
    default: module.Appointments,
  }))
);
const Clients = React.lazy(() =>
  import('@/features/clients/components/Clients').then((module) => ({ default: module.Clients }))
);
const Services = React.lazy(() =>
  import('@/features/services/components/Services').then((module) => ({ default: module.Services }))
);
const Finances = React.lazy(() =>
  import('@/features/finances/components/Finances').then((module) => ({ default: module.Finances }))
);
const Settings = React.lazy(() =>
  import('@/features/settings/components/Settings').then((module) => ({ default: module.Settings }))
);

export function PageLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
      <Loader2 className="size-8 animate-spin text-primary opacity-50" />
    </div>
  );
}

export function SalonRoutes() {
  const location = useLocation();

  return (
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
  );
}
