import React, { useMemo, useState } from 'react';
import { els } from '@emme/i18n';
import { useApp } from '@/context/AppContext';
import { useFinanceData } from '@/features/finances/hooks/useFinanceData';
import { Loader2 } from 'lucide-react';
import {
  TrendingUp,
  DollarSign,
  Calendar as CalendarIcon,
  Target,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Sparkle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  parseISO,
  addMonths,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn, parseLocalDate } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { toast } from 'sonner';
import { useAppTranslation } from '@/app/translation';

export function Finances() {
  const {
    loading: financeLoading,
    appointments,
    services,
    totalRevenue,
    revenueToday,
    averageTicket,
    completedCount,
  } = useFinanceData();
  const { clients, profile, updateProfile } = useApp();
  const { t } = useAppTranslation();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState(profile.monthlyGoal || 25000);

  const goal = profile.monthlyGoal || 25000;

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [selectedMonth]);

  const handleUpdateGoal = () => {
    updateProfile({ ...profile, monthlyGoal: tempGoal });
    setIsGoalDialogOpen(false);
    toast.success(t('finances.goalUpdated'));
  };

  // Helper to get service price
  const getServicePrice = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.price || 0;
  };

  // 1. Calculate Stats
  const advancedStats = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const prevMonthStart = startOfMonth(subMonths(selectedMonth, 1));
    const prevMonthEnd = endOfMonth(subMonths(selectedMonth, 1));

    const currentAppointments = appointments.filter(
      (a) =>
        a.status === 'completed' &&
        isWithinInterval(parseLocalDate(a.date), { start: monthStart, end: monthEnd })
    );
    const prevAppointments = appointments.filter(
      (a) =>
        a.status === 'completed' &&
        isWithinInterval(parseLocalDate(a.date), { start: prevMonthStart, end: prevMonthEnd })
    );

    const monthlyIncome = currentAppointments.reduce(
      (sum, a) => sum + getServicePrice(a.serviceId),
      0
    );
    const prevMonthlyIncome = prevAppointments.reduce(
      (sum, a) => sum + getServicePrice(a.serviceId),
      0
    );

    // Growth %
    const growth =
      prevMonthlyIncome === 0
        ? 100
        : Math.round(((monthlyIncome - prevMonthlyIncome) / prevMonthlyIncome) * 100);

    // Average Ticket
    const avgTicket =
      currentAppointments.length === 0 ? 0 : Math.round(monthlyIncome / currentAppointments.length);

    // Client Retention (Returning vs New this month)
    const activeClientsThisMonth = new Set(currentAppointments.map((a) => a.clientId));
    const previousClients = new Set(
      appointments
        .filter((a) => a.status === 'completed' && parseLocalDate(a.date) < monthStart)
        .map((a) => a.clientId)
    );

    let returningClientsCount = 0;
    activeClientsThisMonth.forEach((id) => {
      if (previousClients.has(id)) returningClientsCount++;
    });

    const retentionRate =
      activeClientsThisMonth.size === 0
        ? 0
        : Math.round((returningClientsCount / activeClientsThisMonth.size) * 100);

    // Busiest Day of Week
    const daysCount: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    currentAppointments.forEach((a) => {
      const day = parseLocalDate(a.date).getDay();
      daysCount[day] += getServicePrice(a.serviceId);
    });

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const bestDayIndex = Object.entries(daysCount).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
    const bestDay = dayNames[parseInt(bestDayIndex)];

    // Peak Hour calculation
    const hoursCount: Record<number, number> = {};
    currentAppointments.forEach((a) => {
      const hour = parseInt(a.startTime.split(':')[0]);
      hoursCount[hour] = (hoursCount[hour] || 0) + 1;
    });

    let peakHour = '12:00';
    if (Object.keys(hoursCount).length > 0) {
      const bestHourIndex = Object.entries(hoursCount).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
      peakHour = `${bestHourIndex.padStart(2, '0')}:00`;
    }

    return {
      monthlyIncome,
      growth,
      avgTicket,
      retentionRate,
      bestDay,
      peakHour,
      appointmentsCount: currentAppointments.length,
    };
  }, [appointments, services, selectedMonth]);

  // Use base stats correctly
  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const weeklyIncome = appointments
      .filter(
        (a) =>
          a.status === 'completed' &&
          isWithinInterval(parseLocalDate(a.date), { start: weekStart, end: weekEnd })
      )
      .reduce((sum, a) => sum + getServicePrice(a.serviceId), 0);

    const totalIncome = appointments
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + getServicePrice(a.serviceId), 0);

    return { weeklyIncome, totalIncome };
  }, [appointments, services]);

  // 2. Chart Data (Last 6 months)
  const chartData = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date(),
    });

    return last6Months.map((month) => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const income = appointments
        .filter(
          (a) =>
            a.status === 'completed' && isWithinInterval(parseLocalDate(a.date), { start, end })
        )
        .reduce((sum, a) => sum + getServicePrice(a.serviceId), 0);

      return {
        name: format(month, 'MMM', { locale: es }).toUpperCase(),
        income,
      };
    });
  }, [appointments, services]);

  // 3. Category Breakdown for selected month
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {};

    appointments
      .filter((a) => a.status === 'completed' && isSameMonth(parseLocalDate(a.date), selectedMonth))
      .forEach((a) => {
        const service = services.find((s) => s.id === a.serviceId);
        const cat = service?.category || 'Otros';
        categories[cat] = (categories[cat] || 0) + (service?.price || 0);
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [appointments, services, selectedMonth]);

  // 4. Top Services
  const topServices = useMemo(() => {
    const counts: Record<string, { count: number; income: number; name: string }> = {};

    appointments
      .filter((a) => a.status === 'completed' && isSameMonth(parseLocalDate(a.date), selectedMonth))
      .forEach((a) => {
        const service = services.find((s) => s.id === a.serviceId);
        if (service) {
          if (!counts[service.id]) {
            counts[service.id] = { count: 0, income: 0, name: service.name };
          }
          counts[service.id].count += 1;
          counts[service.id].income += service.price;
        }
      });

    return Object.values(counts)
      .sort((a, b) => b.income - a.income)
      .slice(0, 4);
  }, [appointments, services, selectedMonth]);

  // 5. Recent Month Transactions
  const monthAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.status === 'completed' && isSameMonth(parseLocalDate(a.date), selectedMonth))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);
  }, [appointments, selectedMonth]);

  // 6. Weekly Performance Comparison
  const weeklyPerformance = useMemo(() => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

    const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });
    const prevDays = eachDayOfInterval({ start: prevWeekStart, end: prevWeekEnd });

    const data = days.map((day, idx) => {
      const prevDay = prevDays[idx];

      const currentIncome = appointments
        .filter((a) => a.status === 'completed' && isSameDay(parseLocalDate(a.date), day))
        .reduce((sum, a) => sum + getServicePrice(a.serviceId), 0);

      const prevIncome = appointments
        .filter((a) => a.status === 'completed' && isSameDay(parseLocalDate(a.date), prevDay))
        .reduce((sum, a) => sum + getServicePrice(a.serviceId), 0);

      return {
        name: format(day, 'EEE', { locale: es }).toUpperCase(),
        current: currentIncome,
        prev: prevIncome,
      };
    });

    const currentTotal = data.reduce((sum, d) => sum + d.current, 0);
    const prevTotal = data.reduce((sum, d) => sum + d.prev, 0);
    const percentChange =
      prevTotal === 0 ? 100 : Math.round(((currentTotal - prevTotal) / prevTotal) * 100);

    return { data, currentTotal, prevTotal, percentChange };
  }, [appointments, services]);

  const COLORS = ['#007AFF', '#34C759', '#AF52DE', '#FF9500', '#FF2D55'];
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/90 backdrop-blur-xl p-5 rounded-2xl border border-border shadow-2xl">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-2">
            {label}
          </p>
          <p className="text-2xl font-display font-semibold text-foreground tracking-tight">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12 lg:space-y-16 animate-in fade-in duration-1000 pb-52 lg:pb-16 px-4 sm:px-6 lg:px-0 max-w-full mx-auto min-h-screen">
      {isLoading || financeLoading ? (
        <div className="space-y-12 py-10">
          <div className="flex flex-col sm:flex-row justify-between gap-10">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-black/[0.05] rounded-full animate-pulse" />
              <div className="h-16 w-64 bg-black/[0.05] rounded-[2rem] animate-pulse" />
            </div>
            <div className="h-16 w-48 bg-black/[0.05] rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-[32px] bg-black/[0.03] animate-pulse" />
            ))}
          </div>
          <div className="h-[400px] rounded-[40px] bg-black/[0.03] animate-pulse" />
        </div>
      ) : (
        <div className="space-y-12 lg:space-y-16">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                {t('finances.header')}
              </p>
              <div className="space-y-0">
                <h2
                  data-testid={els.finances.header}
                  className="text-[40px] lg:text-[56px] font-display font-semibold tracking-tight text-foreground leading-none"
                >
                  {t('finances.heading')}.
                </h2>
                <div className="flex items-center gap-3 mt-4">
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                  <p className="text-muted-foreground text-base lg:text-lg font-medium">
                    {t('finances.subtitle')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-secondary rounded-[20px] w-full sm:w-auto overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-[14px] size-11 h-11 w-11 bg-card shadow-sm hover:bg-card active:scale-95 transition-all"
                onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <div className="px-4 flex items-center font-display font-semibold text-[13px] sm:min-w-[120px] flex-1 sm:flex-none justify-center tracking-tight uppercase text-foreground">
                {format(selectedMonth, 'MMMM yyyy', { locale: es })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-[14px] size-11 h-11 w-11 bg-card shadow-sm hover:bg-card active:scale-90 transition-all"
                onClick={() => setSelectedMonth(new Date())}
              >
                <Target className="size-5 text-primary" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-[14px] size-11 h-11 w-11 bg-card shadow-sm hover:bg-card active:scale-95 transition-all"
                onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))}
              >
                <ChevronRight className="size-5" />
              </Button>
            </div>
          </div>

          {/* Weekly Performance View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-card border border-border rounded-[40px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700">
              <div className="p-8 lg:p-10 pb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary size-1.5 rounded-full" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                      Performance Semanal
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground">
                    Comparativa.
                  </h3>
                </div>
                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-primary" />
                    <span className="opacity-80">{t('finances.current')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-secondary" />
                    <span className="opacity-40">{t('finances.previous')}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-10 pt-0">
                <div className="h-[200px] md:h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weeklyPerformance.data}
                      margin={{ top: 20, right: 0, left: -20, bottom: 0 }}
                      barGap={8}
                    >
                      <CartesianGrid
                        strokeDasharray="6 6"
                        vertical={false}
                        stroke="rgba(0,0,0,0.03)"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#86868B', fontSize: 11, fontWeight: 500 }}
                        dy={15}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#86868B', fontSize: 11, fontWeight: 500 }}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(0,0,0,0.015)', radius: 12 }}
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card p-5 rounded-[24px] border border-border shadow-2xl min-w-[200px]">
                                <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase mb-4">
                                  {label}
                                </p>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between gap-10">
                                    <span className="text-sm font-medium text-muted-foreground">
                                      {t('finances.thisWeek')}
                                    </span>
                                    <span className="text-lg font-display font-semibold text-primary">
                                      ${payload[1].value.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-10">
                                    <span className="text-sm font-medium text-muted-foreground opacity-60">
                                      {t('finances.previous')}
                                    </span>
                                    <span className="text-lg font-display font-semibold text-foreground opacity-40">
                                      ${payload[0].value.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="prev"
                        fill="#F5F5F7"
                        radius={[8, 8, 0, 0]}
                        barSize={12}
                        animationDuration={1500}
                      />
                      <Bar
                        dataKey="current"
                        fill="#0071E3"
                        radius={[8, 8, 0, 0]}
                        barSize={12}
                        animationDuration={2000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex-1 bg-[#1D1D1F] p-8 lg:p-10 rounded-[40px] overflow-hidden relative group"
              >
                <div className="relative z-10 space-y-8 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between">
                    <div className="size-14 rounded-2xl bg-card/[0.08] flex items-center justify-center text-white">
                      <TrendingUp className="size-7" />
                    </div>
                    <div
                      className={cn(
                        'px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest',
                        weeklyPerformance.percentChange >= 0
                          ? 'bg-[#34C759]/20 text-[#34C759]'
                          : 'bg-[#FF3B30]/20 text-[#FF3B30]'
                      )}
                    >
                      {weeklyPerformance.percentChange >= 0 ? '+' : ''}
                      {weeklyPerformance.percentChange}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                      Total Semanal
                    </p>
                    <h4 className="text-4xl font-display font-semibold tracking-tight text-white">
                      ${weeklyPerformance.currentTotal.toLocaleString()}
                    </h4>
                    <p className="text-sm font-medium text-white/40 leading-relaxed mt-2">
                      {weeklyPerformance.percentChange >= 0 ? 'Crecimiento de' : 'Ajuste de'}{' '}
                      <span className="text-white/60">
                        $
                        {Math.abs(
                          weeklyPerformance.currentTotal - weeklyPerformance.prevTotal
                        ).toLocaleString()}
                      </span>{' '}
                      vs anterior
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-1000 rotate-12 group-hover:scale-125">
                  <TrendingUp className="size-60 text-white" />
                </div>
              </motion.div>

              <div className="flex-1 bg-secondary p-8 lg:p-10 rounded-[40px] flex flex-col justify-center gap-4 relative overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-card shadow-sm flex items-center justify-center">
                    <Target className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                      Proyección
                    </p>
                    <p className="text-lg font-display font-semibold tracking-tight text-foreground">
                      Ritmo Actual.
                    </p>
                  </div>
                </div>
                <p className="text-[15px] font-medium text-muted-foreground leading-relaxed">
                  A este ritmo, proyectas cerrar con un{' '}
                  <span className="text-foreground font-semibold">
                    {weeklyPerformance.percentChange > 0 ? 'incremento' : 'ajuste'}
                  </span>{' '}
                  notable en la facturación.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="bg-card border border-border rounded-[40px] overflow-hidden p-8 lg:p-10 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-10">
                  <div className="space-y-1">
                    <h3 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground">
                      Histórico.
                    </h3>
                    <p className="text-base font-medium text-muted-foreground opacity-60">
                      Ingresos operativos por mes
                    </p>
                  </div>
                </div>
                <div className="h-[300px] lg:h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0071E3" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#0071E3" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="8 8"
                        vertical={false}
                        stroke="rgba(0,0,0,0.03)"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#86868B', fontSize: 11, fontWeight: 500 }}
                        dy={15}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#86868B', fontSize: 11, fontWeight: 500 }}
                        tickFormatter={(val) => `$${val / 1000}k`}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#0071E3', strokeWidth: 1.5, strokeDasharray: '5 5' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="income"
                        stroke="#0071E3"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorIncome)"
                        animationDuration={2500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-2xl font-display font-semibold tracking-tight text-foreground">
                    Servicios Estrella.
                  </h3>
                  <button className="text-[13px] font-semibold text-primary hover:underline">
                    Ver reporte completo
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {topServices.map((srv, idx) => (
                    <motion.div
                      key={srv.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="bg-card p-6 rounded-[32px] border border-border flex items-center justify-between group hover:bg-secondary transition-all duration-500"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-card transition-colors">
                          <Sparkle className="size-6 text-primary opacity-40" />
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-lg text-foreground leading-tight">
                            {srv.name}
                          </h4>
                          <p className="text-[12px] font-medium text-muted-foreground mt-0.5 opacity-60 uppercase tracking-widest">
                            {srv.count} realizados
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-semibold text-xl text-foreground">
                          ${srv.income.toLocaleString()}
                        </p>
                        <p className="text-[11px] font-bold text-[#34C759] mt-0.5">
                          +{Math.floor(Math.random() * 10) + 5}%
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories & Transactions Sidebar */}
            <div className="lg:col-span-4 space-y-12">
              <div className="bg-card border border-border rounded-[40px] p-8 lg:p-10 space-y-10 shadow-sm">
                <h3 className="text-2xl font-display font-semibold tracking-tight text-foreground">
                  Mix Ingresos.
                </h3>
                <div className="h-[220px] w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={6}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="focus:outline-none transition-all duration-500 hover:opacity-80"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '20px',
                          border: 'none',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                          padding: '16px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
                      Total
                    </span>
                    <span className="text-2xl font-display font-semibold text-foreground">
                      ${categoryData.reduce((s, c) => s + c.value, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  {categoryData.slice(0, 4).map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between group/item">
                      <div className="flex items-center gap-4">
                        <div
                          className="size-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-semibold text-sm text-muted-foreground group-hover/item:text-foreground transition-colors">
                          {entry.name}
                        </span>
                      </div>
                      <span className="font-display font-bold text-sm text-foreground">
                        ${entry.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-display font-semibold tracking-tight px-2 flex items-center justify-between text-foreground">
                  Diario.
                  <span className="h-8 min-w-8 px-2 rounded-xl bg-secondary flex items-center justify-center text-[13px] font-semibold text-muted-foreground">
                    {monthAppointments.length}
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {monthAppointments.map((apt, idx) => {
                    const client = clients.find((c) => c.id === apt.clientId);
                    const service = services.find((s) => s.id === apt.serviceId);
                    return (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        className="flex items-center justify-between p-5 bg-card border border-border rounded-[28px] group hover:bg-secondary transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="size-11 rounded-2xl bg-secondary flex items-center justify-center font-display font-semibold text-[13px] text-foreground group-hover:bg-card transition-all">
                            {format(parseLocalDate(apt.date), 'dd')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold text-foreground leading-tight truncate">
                              {client?.name}
                            </p>
                            <p className="text-[12px] font-medium text-muted-foreground truncate">
                              {service?.name}
                            </p>
                          </div>
                        </div>
                        <span className="font-display font-bold text-sm text-[#34C759] whitespace-nowrap">
                          +${service?.price}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Goal Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setTempGoal(goal);
                  setIsGoalDialogOpen(true);
                }}
                className="bg-card border border-border p-10 rounded-[40px] relative overflow-hidden group shadow-sm cursor-pointer"
              >
                <div className="relative z-10 flex flex-col gap-10">
                  <div className="flex items-center justify-between">
                    <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                      <Target className="size-7 text-[#34C759]" />
                    </div>
                    <div className="px-4 py-2 bg-secondary rounded-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                      Objetivo
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h5 className="text-4xl font-display font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors leading-none">
                        ${advancedStats.monthlyIncome.toLocaleString()}
                      </h5>
                      <div className="flex items-baseline gap-2 mt-3">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                          Facturación /
                        </span>
                        <span className="text-sm font-semibold text-foreground opacity-40">
                          ${goal.toLocaleString()} MXN
                        </span>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-40">
                            Progreso actual
                          </p>
                          <p className="text-4xl font-display font-semibold text-[#34C759] tabular-nums">
                            {Math.round((advancedStats.monthlyIncome / goal) * 100)}%
                          </p>
                        </div>
                        {advancedStats.monthlyIncome >= goal && (
                          <Sparkles className="size-8 text-amber-400 animate-pulse" />
                        )}
                      </div>

                      <div className="h-4 w-full bg-secondary rounded-full overflow-hidden relative">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min((advancedStats.monthlyIncome / goal) * 100, 100)}%`,
                          }}
                          transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full bg-gradient-to-r from-[#0071E3] to-[#34C759]"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <div
                          className={cn(
                            'size-2 rounded-full',
                            advancedStats.monthlyIncome >= goal
                              ? 'bg-[#34C759] animate-pulse'
                              : 'bg-[#FF9500]'
                          )}
                        />
                        <p className="text-[13px] text-muted-foreground font-medium">
                          {advancedStats.monthlyIncome >= goal
                            ? '¡Nivel leyenda alcanzado! 💎'
                            : `A $${Math.max(0, goal - advancedStats.monthlyIncome).toLocaleString()} de la meta`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Goal Edit Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl material-thick border-none shadow-[0_80px_200px_-30px_rgba(0,0,0,0.2)] p-0 overflow-hidden outline-none rounded-[40px] h-[90vh] sm:h-[60vh] flex flex-col">
          <div className="flex flex-col sm:flex-row h-full">
            <div className="sm:w-1/3 bg-[#1D1D1F] p-10 flex flex-col justify-center relative overflow-hidden shrink-0">
              <div className="relative z-10 space-y-4">
                <div className="size-16 rounded-[24px] bg-card/[0.1] border border-white/10 flex items-center justify-center text-white">
                  <Target className="size-8" />
                </div>
                <div>
                  <h3 className="text-4xl font-display font-semibold tracking-tight text-white leading-tight">
                    Meta.
                  </h3>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                    Visión emmenails
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8 sm:p-12 flex flex-col justify-between bg-card/60">
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="goal"
                    className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4"
                  >
                    Monto Mensual Objetivo
                  </Label>
                  <div className="relative group">
                    <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-primary opacity-30 group-focus-within:opacity-100 transition-all duration-500" />
                    <Input
                      id="goal"
                      type="number"
                      value={tempGoal}
                      onChange={(e) => setTempGoal(Number(e.target.value))}
                      className="h-16 rounded-[24px] bg-card border border-border pl-16 text-2xl font-display font-semibold focus:ring-4 focus:ring-primary/5"
                    />
                  </div>
                </div>
                <p className="px-4 text-[13px] font-medium text-muted-foreground leading-relaxed">
                  Este objetivo guiará tus proyecciones y éxito en el Dashboard financiero.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-8 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={() => setIsGoalDialogOpen(false)}
                  className="flex-1 h-12 rounded-2xl text-[13px] font-semibold text-muted-foreground"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateGoal}
                  className="flex-[2] h-12 rounded-2xl bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90 font-semibold text-[13px] shadow-xl"
                >
                  Aplicar Meta
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
