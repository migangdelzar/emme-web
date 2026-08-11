import React, { useMemo, useCallback } from 'react';
import { els } from '@emme/i18n';
import { useBusinessProfileContext } from '../../settings/context/BusinessProfileContext';
import { useClientData } from '../../clients/hooks/useClientData';
import { useDashboardData } from '../hooks/useDashboardData';
import { ErrorBanner } from '@emme/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@emme/ui';
import {
  Calendar,
  X,
  Users,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  User,
  UserPlus,
  Phone,
  MessageSquare,
  StickyNote,
  MapPin,
  Target,
  UserStar,
  AlertCircle,
  Heart,
  ArrowUpRight,
  Wallet,
  ShieldCheck,
  Timer,
  CircleDollarSign,
  BadgeCheck,
  Activity,
  CheckCheck,
  Gauge,
  UserCheck,
  Sparkles,
  Sparkle,
  Star,
  Ghost,
  Trash2,
} from 'lucide-react';
import { Button } from '@emme/ui';
import { Badge } from '@emme/ui';
import { Input } from '@emme/ui';
import { Textarea } from '@emme/ui';
import { Label } from '@emme/ui';
import { PhoneInput } from '@emme/ui';
import { Switch } from '@emme/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@emme/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@emme/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@emme/ui';
import { toast } from 'sonner';
import { format, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, parseLocalDate } from '@emme/ui';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import type { Appointment, Client, Service, AppointmentStatus } from '@emme/api';
import { AppointmentForm } from '../../appointments/components/AppointmentForm';
import { ClientForm } from '../../clients/components/ClientForm';
import { useAppTranslation } from '@emme/i18n';

