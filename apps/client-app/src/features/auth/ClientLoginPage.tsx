import { useState } from 'react';
import { Button } from '@emme/ui';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { startClientSocialLogin } from './clientOidc.js';

export function ClientLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await startClientSocialLogin();
    } catch {
      setLoading(false);
      setError('We could not start Google sign-in. Please try again.');
    }
  };

  return (
    <main className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background p-6 selection:bg-primary/10 selection:text-primary sm:p-12">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[-5%] top-[-10%] size-[600px] rounded-full bg-primary/5 opacity-60 blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] size-[500px] rounded-full bg-primary/5 opacity-60 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="mb-12 flex flex-col items-center">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 flex size-14 items-center justify-center rounded-[1.5rem] border border-border bg-card shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)]"
          >
            <Sparkles className="size-6 text-primary" aria-hidden="true" />
          </motion.div>

          <div className="space-y-2 text-center">
            <h1 className="mb-2 text-[34px] font-display font-bold leading-none tracking-[-0.05em]">
              <span className="mr-1 text-primary">emme</span>
              <span className="text-foreground/80">nails</span>
            </h1>
            <p className="text-[14px] font-medium tracking-tight text-muted-foreground opacity-60">
              Your next Emme visit starts here.
            </p>
          </div>
        </div>

        <div className="glass rounded-[3rem] border-white/20 p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]">
          <div className="space-y-10 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">
                Book your next visit.
              </h2>
              <p className="px-4 text-sm font-medium leading-relaxed text-muted-foreground/60 text-balance">
                Sign in with Google to discover salons, book appointments, and manage your visits.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                disabled={loading}
                aria-busy={loading}
                onClick={() => void handleGoogleLogin()}
                className="h-14 w-full rounded-2xl bg-primary text-[15px] font-bold text-white shadow-xl shadow-primary/10 transition-all hover:brightness-105 active:scale-[0.98]"
              >
                {loading ? 'Connecting to Google…' : 'Continue with Google'}
              </Button>
              {error && <p className="text-center text-sm text-red-500" role="alert">{error}</p>}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/10">
            Powered by emme nails suite
          </p>
        </div>
      </motion.div>
    </main>
  );
}
