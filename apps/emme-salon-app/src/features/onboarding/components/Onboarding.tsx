import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { els } from '@emme/i18n';
import type { TranslationKey } from '@emme/i18n';
import {
  Sparkles,
  Calendar,
  Users,
  BarChart3,
  Settings,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useUiStore } from '@/stores/uiStore';
import { useAppTranslation } from '@/app/translation';

type OnboardingStep = {
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: React.ReactNode;
  image: string;
};

const steps: readonly OnboardingStep[] = [
  {
    titleKey: 'onboarding.title',
    descriptionKey: 'onboarding.description',
    icon: <Sparkles className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1632345033839-247ab267d0d5?q=80&w=2070&auto=format&fit=crop',
  },
  {
    titleKey: 'onboarding.step1Title',
    descriptionKey: 'onboarding.step1Description',
    icon: <Calendar className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1506784919141-93c6f932e920?q=80&w=2070&auto=format&fit=crop',
  },
  {
    titleKey: 'onboarding.step2Title',
    descriptionKey: 'onboarding.step2Description',
    icon: <Users className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1600880212319-7524ebd75d2b?q=80&w=2050&auto=format&fit=crop',
  },
  {
    titleKey: 'onboarding.step3Title',
    descriptionKey: 'onboarding.step3Description',
    icon: <BarChart3 className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1911&auto=format&fit=crop',
  },
  {
    titleKey: 'onboarding.step4Title',
    descriptionKey: 'onboarding.step4Description',
    icon: <Settings className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop',
  },
];

export function Onboarding() {
  const dispatch = useUiStore((state) => state.dispatch);
  const { t } = useAppTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const completeOnboarding = () => dispatch({ type: 'completeOnboarding' });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <div
      data-testid={els.onboarding.dialog}
      className="fixed inset-0 z-[250] bg-card flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <img
          src={steps[currentStep].image}
          alt="background"
          className="w-full h-full object-cover blur-2xl transition-all duration-1000"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl max-h-[85vh] h-full flex flex-col lg:flex-row bg-card rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-border overflow-hidden m-4 lg:m-0">
        <div className="lg:w-1/2 h-64 lg:h-full relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentStep}
              src={steps[currentStep].image}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />
        </div>

        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-between">
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-primary' : 'w-2 bg-black/10'}`}
                  />
                ))}
              </div>
              <button
                data-testid={els.onboarding.skip}
                onClick={completeOnboarding}
                className="text-xs font-black uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors"
              >
                {t('onboarding.skip')}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="size-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-8">
                  {steps[currentStep].icon}
                </div>
                <h1 className="text-4xl lg:text-5xl font-display font-black tracking-[-0.05em] leading-tight text-[#1d1d1f]">
                  {t(steps[currentStep].titleKey)}
                </h1>
                <p className="text-[#86868b] text-lg font-medium leading-relaxed max-w-sm">
                  {t(steps[currentStep].descriptionKey)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-border">
            <div className="hidden lg:block">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">
                {t('onboarding.instructive')} {t('onboarding.step')} {currentStep + 1} /{' '}
                {steps.length}
              </p>
            </div>

            <Button
              data-testid={els.onboarding.next}
              onClick={nextStep}
              className="h-16 px-10 rounded-2xl bg-[#1d1d1f] text-white font-display font-black text-lg hover:bg-black active:scale-[0.98] transition-all group"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  {t('onboarding.start')}
                  <CheckCircle2 className="ml-3 size-5" />
                </>
              ) : (
                <>
                  {t('onboarding.next')}
                  <ArrowRight className="ml-3 size-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
