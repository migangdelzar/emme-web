import { Outlet } from 'react-router-dom';
import { AuthGate } from '@emme/auth';
import { AppProviders } from './AppProviders.js';
import { AdminLoginPage } from '../features/auth/AdminLoginPage.js';

export function App() {
  return (
    <AppProviders>
      <AuthGate
        signedOutFallback={<AdminLoginPage />}
        tenantRequiredFallback={<p role="status">Choose an administration workspace.</p>}
      >
        <main><Outlet /></main>
      </AuthGate>
    </AppProviders>
  );
}
