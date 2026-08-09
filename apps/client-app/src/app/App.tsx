import { Outlet } from 'react-router-dom';
import { AuthGate } from '@emme/auth';
import { AppProviders } from './AppProviders.js';
import { ClientLoginPage } from '../features/auth/ClientLoginPage.js';

export function App() {
  return (
    <AppProviders>
      <AuthGate
        signedOutFallback={<ClientLoginPage />}
        tenantRequiredFallback={<p role="status">Choose a salon to continue.</p>}
      >
        <main><Outlet /></main>
      </AuthGate>
    </AppProviders>
  );
}
