import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Mail,
  StickyNote,
  Calendar,
  Star,
  CheckCircle2,
  ChevronRight,
  UserStar,
  AlertCircle,
  Heart,
  X,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { cn } from '@/shared/lib/utils';
import { useClientData } from '@/features/clients/hooks/useClientData';
import { toast } from 'sonner';

interface ClientFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
  const { addClient } = useClientData();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    notes: '',
    allergies: '',
    preferences: '',
    isVip: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinish = () => {
    if (!formData.name || !formData.phone) {
      toast.error('Nombre y teléfono son obligatorios');
      return;
    }

    addClient({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      notes: formData.notes,
      allergies: formData.allergies,
      preferences: formData.preferences,
      birthday: formData.birthday,
      isVip: formData.isVip,
    });

    toast.success('Clienta registrada con éxito');
    onSuccess();
  };

  const steps = [
    { id: 1, title: 'Perfil' },
    { id: 2, title: 'Detalles' },
  ];

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(at_0%_0%,rgba(0,113,227,0.03)_0px,transparent_50%)] pointer-events-none" />

      {/* Step Indicator */}
      <div className="px-8 pt-12 pb-6 shrink-0 relative z-20 flex items-center justify-between">
        <div className="flex gap-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={cn(
                'h-1.5 transition-all duration-700 rounded-full',
                step === s.id ? 'w-12 bg-primary' : 'w-2 bg-[#000000]/[0.05]'
              )}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          onClick={onCancel}
          className="size-10 rounded-full bg-card/50 backdrop-blur-md border border-border p-0 text-foreground hover:bg-neutral-200 active:scale-90 transition-all"
        >
          <X className="size-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative text-foreground">
        <AnimatePresence mode="wait" initial={false}>
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 px-8 flex flex-col gap-10 overflow-y-auto no-scrollbar pb-32"
            >
              <div className="space-y-2 mt-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                  Nuevo Registro
                </span>
                <h3 className="text-[34px] font-display font-semibold tracking-tight leading-tight text-foreground">
                  Perfil de <span className="text-primary">Clienta</span>.
                </h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                    Nombre Completo
                  </Label>
                  <Input
                    placeholder="Ej. Sofia Villarreal"
                    className="premium-input bg-secondary/50 border-transparent focus:bg-card"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                    Número de Teléfono
                  </Label>
                  <PhoneInput
                    value={formData.phone}
                    onChange={(val) => handleChange('phone', val)}
                    className="h-14"
                    inputClassName="premium-input bg-secondary/50 border-transparent focus:bg-card"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                    Email
                  </Label>
                  <Input
                    placeholder="correo@ejemplo.com"
                    className="premium-input bg-secondary/50 border-transparent focus:bg-card"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>

                <div className="p-8 rounded-[32px] bg-secondary border border-border flex items-center justify-between group transition-all">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'size-12 rounded-2xl flex items-center justify-center transition-all duration-300',
                        formData.isVip
                          ? 'bg-[#FF9500] text-white shadow-lg'
                          : 'bg-card text-muted-foreground shadow-sm border border-border'
                      )}
                    >
                      <Star className={cn('size-6', formData.isVip && 'fill-current')} />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-lg text-foreground">Clienta VIP</p>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Atención Preferencial
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isVip}
                    onCheckedChange={(val) => handleChange('isVip', val)}
                    className="data-[state=checked]:bg-[#FF9500]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 px-8 flex flex-col gap-10 overflow-y-auto no-scrollbar pb-32"
            >
              <div className="space-y-2 mt-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3B30] opacity-60">
                  Datos Sensibles
                </span>
                <h3 className="text-[34px] font-display font-semibold tracking-tight leading-tight text-foreground">
                  Cuidado <span className="text-[#FF3B30]">Personal</span>.
                </h3>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                    Cumpleaños
                  </Label>
                  <Input
                    type="date"
                    className="premium-input bg-secondary/50 border-transparent focus:bg-card"
                    value={formData.birthday}
                    onChange={(e) => handleChange('birthday', e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                    Alergias o Sensibilidad
                  </Label>
                  <Textarea
                    placeholder="Ej. Sensibilidad al acrílico, alérgica a pegamentos cítricos..."
                    className="min-h-[120px] rounded-[32px] bg-secondary/50 border-transparent focus:bg-card p-6 text-base font-medium resize-none transition-all placeholder:opacity-30"
                    value={formData.allergies}
                    onChange={(e) => handleChange('allergies', e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                    Notas de Estilo
                  </Label>
                  <Textarea
                    placeholder="Preferencias de color, diseño favorito, temas de interés..."
                    className="min-h-[120px] rounded-[32px] bg-secondary/50 border-transparent focus:bg-card p-6 text-base font-medium resize-none transition-all placeholder:opacity-30"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Thumbzone Master Footer */}
        <div className="absolute bottom-0 inset-x-0 p-8 pb-10 bg-gradient-to-t from-[#FBFBFD] via-[#FBFBFD] to-transparent z-40">
          <div className="flex gap-4 max-w-2xl mx-auto md:max-w-3xl px-4">
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={!formData.name || !formData.phone}
                className="flex-1 h-16 rounded-[24px] bg-primary text-white font-semibold text-lg shadow-2xl shadow-[#0071E3]/20 active:scale-95 transition-all gap-3"
              >
                Continuar
                <ChevronRight className="size-5" />
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="h-16 w-16 rounded-[24px] bg-secondary text-foreground p-0 hover:bg-neutral-200 active:scale-95 transition-all shadow-sm border border-border"
                >
                  <ChevronRight className="size-6 rotate-180" />
                </Button>
                <Button
                  onClick={handleFinish}
                  className="flex-1 h-16 rounded-[24px] bg-[#1D1D1F] text-white font-semibold text-lg shadow-2xl active:scale-95 transition-all"
                >
                  Finalizar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
