import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { els } from '@emme/i18n';
import { useTranslation } from 'react-i18next';
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
import { useApp } from '@/context/AppContext';

const steps = [
  {
    title: '¡Bienvenida a EmmeNails!',
    description:
      'Tu nuevo centro de control para llevar tu estudio de manicura al siguiente nivel. Diseñado para ser elegante, intuitivo y extremadamente potente.',
    icon: <Sparkles className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1632345033839-247ab267d0d5?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'Agenda Inteligente',
    description:
      'Gestiona tus citas con facilidad. Visualiza tu día, semana o mes y mantén un control total sobre tu tiempo y el de tus clientas.',
    icon: <Calendar className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1506784919141-93c6f932e920?q=80&w=2070&auto=format&fit=crop',
  },
  {
    title: 'Tus Clientas, Prioridad #1',
    description:
      'Guarda perfiles detallados, preferencias, alergias y el historial completo de cada clienta para ofrecer un servicio 100% personalizado.',
    icon: <Users className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1600880212319-7524ebd75d2b?q=80&w=2050&auto=format&fit=crop',
  },
  {
    title: 'Finanzas Bajo Control',
    description:
      'Sigue tus ingresos, gastos y metas mensuales. EmmeNails te ayuda a entender la rentabilidad de tu negocio de un vistazo.',
    icon: <BarChart3 className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1911&auto=format&fit=crop',
  },
  {
    title: 'Personalización Total',
    description:
      'Configura tus servicios, precios, horarios y hasta un bot de WhatsApp para automatizar la atención a tus clientas.',
    icon: <Settings className="size-12 text-primary" />,
    image:
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop',
  },
];

export function Onboarding() {
  const { completeOnboarding } = useApp();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  return (
    <div data-testid={els.onboarding.dialog.testId} className="fixed inset-0 z-[250] bg-card flex items-center justify-center overflow-hidden">
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
                data-testid={els.onboarding.skipBtn.testId}
                onClick={completeOnboarding}
                className="text-xs font-black uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors"
              >
                {t('onboarding:skip', 'Omitir')}
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
                  {currentStep === 0 ? t('onboarding:title', steps[currentStep].title) : steps[currentStep].title}
                </h1>
                <p className="text-[#86868b] text-lg font-medium leading-relaxed max-w-sm">
                  {currentStep === 0 ? t('onboarding:description', steps[currentStep].description) : steps[currentStep].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-border">
            <div className="hidden lg:block">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">
                Instructivo {t('onboarding:step', 'Paso')} {currentStep + 1} de {steps.length}
              </p>
            </div>

            <Button
              data-testid={els.onboarding.nextBtn.testId}
              onClick={nextStep}
              className="h-16 px-10 rounded-2xl bg-[#1d1d1f] text-white font-display font-black text-lg hover:bg-black active:scale-[0.98] transition-all group"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Comenzar
                  <CheckCircle2 className="ml-3 size-5" />
                </>
              ) : (
                <>
                  {t('onboarding:next', 'Siguiente')}
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
