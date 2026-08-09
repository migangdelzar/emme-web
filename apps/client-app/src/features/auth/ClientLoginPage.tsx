import { useState, type FormEvent } from 'react';
import { useAuth } from '@emme/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@emme/ui';

export function ClientLoginPage() {
  const { login, error } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      await login(String(form.get('email') ?? ''), String(form.get('password') ?? ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-amber-50 p-6 text-stone-900">
      <Card className="mx-auto mt-24 max-w-md">
        <CardHeader>
          <CardTitle>Book your next Emme visit</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input name="email" type="email" placeholder="Your email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Continue to booking'}
            </Button>
            {error && <p role="alert">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
