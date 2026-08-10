import { useState, type FormEvent } from 'react';
import { useAuth } from '@emme/core';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@emme/ui';

export function AdminLoginPage() {
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
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <Card className="mx-auto mt-24 max-w-md border-slate-800 bg-slate-900 text-white">
        <CardHeader>
          <CardTitle>Emme platform administration</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input name="email" type="email" placeholder="Admin email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in…' : 'Sign in to admin'}
            </Button>
            {error && <p role="alert">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
