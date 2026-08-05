import React, { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { els } from '@emme/i18n';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { ArrowRight, Lock, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppTranslation } from '@/app/translation';

export function Login() {
  const { login: oidcLogin, error } = useAuth();
  const { t } = useAppTranslation();
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = e.currentTarget as HTMLFormElement;
      const emailInput = form.querySelector('input[type="text"]') as HTMLInputElement;
      const passwordInput = form.querySelector('input[type="password"]') as HTMLInputElement;
      if (!emailInput || !passwordInput) return;
      await oidcLogin(emailInput.value, passwordInput.value);
    } catch {
      // AuthProvider.login() already sets error state, no action needed
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      window.location.href = '/oauth2/authorization/keycloak';
    } catch (e) {
      console.error('Signup error:', e);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-6 sm:p-12 overflow-hidden selection:bg-primary/10 selection:text-primary relative">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] size-[600px] bg-primary/3 rounded-full blur-[140px] opacity-60" />
        <div className="absolute bottom-[-10%] right-[-5%] size-[500px] bg-primary/5 rounded-full blur-[120px] opacity-60" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div className="flex flex-col items-center mb-12">
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="size-14 rounded-[1.5rem] bg-card flex items-center justify-center shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-border mb-8"
          >
            <Sparkles className="size-6 text-primary" />
          </motion.div>

          <div className="text-center space-y-2">
            <h1 className="text-[34px] font-display font-bold tracking-[-0.05em] leading-none mb-2">
              <span className="text-primary mr-1">emme</span>
              <span className="text-foreground/80">nails</span>
            </h1>
            <p className="text-[14px] font-medium text-muted-foreground opacity-60 tracking-tight">
              {t('landing.subtitle')}
            </p>
          </div>
        </div>

        <div className="glass p-10 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border-white/20">
          <AnimatePresence mode="wait">
            {view === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                <div className="space-y-3 text-center">
                  <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">
                    {t('landing.manageTitle')}
                  </h2>
                  <p className="text-muted-foreground/60 font-medium text-sm leading-relaxed px-4 text-balance">
                    {t('landing.manageDescription')}
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    data-testid={els.auth.landingEnter}
                    onClick={() => setView('login')}
                    className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-[15px] hover:brightness-105 active:scale-[0.98] transition-all shadow-xl shadow-primary/10"
                  >
                    {t('landing.enter')}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setView('signup')}
                    className="w-full h-14 rounded-2xl text-foreground font-bold text-[14px] hover:bg-black/[0.02] active:scale-[0.98] transition-all"
                  >
                    {t('landing.register')}
                  </Button>
                </div>
              </motion.div>
            )}

            {(view === 'login' || view === 'signup') && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-1">
                  <button
                    data-testid={els.auth.back}
                    onClick={() => setView('landing')}
                    className="text-[10px] font-bold uppercase tracking-[.25em] text-primary/60 mb-6 flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    <ArrowRight className="size-3 rotate-180" />
                    {t('auth.back')}
                  </button>
                  <h2 className="text-2xl font-display font-bold tracking-tight text-foreground leading-none">
                    {view === 'login' ? t('auth.welcome') : t('auth.registerHeading')}
                  </h2>
                </div>

                <form
                  onSubmit={view === 'login' ? handleLogin : handleSignup}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    {view === 'signup' && (
                      <div className="group">
                        <Input
                          placeholder={t('auth.fullName')}
                          className="premium-input"
                          required
                        />
                      </div>
                    )}

                    <Input
                      data-testid={els.auth.email}
                      type="text"
                      placeholder={t('auth.email')}
                      defaultValue={view === 'login' ? 'admin@emmenails.app' : ''}
                      className="premium-input"
                      required
                    />

                    <Input
                      data-testid={els.auth.password}
                      type="password"
                      placeholder={t('auth.password')}
                      defaultValue={view === 'login' ? 'password' : ''}
                      className="premium-input"
                      required
                    />
                  </div>

                  <Button
                    data-testid={els.auth.submit}
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl bg-foreground text-background font-bold text-[15px] hover:bg-foreground/90 active:scale-[0.98] transition-all shadow-xl shadow-black/10"
                  >
                    {loading
                      ? t(view === 'login' ? 'auth.signingIn' : 'auth.registering')
                      : view === 'login'
                        ? t('auth.signIn')
                        : t('auth.register')}
                  </Button>

                  {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* System Info */}
        <div className="mt-12 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-foreground/10">
            {t('landing.poweredBy')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