// HELPER: Shadows
const getAppointmentShadow = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const shadows = [
    'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)]',
    'shadow-[0_4px_12px_-4px_rgba(0,0,0,0.03)]',
    'shadow-[0_3px_10px_-3px_rgba(0,0,0,0.05)]',
    'shadow-[0_5px_15px_-5px_rgba(0,0,0,0.02)]',
  ];
  return shadows[hash % shadows.length];
};

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  );
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const { profile, updateProfile } = useBusinessProfileContext();
  const { clients, addClient } = useClientData();
  const {
    loading,
    error,
    services,
    incomeToday,
    confirmedToday,
    occupancy: occupancyPercentage,
    newClientsThisMonth,
    monthlyIncome,
    todayAppointments,
  } = useDashboardData();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = React.useState(false);
  const [tempGoal, setTempGoal] = React.useState(profile.monthlyGoal || 25000);

  const goal = profile.monthlyGoal || 25000;

  const clientMap = useMemo(() => {
    const map = new Map();
    for (const c of clients) map.set(c.id, c);
    return map;
  }, [clients]);
  const serviceMap = useMemo(() => {
    const map = new Map();
    for (const s of services) map.set(s.id, s);
    return map;
  }, [services]);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdateGoal = useCallback(() => {
    updateProfile({ ...profile, monthlyGoal: tempGoal });
    setIsGoalDialogOpen(false);
    toast.success(t('dashboard.monthlyGoalUpdated'));
  }, [updateProfile, profile, tempGoal]);

  const [selectedApt, setSelectedApt] = React.useState<{
    apt: Appointment;
    client?: Client;
    service?: Service;
  } | null>(null);
  const [isNewAptOpen, setIsNewAptOpen] = React.useState(false);
  const [isNewClientOpen, setIsNewClientOpen] = React.useState(false);

  const today = new Date();

  const filteredAppointments = useMemo(
    () => [...todayAppointments].sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 8),
    [todayAppointments]
  );

  const currentTimeStr = format(new Date(), 'HH:mm');
  const nextAppointmentId = useMemo(
    () =>
      todayAppointments
        .filter((a) => a.startTime >= currentTimeStr)
        .sort((a, b) => a.startTime.localeCompare(b.startTime))[0]?.id,
    [todayAppointments, currentTimeStr]
  );

  const getGreeting = () => {
    const hours = today.getHours();
    if (hours < 12) return t('dashboard.greetingMorning');
    if (hours < 19) return t('dashboard.greetingAfternoon');
    return t('dashboard.greetingEvening');
  };

  const stats = [
    {
      label: t('dashboard.incomeToday'),
      value: `$${incomeToday}`,
      icon: TrendingUp,
      color: 'text-[#34C759]',
      bg: 'bg-[#34C759]/10',
      testId: els.dashboard.incomeToday,
    },
    {
      label: t('dashboard.confirmedToday'),
      value: confirmedToday,
      icon: CheckCheck,
      color: 'text-[#007AFF]',
      bg: 'bg-[#007AFF]/10',
      testId: els.dashboard.confirmedToday,
    },
    {
      label: t('dashboard.occupancy'),
      value: `${occupancyPercentage}%`,
      icon: Gauge,
      color: 'text-[#FF9500]',
      bg: 'bg-[#FF9500]/10',
      testId: els.dashboard.occupancy,
    },
    {
      label: t('dashboard.newClients'),
      value: newClientsThisMonth,
      icon: UserPlus,
      color: 'text-[#AF52DE]',
      bg: 'bg-[#AF52DE]/10',
      testId: els.dashboard.newClients,
    },
  ];

  const statusStyles: Record<
    string,
    { bg: string; text: string; border: string; dot: string; label: string; glow: string }
  > = {
    pending: {
      bg: 'bg-amber-500/5',
      text: 'text-amber-600',
      border: 'border-amber-500/10',
      dot: 'bg-amber-500',
      label: t('dashboard.statuses.pending'),
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    },
    confirmed: {
      bg: 'bg-blue-500/5',
      text: 'text-blue-600',
      border: 'border-blue-500/10',
      dot: 'bg-blue-500',
      label: t('dashboard.statuses.confirmed'),
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    },
    completed: {
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-600',
      border: 'border-emerald-500/10',
      dot: 'bg-emerald-500',
      label: t('dashboard.statuses.completed'),
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    },
    cancelled: {
      bg: 'bg-rose-500/5',
      text: 'text-rose-600',
      border: 'border-rose-500/10',
      dot: 'bg-rose-500',
      label: t('dashboard.statuses.cancelled'),
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    },
  };

  const handleStatusChange = (aptId: string, newStatus: AppointmentStatus) => {
    void aptId;
    void newStatus;
    toast.error(t('dashboard.changeStatusUnavailable'), {
      description: t('dashboard.changeStatusRequiresBackend'),
    });
  };

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700 pb-52 lg:pb-16 px-4 sm:px-6 max-w-full mx-auto relative min-h-screen">
      {isLoading || loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {error && <ErrorBanner error={error} />}
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between px-0 gap-8 pt-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#0051A3]">
                {t('dashboard.studioLevel')}
              </p>
              <div className="space-y-1">
                <h2
                  data-testid={els.dashboard.greeting}
                  className="text-[44px] lg:text-[72px] font-display font-semibold tracking-[-0.05em] text-foreground leading-none"
                >
                  {getGreeting()}, {(profile.ownerName || 'Studio').split(' ')[0]}.
                </h2>
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-[#34C759] shadow-[0_0_12px_rgba(52,199,89,0.4)]" />
                  <span className="text-[13px] font-semibold text-[#4F4F52]">
                    {confirmedToday} {t('dashboard.sessionsConfirmed')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid - Apple Widget Style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 px-0">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                data-testid={stat.testId}
                variants={item}
                whileHover={{ y: -4 }}
                className="group h-[150px] rounded-[32px] bg-card border border-border shadow-[0_12px_36px_-12px_rgba(0,0,0,0.06)] transition-all cursor-default pt-5 sm:pt-6 pb-6 px-6 sm:px-8 flex flex-col justify-between w-full"
              >
                <div
                  className={cn(
                    'size-12 sm:size-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110',
                    stat.bg
                  )}
                >
                  <stat.icon className={cn('size-6 sm:size-7', stat.color)} />
                </div>
                <div className="space-y-1.5 text-left w-full min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground truncate">
                    {stat.label}
                  </p>
                  <h3 className="text-2xl sm:text-[32px] font-display font-semibold tracking-tight text-foreground leading-none truncate">
                    {stat.value}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-4">
            {/* Main Section: Agenda List */}
            <section data-testid={els.dashboard.agenda} className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-0">
                <h2 className="text-[28px] lg:text-[34px] font-display font-semibold tracking-tight text-foreground">
                  {t('dashboard.agenda')}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewClientOpen(true)}
                    aria-label={t('clients.addButton')}
                    className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                  >
                    <UserPlus className="size-5" />
                  </button>
                  <button
                    onClick={() => setIsNewAptOpen(true)}
                    aria-label={t('appointments.addButton')}
                    className="p-2 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                  >
                    <Plus className="size-5" />
                  </button>
                  <button
                    onClick={() => navigate('/agenda')}
                    className="text-[13px] font-semibold text-primary hover:opacity-100 transition-opacity flex items-center gap-1 group"
                  >
                    {t('dashboard.viewAll')}{' '}
                    <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="px-0">
                {filteredAppointments.length > 0 ? (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {filteredAppointments.map((apt) => {
                      const client = clientMap.get(apt.clientId);
                      const service = serviceMap.get(apt.serviceId);
                      const isNext = apt.id === nextAppointmentId;

                      return (
                        <motion.div
                          variants={item}
                          key={apt.id}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedApt({ apt, client, service })}
                          className={cn(
                            'group flex items-center justify-between p-5 rounded-[22px] bg-card border border-border transition-all duration-300 cursor-pointer min-w-0 w-full',
                            isNext
                              ? 'shadow-[0_12px_40px_rgba(0,0,0,0.08)] border-primary/10'
                              : 'hover:bg-secondary/50'
                          )}
                        >
                          <div className="flex items-center gap-6 min-w-0 flex-1 mr-4">
                            <div className="min-w-[60px] flex flex-col items-center shrink-0">
                              <span
                                className={cn(
                                  'text-xl font-display font-semibold',
                                  isNext ? 'text-primary' : 'text-foreground'
                                )}
                              >
                                {apt.startTime}
                              </span>
                              <div
                                className={cn(
                                  'size-2 rounded-full mt-2',
                                  statusStyles[apt.status]?.dot
                                )}
                              />
                            </div>
                            <div className="w-px h-8 bg-black/[0.03] shrink-0" />
                            <div className="space-y-1 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <h4 className="font-semibold text-base sm:text-lg text-foreground tracking-tight truncate max-w-[150px] sm:max-w-[200px]">
                                  {client?.name}
                                </h4>
                                {client?.isVip && (
                                  <Star className="size-3.5 text-amber-400 fill-amber-400 shrink-0" />
                                )}
                              </div>
                              <p className="text-[12px] text-[#4F4F52] font-semibold text-wrap break-words leading-tight">
                                {service?.name}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block mr-2">
                              <p className="text-[14px] font-semibold text-foreground tracking-tight">
                                ${service?.price}
                              </p>
                              <p className="text-[10px] text-[#4F4F52] font-semibold uppercase tracking-widest">
                                {service?.duration} min
                              </p>
                            </div>
                            <div className="size-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-[#1D1D1F] group-hover:text-white transition-all">
                              <ChevronRight className="size-5" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="py-24 rounded-[32px] bg-card border border-border flex flex-col items-center text-center p-12">
                    <div className="size-20 rounded-[24px] bg-secondary flex items-center justify-center mb-6">
                      <Calendar className="size-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">
                      {t('dashboard.emptyAgendaTitle')}
                    </h3>
                    <p className="text-[#4F4F52] mt-2 text-sm max-w-[240px]">
                      {t('dashboard.emptyAgendaDescription')}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Sidebar Bento Section */}
            <aside className="lg:col-span-4 space-y-6 px-0">
              <motion.div
                data-testid={els.dashboard.missionCard}
                whileHover={{ y: -4 }}
                className="relative p-10 rounded-[32px] overflow-hidden group shadow-2xl bg-[#1D1D1F] transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0071E3]/20 via-transparent to-white/5 opacity-50" />
                <div className="absolute -top-20 -right-20 size-64 bg-primary/10 rounded-full blur-[80px]" />

                <div className="relative z-10 space-y-12">
                  <div className="flex items-start justify-between">
                    <div className="size-14 rounded-2xl bg-card/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                      <Sparkles className="size-7 text-primary" />
                    </div>
                    <Badge className="bg-card/10 text-white border-none py-1.5 px-4 font-semibold text-[10px] uppercase tracking-widest rounded-full backdrop-blur-md">
                      {t('dashboard.mission')}
                    </Badge>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[28px] font-display font-semibold leading-tight text-white tracking-tight">
                      {t('dashboard.missionQuote')}
                    </h4>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-px bg-card/20" />
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
                        {t('dashboard.atelierPhilosophy')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Goal Progress Card */}
              <motion.div
                data-testid={els.dashboard.goalCard}
                whileHover={{ y: -4 }}
                onClick={() => {
                  setTempGoal(goal);
                  setIsGoalDialogOpen(true);
                }}
                className="p-10 rounded-[32px] bg-card border border-border cursor-pointer group shadow-[0_12px_40px_-15px_rgba(0,0,0,0.06)] transition-all"
              >
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#515154]">
                        {t('dashboard.goalSubtitle')}
                      </p>
                      <h3
                        data-testid={els.dashboard.goalTitle}
                        className="text-2xl font-display font-semibold tracking-tight text-foreground"
                      >
                        {t('dashboard.goalTitle')}
                      </h3>
                    </div>
                    <div className="size-10 rounded-xl bg-secondary flex items-center justify-center text-[#515154] group-hover:text-primary transition-colors">
                      <Target className="size-5" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-3xl font-display font-semibold tracking-tight text-foreground">
                          ${monthlyIncome.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-semibold text-[#4F4F52]">
                          {t('dashboard.of')} ${goal.toLocaleString()}
                        </p>
                      </div>
                      <span className="text-[14px] font-bold text-primary">
                        {Math.round((monthlyIncome / goal) * 100)}%
                      </span>
                    </div>

                    <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((monthlyIncome / goal) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={cn(
                          'h-full rounded-full',
                          monthlyIncome / goal >= 1 ? 'bg-[#34C759]' : 'bg-primary'
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </aside>
          </div>
        </>
      )}

      {/* Goal Edit Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-xl material-thick border-none shadow-[0_80px_150px_-30px_rgba(0,0,0,0.3)] p-0 overflow-hidden outline-none rounded-[32px] sm:rounded-[40px] w-[92%] sm:w-full !top-1/2 -translate-y-1/2"
        >
          <div className="p-10 md:p-12 space-y-10 flex flex-col relative overflow-hidden bg-card/60">
            <div className="flex items-center justify-between">
              <div className="size-14 rounded-2xl bg-[#1D1D1F] text-white flex items-center justify-center shadow-xl">
                <Target className="size-6 stroke-[2.5]" />
              </div>
              <DialogClose className="size-12 rounded-full bg-black/[0.03] hover:bg-black/[0.08] flex items-center justify-center transition-all active:scale-90">
                <X className="size-5 text-muted-foreground" />
              </DialogClose>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-display font-semibold tracking-tight text-foreground">
                {t('dashboard.goalDialogTitle')}
              </h2>
              <p className="text-[15px] font-medium text-muted-foreground leading-relaxed">
                {t('dashboard.goalDialogDescription')}
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2">
                    <DollarSign className="size-6 text-primary" />
                  </div>
                  <Input
                    id="goal"
                    type="number"
                    value={tempGoal}
                    onChange={(e) => setTempGoal(Number(e.target.value))}
                    className="h-20 pl-16 pr-8 rounded-2xl bg-card border border-border focus:ring-4 focus:ring-primary/5 text-3xl font-display font-semibold shadow-sm"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[15000, 25000, 50000, 75000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTempGoal(amount)}
                    className={cn(
                      'h-12 px-6 rounded-xl text-[13px] font-semibold transition-all active:scale-95',
                      tempGoal === amount
                        ? 'bg-[#1D1D1F] text-white'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    )}
                  >
                    ${amount / 1000}K
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleUpdateGoal}
                className="apple-button h-16 rounded-2xl bg-primary text-white font-semibold text-[15px] shadow-xl shadow-[#0071E3]/20 w-full"
              >
                {t('dashboard.saveGoal')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={!!selectedApt} onOpenChange={(open) => !open && setSelectedApt(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-xl md:max-w-2xl lg:max-w-3xl material-thick border-none shadow-[0_80px_200px_-40px_rgba(0,0,0,0.4)] p-0 overflow-hidden outline-none rounded-[40px] w-[95%] sm:w-full !top-1/2 -translate-y-1/2"
        >
          {selectedApt && (
            <div className="flex flex-col bg-card/70">
              <div className="relative h-48 sm:h-56 bg-background overflow-hidden flex items-center justify-center shrink-0 border-b border-border">
                <div className="absolute top-8 right-8 z-[60]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedApt(null)}
                    className="rounded-full bg-black/[0.03] hover:bg-black/[0.08] size-12 transition-all text-muted-foreground active:scale-90"
                  >
                    <X className="size-6" />
                  </Button>
                </div>

                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <Avatar className="h-28 w-28 border-white border-[6px] shadow-2xl rounded-[32px]">
                    <AvatarFallback className="bg-[#1D1D1F] text-white text-3xl font-display font-semibold">
                      {selectedApt.client?.name.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-3xl font-display font-semibold tracking-tight text-foreground">
                        {selectedApt.client?.name}
                      </h3>
                      {selectedApt.client?.isVip && (
                        <Star className="size-5 text-amber-400 fill-amber-400" />
                      )}
                    </div>
                    <p className="text-[14px] font-medium text-muted-foreground">
                      {selectedApt.client?.phone}
                    </p>
                  </div>
                </motion.div>
              </div>

              <div className="px-8 sm:px-12 py-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {/* Information Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 rounded-[28px] bg-card border border-border space-y-4">
                    <Clock className="size-6 text-primary" />
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        {t('dashboard.time')}
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        {selectedApt.apt.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="p-8 rounded-[28px] bg-card border border-border space-y-4">
                    <Wallet className="size-6 text-[#34C759]" />
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        {t('dashboard.investment')}
                      </p>
                      <p className="text-2xl font-semibold text-foreground">
                        ${selectedApt.service?.price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Block */}
                <div className="p-8 rounded-[28px] bg-secondary border border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-card flex items-center justify-center shadow-sm">
                      <Sparkle className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                        {t('dashboard.sessionOf')}
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {selectedApt.service?.name}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-card text-foreground border-none px-4 py-1.5 rounded-full text-[12px] font-semibold">
                    {selectedApt.service?.duration} min
                  </Badge>
                </div>

                {/* Status Selector */}
                <div className="space-y-4">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-2">
                    {t('dashboard.managementStatus')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(
                      ['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedApt.apt.id, status)}
                        className={cn(
                          'h-12 rounded-xl text-[11px] font-semibold transition-all active:scale-95 border',
                          selectedApt.apt.status === status
                            ? 'bg-[#1D1D1F] text-white border-[#1D1D1F]'
                            : 'bg-card text-muted-foreground border-border hover:bg-secondary'
                        )}
                      >
                        {statusStyles[status]?.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 pt-6 border-t border-border">
                  <Button
                    className="h-16 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-[#25D366]/20"
                    onClick={() => {
                      if (selectedApt.client?.phone) {
                        const message = `Hola ${selectedApt.client?.name}! Confirmamos tu cita hoy a las ${selectedApt.apt.startTime}. ✨`;
                        window.open(
                          `https://wa.me/${selectedApt.client?.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
                          '_blank'
                        );
                      }
                    }}
                  >
                    <MessageSquare className="size-5" />
                    {t('dashboard.sendReminder')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedApt(null)}
                    className="h-14 rounded-2xl text-muted-foreground font-semibold"
                  >
                    {t('dashboard.closeDetail')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Nueva Cita */}
      <Dialog open={isNewAptOpen} onOpenChange={setIsNewAptOpen}>
        <DialogContent className="max-w-xl md:max-w-4xl lg:max-w-5xl glass border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-0 overflow-hidden outline-none sm:rounded-[3.5rem] rounded-t-[3.5rem] h-[95vh] sm:h-[85vh] flex flex-col">
          <AppointmentForm
            onSuccess={() => setIsNewAptOpen(false)}
            onCancel={() => setIsNewAptOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog Nuevo Cliente */}
      <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
        <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl glass border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-0 overflow-hidden outline-none sm:rounded-[3.5rem] rounded-t-[3.5rem] h-[90vh] sm:h-[80vh] flex flex-col">
          <ClientForm
            onSuccess={() => setIsNewClientOpen(false)}
            onCancel={() => setIsNewClientOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
