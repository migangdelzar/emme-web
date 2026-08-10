import { useEffect, useState } from 'react';
import { completeClientSocialLogin } from './clientOidc.js';

export function ClientOidcCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void completeClientSocialLogin().catch(() => {
      setError('Customer sign-in could not be completed. Please try again.');
    });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <p role={error ? 'alert' : 'status'}>{error ?? 'Completing customer sign-in…'}</p>
    </main>
  );
}
