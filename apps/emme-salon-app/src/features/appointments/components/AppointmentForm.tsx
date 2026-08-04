import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addMinutes, isAfter, isBefore, parse, startOfDay, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Users,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  Search,
  UserPlus,
  StickyNote,
  AlertCircle,
  UserStar,
  Sparkles,
  Sparkle,
  Phone,
  Star,
  X,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';
import { useApp, type Service, type Client } from '@/context/AppContext';
import { toast } from 'sonner';
import { useAppTranslation } from '@/app/translation';

interface AppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialDate?: Date;
  initialStartTime?: string;
}

export function AppointmentForm({
  onSuccess,
  onCancel,
  initialDate,
  initialStartTime,
}: AppointmentFormProps) {
  const { clients, services, addAppointment, appointments, profile } = useApp();
  const { t } = useAppTranslation();

  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [date, setDate] = useState<string>(format(initialDate || new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState<string>(initialStartTime || '');
  const [notes, setNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  function buildGoogleCalendarLink(): string {
    if (!selectedService) return '#';
    const startDate = new Date(`${date}T${startTime}`);
    const endDate = new Date(startDate.getTime() + selectedService.duration * 60000);
    const fmt = (d: Date) =>
      d
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '');
    const text = encodeURIComponent(`${selectedService.name} at Emme Nails`);
    const dates = `${fmt(startDate)}/${fmt(endDate)}`;
    const details = encodeURIComponent('Your appointment at Emme Nails');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}`;
  }

  const filteredClients = clients.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  const categories = Array.from(new Set(services.filter((s) => s.isActive).map((s) => s.category)));
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');

  const filteredServices = services.filter(
    (s) =>
      s.isActive &&
      (serviceSearchTerm ? true : activeCategory ? s.category === activeCategory : true) &&
      s.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  );

  // Generate available slots (using useMemo for performance)
  const availableSlots = useMemo(() => {
    if (!date || !profile.workingHours) return [];
    const selectedDate = new Date(date + 'T00:00:00');

    const specialDate = profile.salonConfig?.specialDates?.find((sd) => {
      if (sd.type === 'vacation' && sd.endDate) {
        const start = new Date(sd.date + 'T00:00:00');
        const end = new Date(sd.endDate + 'T23:59:59');
        return selectedDate >= start && selectedDate <= end;
      }
      return sd.date === date;
    });

    let openStr = '',
      closeStr = '',
      isActive = false;

    if (specialDate) {
      if (specialDate.type === 'holiday' || specialDate.type === 'vacation') return [];
      if (specialDate.type === 'reduced') {
        openStr = specialDate.open || '09:00';
        closeStr = specialDate.close || '14:00';
        isActive = true;
      }
    } else {
      const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const dayKey = dayNames[getDay(selectedDate)];
      const hours = profile.workingHours[dayKey];
      if (!hours || !hours.active) return [];
      openStr = hours.open;
      closeStr = hours.close;
      isActive = true;
    }

    if (!isActive) return [];

    const slots: string[] = [];
    const openTime = parse(openStr, 'HH:mm', selectedDate);
    const closeTime = parse(closeStr, 'HH:mm', selectedDate);

    let current = openTime;
    const duration = selectedService?.duration || 30;

    while (isBefore(current, closeTime)) {
      const timeStr = format(current, 'HH:mm');
      const apptStart = current;
      const apptEnd = addMinutes(current, duration);

      // 1. Check if the appointment runs past salon closing hours
      if (isAfter(apptEnd, closeTime)) {
        current = addMinutes(current, 30);
        continue;
      }

      // 2. Check overlap with existing appointments
      const isBusy = appointments
        .filter((a) => a.date === date && a.status !== 'cancelled')
        .some((apt) => {
          const aptStart = parse(apt.startTime, 'HH:mm', selectedDate);
          const aptEnd = parse(apt.endTime, 'HH:mm', selectedDate);
          return apptStart < aptEnd && apptEnd > aptStart;
        });

      // 3. Check overlap with daily break times
      let isInBreak = false;
      if (!specialDate) {
        const dayNames = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const dayKey = dayNames[getDay(selectedDate)];
        const hours = profile.workingHours[dayKey];
        if (hours?.breakActive && hours.breakStart && hours.breakEnd) {
          const bStart = parse(hours.breakStart, 'HH:mm', selectedDate);
          const bEnd = parse(hours.breakEnd, 'HH:mm', selectedDate);
          if (apptStart < bEnd && apptEnd > bStart) {
            isInBreak = true;
          }
        }
      }

      if (!isBusy && !isInBreak) slots.push(timeStr);
      current = addMinutes(current, 30);
    }
    return slots;
  }, [date, profile.workingHours, profile.salonConfig, appointments, selectedService]);

  const handleFinish = () => {
    if (!selectedClient || !selectedService || !startTime) {
      toast.error(t('appointments.formIncomplete'));
      return;
    }
    const [h, m] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(h, m, 0);
    const endDate = addMinutes(startDate, selectedService.duration);
    addAppointment({
      clientId: selectedClient.id,
      serviceId: selectedService.id,
      date,
      startTime,
      endTime: format(endDate, 'HH:mm'),
      status: 'pending',
      notes,
    });
    toast.success(t('appointments.created'));
    setBookingConfirmed(true);
  };

  const steps = [
    { id: 1, title: t('common.clients'), icon: Users },
    { id: 2, title: t('common.services'), icon: Sparkle },
    { id: 3, title: t('common.appointments'), icon: Clock },
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
          className="size-10 rounded-full bg-card/50 backdrop-blur-md border border-border p-0 text-foreground hover:bg-neutral-200 active:scale-90 transition-all font-display"
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
                  Paso 01
                </span>
                <h3 className="text-[34px] font-display font-semibold tracking-tight leading-tight text-foreground">
                  {t('appointments.customerQuestion')}
                </h3>
              </div>

              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder={t('appointments.searchCustomer')}
                  className="premium-input bg-secondary/50 border-transparent focus:bg-card pl-16"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                {filteredClients.map((c, i) => (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={c.id}
                    onClick={() => {
                      setSelectedClient(c);
                      setTimeout(() => setStep(2), 300);
                    }}
                    className={cn(
                      'w-full p-6 rounded-[32px] flex items-center justify-between border transition-all duration-300 text-left',
                      selectedClient?.id === c.id
                        ? 'bg-primary text-white border-transparent shadow-xl shadow-[#0071E3]/20'
                        : 'bg-card border-border hover:bg-secondary'
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <Avatar className="size-14 rounded-2xl shadow-sm border border-border">
                        <AvatarFallback
                          className={cn(
                            'font-display font-semibold text-lg',
                            selectedClient?.id === c.id
                              ? 'bg-card/10 text-white'
                              : 'bg-card text-primary'
                          )}
                        >
                          {c.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xl tracking-tight leading-none mb-1">
                          {c.name}
                        </span>
                        <span
                          className={cn(
                            'text-[11px] font-medium tracking-wide opacity-40',
                            selectedClient?.id === c.id ? 'text-white' : 'text-muted-foreground'
                          )}
                        >
                          {c.phone}
                        </span>
                      </div>
                    </div>
                    {c.isVip && (
                      <Star
                        className={cn(
                          'size-6',
                          selectedClient?.id === c.id
                            ? 'fill-white text-white'
                            : 'fill-[#FF9500] text-[#FF9500]'
                        )}
                      />
                    )}
                  </motion.button>
                ))}
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
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                  Paso 02
                </span>
                <h3 className="text-[34px] font-display font-semibold tracking-tight leading-tight text-foreground">
                  {t('appointments.serviceSelection')}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder={t('appointments.filterService')}
                    className="premium-input bg-secondary/50 border-transparent focus:bg-card pl-16"
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={cn(
                        'px-6 h-10 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all shrink-0 border whitespace-nowrap',
                        activeCategory === cat
                          ? 'bg-[#1D1D1F] text-white border-transparent'
                          : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredServices.map((s, i) => (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={s.id}
                    onClick={() => {
                      setSelectedService(s);
                      setTimeout(() => setStep(3), 300);
                    }}
                    className={cn(
                      'w-full p-8 rounded-[32px] flex items-center justify-between border transition-all duration-300 relative text-left',
                      selectedService?.id === s.id
                        ? 'bg-primary text-white border-transparent shadow-xl shadow-[#0071E3]/20'
                        : 'bg-card border-border hover:bg-secondary'
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] font-black uppercase tracking-[0.2em] opacity-40',
                            selectedService?.id === s.id ? 'text-white' : 'text-primary'
                          )}
                        >
                          {s.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-2xl tracking-tight leading-tight">
                        {s.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-4">
                        <div
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold',
                            selectedService?.id === s.id
                              ? 'bg-card/10'
                              : 'bg-secondary text-muted-foreground'
                          )}
                        >
                          <Clock className="size-3" />
                          {s.duration} MIN
                        </div>
                        <span className="font-display font-semibold text-2xl tracking-tighter">
                          ${s.price}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && !bookingConfirmed && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 px-8 flex flex-col gap-10 overflow-y-auto no-scrollbar pb-32"
            >
              <div className="space-y-2 mt-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#34C759] opacity-60">
                  Paso 03
                </span>
                <h3 className="text-[34px] font-display font-semibold tracking-tight leading-tight text-foreground">
                  {t('appointments.scheduleTitle')}
                </h3>
              </div>

              <div className="space-y-10">
                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                    {t('appointments.date')}
                  </Label>
                  <Input
                    type="date"
                    className="premium-input bg-secondary/50 border-transparent focus:bg-card"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                      {t('appointments.availableTimes')}
                    </Label>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold border-[#34C759]/20 text-[#34C759] bg-[#34C759]/5"
                    >
                      {t('appointments.confirmed')}
                    </Badge>
                  </div>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-4 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setStartTime(slot)}
                          className={cn(
                            'h-12 rounded-2xl text-[13px] font-semibold tracking-tight transition-all relative border',
                            startTime === slot
                              ? 'bg-primary text-white border-transparent shadow-xl'
                              : 'bg-card text-foreground border-border hover:bg-secondary'
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : bookingConfirmed ? (
                    <Button
                      onClick={onSuccess}
                      className="flex-1 h-16 rounded-[24px] bg-[#34C759] text-white font-semibold text-lg shadow-2xl shadow-[#34C759]/20 active:scale-95 transition-all"
                    >
                      Cerrar
                    </Button>
                  ) : (
                    <div className="py-12 rounded-[32px] bg-secondary border border-border flex flex-col items-center justify-center text-center px-10">
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                        No hay horarios disponibles para la fecha seleccionada.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                    {t('appointments.notes')}
                  </Label>
                  <Textarea
                    placeholder={t('appointments.notesPlaceholder')}
                    className="min-h-[120px] rounded-[32px] bg-secondary/50 border-transparent focus:bg-card p-6 text-base font-medium resize-none transition-all placeholder:opacity-30"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && bookingConfirmed && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              className="absolute inset-0 px-8 flex flex-col gap-10 overflow-y-auto no-scrollbar pb-32"
            >
              <div className="space-y-2 mt-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#34C759] opacity-60">
                  Confirmado
                </span>
                <h3 className="text-[34px] font-display font-semibold tracking-tight leading-tight text-foreground">
                  {t('appointments.scheduledTitle')}
                </h3>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-[32px] bg-card border border-border space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-6 text-[#34C759]" />
                    <div>
                      <p className="font-semibold text-lg">{selectedService?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {date} &middot; {startTime} &middot; {selectedService?.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="size-6 text-muted-foreground" />
                    <span className="font-medium">{selectedClient?.name}</span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-medium mb-2">{t('appointments.addToCalendar')}</h3>
                  <a
                    href={buildGoogleCalendarLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {t('appointments.connectGoogleCalendar')}
                  </a>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('appointments.automaticSync')}{' '}
                    <a href="/#/settings" className="underline">
                      {t('appointments.connectGoogleInSettings')}
                    </a>{' '}
                    in Settings.
                  </p>
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
                disabled={!selectedClient}
                className="flex-1 h-16 rounded-[24px] bg-[#1D1D1F] text-white font-semibold text-lg shadow-2xl active:scale-95 transition-all gap-3"
              >
                Siguiente
                <ChevronRight className="size-5" />
              </Button>
            ) : step === 2 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="h-16 w-16 rounded-[24px] bg-secondary text-foreground p-0 hover:bg-neutral-200 active:scale-95 transition-all shadow-sm border border-border"
                >
                  <ChevronRight className="size-6 rotate-180" />
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedService}
                  className="flex-1 h-16 rounded-[24px] bg-[#1D1D1F] text-white font-semibold text-lg shadow-2xl active:scale-95 transition-all gap-3"
                >
                  Siguiente
                  <ChevronRight className="size-5" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="h-16 w-16 rounded-[24px] bg-secondary text-foreground p-0 hover:bg-neutral-200 active:scale-95 transition-all shadow-sm border border-border"
                >
                  <ChevronRight className="size-6 rotate-180" />
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={!startTime}
                  className="flex-1 h-16 rounded-[24px] bg-[#34C759] text-white font-semibold text-lg shadow-2xl shadow-[#34C759]/20 active:scale-95 transition-all"
                >
                  Confirmar Cita
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
