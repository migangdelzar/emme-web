import { Button, Card, CardContent, CardHeader, CardTitle } from '@emme/ui';
import { startClientSocialLogin } from './clientOidc.js';

export function ClientLoginPage() {
  return (
    <main className="min-h-screen bg-amber-50 p-6 text-stone-900">
      <Card className="mx-auto mt-24 max-w-md">
        <CardHeader>
          <CardTitle>Book your next Emme visit</CardTitle>
        </CardHeader>
        <CardContent>
          <Button type="button" className="w-full" onClick={() => void startClientSocialLogin()}>
            Continue with Google
          </Button>
          <p className="mt-4 text-center text-sm text-stone-600">
            You will continue securely with your Google account.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
