import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { els } from '@emme/i18n';
import type { AppointmentStatus, Appointment } from '@emme/api';
import type { Service } from '@emme/api';
import type { Client } from '@emme/domain';
import { useBusinessProfileContext } from '../../settings/context/BusinessProfileContext';
import { useClientData } from '../../clients/hooks/useClientData';

const S = {
  PENDING: 'pending' as AppointmentStatus,
  CONFIRMED: 'confirmed' as AppointmentStatus,
  COMPLETED: 'completed' as AppointmentStatus,
  CANCELLED: 'cancelled' as AppointmentStatus,
} as const;

function isAppointmentStatus(value: string): value is AppointmentStatus {
  return value === 'pending' || value === 'confirmed' || value === 'completed' || value === 'cancelled';
}

function readAppointment(value: unknown): Appointment | null {
  if (!value || typeof value !== 'object' || !('apt' in value)) return null;
  const candidate = value.apt;
  if (!candidate || typeof candidate !== 'object') return null;
  if (!('id' in candidate) || typeof candidate.id !== 'string') return null;
  if (!('clientId' in candidate) || typeof candidate.clientId !== 'string') return null;
  if (!('serviceId' in candidate) || typeof candidate.serviceId !== 'string') return null;
  if (!('date' in candidate) || typeof candidate.date !== 'string') return null;
  if (!('startTime' in candidate) || typeof candidate.startTime !== 'string') return null;
  if (!('endTime' in candidate) || typeof candidate.endTime !== 'string') return null;
  if (!('status' in candidate) || typeof candidate.status !== 'string' || !isAppointmentStatus(candidate.status)) return null;
  const customerName = 'customerName' in candidate && typeof candidate.customerName === 'string' ? candidate.customerName : undefined;
  const notes = 'notes' in candidate && typeof candidate.notes === 'string' ? candidate.notes : undefined;
  return {
    id: candidate.id,
    clientId: candidate.clientId,
    serviceId: candidate.serviceId,
    date: candidate.date,
    startTime: candidate.startTime,
    endTime: candidate.endTime,
    status: candidate.status,
    ...(customerName ? { customerName } : {}),
    ...(notes ? { notes } : {}),
  };
}
import { useAppointmentData } from '../hooks/useAppointmentData';
import { ErrorBanner } from '@emme/ui';
import { Button } from '@emme/ui';
import { Card, CardContent } from '@emme/ui';
import { cn, parseLocalDate } from '@emme/ui';
import {
  Plus,
  X,
  Phone,
  User,
  Calendar as CalendarIcon,
  Clock,
  MoreHorizontal,
  MessageSquare,
  Copy,
  CheckCircle2,
  ArrowUpRight,
  DollarSign,
  Target,
  Share2,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  GripVertical,
  AlertCircle,
  Heart,
  StickyNote,
  CircleDollarSign,
  UserStar,
  Sparkles,
  Sparkle,
  Star,
  Ghost,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@emme/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@emme/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@emme/ui';
import { Input } from '@emme/ui';
import { Label } from '@emme/ui';
import { Badge } from '@emme/ui';
import { AppointmentStatusBadge } from '@emme/features';
import { Calendar } from '@emme/ui';
import { Tooltip, TooltipContent, TooltipTrigger } from '@emme/ui';
import { motion, AnimatePresence } from 'motion/react';
import {
  format,
  isSameDay,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  addMonths,
  subMonths,
  startOfDay,
  addDays,
  eachHourOfInterval,
  differenceInMinutes,
  addMinutes,
  parseISO,
} from 'date-fns';
import { AppointmentForm } from './AppointmentForm';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAppTranslation } from '@emme/i18n';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

// HELPER: Time utilities
const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes: number) => {
  const normMins = Math.max(0, Math.min(minutes, 1439));
  const h = Math.floor(normMins / 60);
  const m = Math.floor((normMins % 60) / 15) * 15;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const AgendarModal = ({
  isOpen,
  onOpenChange,
  date,
  startTime,
  onSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  date?: Date;
  startTime?: string;
  onSuccess: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid={els.appointments.dialog}
        className="max-w-xl md:max-w-4xl lg:max-w-5xl glass border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] p-0 overflow-hidden outline-none sm:rounded-[3.5rem] rounded-t-[3.5rem] h-[95vh] sm:h-[85vh] flex flex-col"
      >
        <AppointmentForm
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
          initialDate={date}
          initialStartTime={startTime}
        />
      </DialogContent>
    </Dialog>
  );
};

// HELPER: Calendar Sync functions
const generateGoogleCalendarLink = (apt: Appointment, client: Client | undefined, service: Service | undefined) => {
  const dateStr = apt.date.split('T')[0].replace(/-/g, '');
  const startTimeStr = apt.startTime.replace(':', '') + '00';
  const endTimeStr = apt.endTime.replace(':', '') + '00';

  const start = `${dateStr}T${startTimeStr}`;
  const end = `${dateStr}T${endTimeStr}`;

  const title = encodeURIComponent(`Cita: ${service?.name} - ${client?.name}`);
  const details = encodeURIComponent(
    `Servicio: ${service?.name}\nClienta: ${client?.name}\nPrecio: ${service?.price}`
  );

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${start}/${end}`;
};

const downloadICS = (apt: Appointment, client: Client | undefined, service: Service | undefined) => {
  const dateStr = apt.date.split('T')[0].replace(/-/g, '');
  const startTimeStr = apt.startTime.replace(':', '') + '00';
  const endTimeStr = apt.endTime.replace(':', '') + '00';

  const start = `${dateStr}T${startTimeStr}`;
  const end = `${dateStr}T${endTimeStr}`;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Cita: ${service?.name} - ${client?.name}`,
    `DESCRIPTION:Servicio: ${service?.name}\\nClienta: ${client?.name}\\nPrecio: ${service?.price}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `cita-${client?.name?.toLowerCase().replace(/\s+/g, '-') || 'evento'}.ics`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

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

interface DraggableAppointmentProps {
  apt: Appointment;
  client: Client | undefined;
  service: Service | undefined;
  style?: React.CSSProperties;
  statusStyle: AppointmentStatusStyle;
  isOverlay?: boolean;
  onDetailClick?: (id: string) => void;
}

interface AppointmentStatusStyle {
  readonly bg: string;
  readonly text: string;
  readonly border: string;
  readonly dot: string;
  readonly label: string;
  readonly glow: string;
}

const AppointmentCard = React.forwardRef<
  HTMLDivElement,
  DraggableAppointmentProps & React.HTMLAttributes<HTMLDivElement>
>(function AppointmentCard(
  { apt, client, service, style, statusStyle, isOverlay, onDetailClick, ...props },
  ref
) {
  const [h, m] = apt.startTime.split(':').map(Number);
  const [eh, em] = apt.endTime.split(':').map(Number);
  const duration = eh * 60 + em - (h * 60 + m);

  const isShort = duration < 45;

  return (
    <div
      ref={ref}
      {...props}
      style={{
        ...style,
        top: isOverlay ? 0 : `${h * 60 + m}px`,
        height: isOverlay ? `${Math.max(duration, 40)}px` : `${Math.max(duration, 40)}px`,
      }}
      onClick={(e) => {
        if (!isOverlay && props.onClick) props.onClick(e);
        if (!isOverlay && onDetailClick) onDetailClick(apt.id);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (!isOverlay && onDetailClick) onDetailClick(apt.id);
        }
      }}
      className={cn(
        'absolute left-2 right-2 rounded-[20px] p-3 md:p-4 transition-all hover:z-30 cursor-pointer overflow-hidden group/apt hover:shadow-2xl hover:shadow-black/10 active:scale-[0.98]',
        'bg-card border border-border shadow-sm',
        isOverlay &&
          'z-50 shadow-2xl material-thick scale-105 rotate-1 cursor-grabbing ring-8 ring-primary/10'
      )}
    >
      <div
        className={cn(
          'flex flex-col h-full overflow-hidden relative z-10',
          isShort ? 'justify-center' : 'justify-between'
        )}
      >
        {!isShort && (
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-muted-foreground/40">
              <Clock className="size-3" />
              <span className="text-[10px] font-bold tabular-nums tracking-widest">
                {apt.startTime}
              </span>
            </div>
            {client?.isVip && <div className="size-2 rounded-full bg-amber-400" />}
          </div>
        )}

        <div className="space-y-1 text-left">
          <h5
            className={cn(
              'font-display font-semibold tracking-tight text-foreground leading-tight group-hover/apt:text-primary transition-colors',
              isShort ? 'text-[12px] md:text-[14px]' : 'text-[15px] md:text-[17px]'
            )}
          >
            {client?.name}
          </h5>
          {!isShort && (
            <p className="text-[10px] md:text-[11px] font-medium text-muted-foreground opacity-60">
              {service?.name}
            </p>
          )}
        </div>

        {duration >= 60 && (
          <div className="mt-auto pt-3 flex items-center justify-between border-t border-border">
            <div className="flex items-center gap-2">
              <div className={cn('size-2 rounded-full', statusStyle.dot)} />
              <span className="text-[10px] font-medium text-muted-foreground opacity-40">
                {duration} MIN
              </span>
            </div>
            <ChevronRight className="size-4 text-muted-foreground opacity-20" />
          </div>
        )}
      </div>
    </div>
  );
});

const DraggableAppointment = ({
  apt,
  client,
  service,
  statusStyle,
  onDetailClick,
}: Omit<DraggableAppointmentProps, 'style'>) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: apt.id,
    data: { apt },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  if (isDragging) {
    return <div ref={setNodeRef} className="opacity-0" />;
  }

  return (
    <AppointmentCard
      ref={setNodeRef}
      apt={apt}
      client={client}
      service={service}
      style={style}
      statusStyle={statusStyle}
      onDetailClick={onDetailClick}
      {...listeners}
      {...attributes}
    />
  );
};

const DroppableColumn = ({
  day,
  children,
  onSlotClick,
}: {
  day: Date;
  children: React.ReactNode;
  onSlotClick: (time: string) => void;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: format(day, 'yyyy-MM-dd'),
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative bg-card/5 group/col transition-colors duration-500 hover:bg-black/[0.01]',
        isOver && 'bg-primary/5 ring-4 ring-inset ring-primary/20'
      )}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        onSlotClick(minutesToTime(y));
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSlotClick(minutesToTime(0));
        }
      }}
    >
      {Array.from({ length: 48 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-[30px] border-border',
            i % 2 === 1 ? 'border-b' : 'border-b-[0.5px] border-dashed'
          )}
        />
      ))}
      {children}
    </div>
  );
};

export function Appointments() {
  const { profile } = useBusinessProfileContext();
  const { clients } = useClientData();
  const {
    loading,
    error,
    appointments,
    services,
    cancelAppointment,
    confirmAppointment,
    startAppointment,
    completeAppointment,
    rescheduleAppointment,
  } = useAppointmentData();
  const { t } = useAppTranslation();
  const [detailAppointmentId, setDetailAppointmentId] = useState<string | null>(null);
  const [activeAptId, setActiveAptId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveAptId(String(event.active.id));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveAptId(null);
    const { active, over, delta } = event;

    if (over && active.data.current) {
      const apt = readAppointment(active.data.current);
      if (!apt) return;
      const newDateStr = String(over.id);
      const originalStartMins = timeToMinutes(apt.startTime);
      const newStartMins = originalStartMins + Math.round(delta.y);
      const duration = timeToMinutes(apt.endTime) - originalStartMins;

      const newStartTime = minutesToTime(newStartMins);
      const newEndTime = minutesToTime(newStartMins + duration);
      const newDate = parseLocalDate(newDateStr);

      // Validate availability
      const isAvailable = !appointments.some((a) => {
        if (a.id === apt.id || a.status === S.CANCELLED) return false;
        if (!isSameDay(parseLocalDate(a.date), newDate)) return false;
        const aStart = timeToMinutes(a.startTime);
        const aEnd = timeToMinutes(a.endTime);
        return Math.max(newStartMins, aStart) < Math.min(newStartMins + duration, aEnd);
      });

      if (!isAvailable) {
        toast.error(t('appointments.slotUnavailable'));
        return;
      }

      try {
        await rescheduleAppointment(
          apt.id,
          `${newDateStr}T${newStartTime}:00`,
          `${newDateStr}T${newEndTime}:00`
        );
      } catch (err) {
        toast.error(t('appointments.rescheduleUnavailable'), {
          description: t('appointments.rescheduleRequiresBackend'),
        });
      }
    }
  };

  const selectedAptForDetail = useMemo(
    () => appointments.find((a) => a.id === detailAppointmentId),
    [detailAppointmentId, appointments]
  );
  const detailClient = useMemo(
    () => clients.find((c) => c.id === selectedAptForDetail?.clientId),
    [selectedAptForDetail, clients]
  );
  const detailService = useMemo(
    () => services.find((s) => s.id === selectedAptForDetail?.serviceId),
    [selectedAptForDetail, services]
  );

  const activeApt = useMemo(
    () => appointments.find((a) => a.id === activeAptId),
    [activeAptId, appointments]
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [animatingCompletedId, setAnimatingCompletedId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState<'list' | 'day' | 'week' | 'month'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrev = () => {
    if (!selectedDate) return;
    if (view === 'day') setSelectedDate(addDays(selectedDate, -1));
    else if (view === 'week') setSelectedDate(addDays(selectedDate, -7));
    else setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNext = () => {
    if (!selectedDate) return;
    if (view === 'day') setSelectedDate(addDays(selectedDate, 1));
    else if (view === 'week') setSelectedDate(addDays(selectedDate, 7));
    else setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  };
  const [displayLimit, setDisplayLimit] = useState(10);
  const gridScrollRef = React.useRef<HTMLDivElement>(null);
  const [mouseY, setMouseY] = useState(0);
  const [now, setNow] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [selectedDate, view]);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setTimeout(() => setIsAddOpen(true), 100);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('add');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const statusStyles: Record<
    AppointmentStatus,
    { bg: string; text: string; border: string; dot: string; label: string; glow: string }
  > = {
    pending: {
      bg: 'bg-amber-500/5',
      text: 'text-amber-600',
      border: 'border-amber-500/10',
      dot: 'bg-amber-500',
      label: t('appointments.statuses.pending'),
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    },
    confirmed: {
      bg: 'bg-blue-500/5',
      text: 'text-blue-600',
      border: 'border-blue-500/10',
      dot: 'bg-blue-500',
      label: t('appointments.statuses.confirmed'),
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    },
    completed: {
      bg: 'bg-emerald-500/5',
      text: 'text-emerald-600',
      border: 'border-emerald-500/10',
      dot: 'bg-emerald-500',
      label: t('appointments.statuses.completed'),
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    },
    cancelled: {
      bg: 'bg-rose-500/5',
      text: 'text-rose-600',
      border: 'border-rose-500/10',
      dot: 'bg-rose-500',
      label: t('appointments.statuses.cancelled'),
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]',
    },
  };

  // Form State
  const [startTime, setStartTime] = useState('');

  const appointmentDays = appointments.map((apt) => parseLocalDate(apt.date));

  const handleStatusChange = async (aptId: string, newStatus: AppointmentStatus) => {
    if (newStatus === S.CANCELLED) {
      setConfirmCancelId(aptId);
      return;
    }
    try {
      if (newStatus === S.CONFIRMED) await confirmAppointment(aptId);
      else if (newStatus === S.COMPLETED) await completeAppointment(aptId);
      else await startAppointment(aptId);
    } catch {
      // API call failed — the UI will show the error via the mutation state
    }
  };

  const filteredAppointments = appointments
    .filter((apt) => (selectedDate ? isSameDay(parseLocalDate(apt.date), selectedDate) : true))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const SkeletonItem = () => (
    <div className="flex flex-col md:flex-row items-center gap-8 rounded-[2rem] p-5 glass border-none animate-pulse">
      <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-1 md:gap-2 shrink-0 w-full md:w-24">
        <div className="h-8 md:h-10 w-16 md:w-20 bg-black/[0.05] rounded-lg" />
        <div className="h-3 w-10 bg-black/[0.03] rounded-full hidden md:block" />
      </div>
      <div className="flex-1 space-y-3 w-full">
        <div className="h-8 w-48 bg-black/[0.05] rounded-xl" />
        <div className="flex gap-4">
          <div className="h-4 w-32 bg-black/[0.03] rounded-lg" />
          <div className="h-4 w-16 bg-black/[0.03] rounded-lg" />
        </div>
      </div>
      <div className="h-10 w-32 md:w-36 bg-black/[0.05] rounded-xl hidden md:block" />
    </div>
  );
  React.useEffect(() => {
    setDisplayLimit(10);
  }, [selectedDate]);

  React.useEffect(() => {
    if ((view === 'day' || view === 'week') && gridScrollRef.current) {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      gridScrollRef.current.scrollTop = Math.max(0, mins - 200);
    }
  }, [view]);

  const isToday = isSameDay(selectedDate || new Date(), new Date());
  const currentTime = format(new Date(), 'HH:mm');
  const nextUpId = isToday
    ? filteredAppointments.find((a) => a.startTime >= currentTime && a.status !== S.CANCELLED)?.id
    : null;

  // Month Calendar Logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const fiveDays = useMemo(() => {
    const base = selectedDate || new Date();
    return Array.from({ length: 5 }).map((_, i) => addDays(base, i - 2));
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 lg:space-y-16 animate-in fade-in duration-1000 pb-52 lg:pb-16 px-4 sm:px-6 lg:px-0 max-w-full mx-auto min-h-screen">
      {error && <ErrorBanner error={error} />}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
            Gestión de Tiempo
          </p>
          <div className="space-y-0">
            <h2
              data-testid={els.appointments.header}
              className="text-[40px] lg:text-[56px] font-display font-semibold tracking-tight text-foreground leading-none"
            >
              Calendario.
            </h2>
            <div className="flex items-center gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-[#34C759] animate-pulse" />
                <p className="text-muted-foreground text-base lg:text-lg font-medium">
                  {appointments.filter((a) => isSameDay(parseLocalDate(a.date), new Date())).length}{' '}
                  citas para hoy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redesigned Header: Date Strip */}
      <div className="relative w-full flex flex-col items-center gap-8">
        {/* Toggle Button for Collapsible Monthly Calendar */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="group flex flex-col items-center gap-1 px-8 py-3 rounded-full hover:bg-neutral-50 border border-border transition-all duration-300 active:scale-95"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
              Calendario Mensual
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-display font-semibold tracking-tight text-foreground capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>
              <ChevronDown
                className={cn(
                  'size-5 transition-transform duration-500 text-primary',
                  showMonthPicker ? 'rotate-180' : 'rotate-0'
                )}
              />
            </div>
          </button>
        </div>

        {/* Collapsible Monthly Calendar */}
        <AnimatePresence initial={false}>
          {showMonthPicker && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl overflow-hidden"
            >
              <div className="w-full bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6 px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="size-10 rounded-xl hover:bg-neutral-50 active:scale-95 transition-all text-muted-foreground"
                  >
                    <ChevronLeft className="size-5" />
                  </Button>
                  <h3 className="font-display font-semibold text-lg lg:text-xl capitalize text-foreground">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="size-10 rounded-xl hover:bg-neutral-50 active:scale-95 transition-all text-muted-foreground"
                  >
                    <ChevronRight className="size-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
                    <div key={d} className="text-center py-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        {d}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate || new Date());
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isHoy = isSameDay(day, new Date());

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => {
                          setSelectedDate(day);
                          setCurrentMonth(day);
                          setShowMonthPicker(false); // Auto-collapse on select to save screen space
                        }}
                        className={cn(
                          'aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-300 relative',
                          isSelected
                            ? 'bg-[#1D1D1F] text-white shadow-lg font-bold'
                            : 'hover:bg-neutral-50 text-foreground font-semibold',
                          !isCurrentMonth && 'opacity-25',
                          isHoy && !isSelected && 'text-primary font-bold'
                        )}
                      >
                        <span>{format(day, 'd')}</span>
                        {appointments.some((a) => isSameDay(parseLocalDate(a.date), day)) && (
                          <div
                            className={cn(
                              'size-1 rounded-full absolute bottom-2',
                              isSelected ? 'bg-card' : 'bg-primary/50'
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5-Day Horizontal Strip */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 md:gap-6 w-full max-w-4xl px-3 sm:px-4 py-4 sm:py-6 bg-card border border-border rounded-3xl sm:rounded-[40px] shadow-sm overflow-hidden">
          {fiveDays.map((day) => {
            const isActive = isSameDay(day, selectedDate || new Date());
            const isHoy = isSameDay(day, new Date());
            return (
              <motion.button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setCurrentMonth(day);
                }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex flex-col items-center justify-center shrink min-w-0 flex-1 sm:flex-initial transition-all duration-500',
                  'w-11 h-18 sm:w-16 sm:h-24 md:w-24 md:h-32 rounded-xl sm:rounded-[24px] md:rounded-[32px]',
                  isActive
                    ? 'bg-[#1D1D1F] text-white shadow-xl sm:shadow-2xl scale-105 sm:scale-110 z-10'
                    : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-card hover:shadow-md'
                )}
              >
                <span
                  className={cn(
                    'text-[8px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest mb-0.5 sm:mb-1',
                    isActive ? 'opacity-60' : 'opacity-40'
                  )}
                >
                  {format(day, 'EEE', { locale: es })}
                </span>
                <span className="text-sm sm:text-xl md:text-3xl font-display font-semibold">
                  {format(day, 'd')}
                </span>
                {isHoy && !isActive && (
                  <div className="mt-1 sm:mt-2 size-1 sm:size-1.5 bg-primary rounded-full animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <Dialog
        open={!!detailAppointmentId}
        onOpenChange={(open) => !open && setDetailAppointmentId(null)}
      >
        <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl p-0 overflow-hidden bg-background border-none shadow-[0_32px_80px_-16px_rgba(0,0,0,0.12)] sm:rounded-3xl rounded-2xl outline-none w-[calc(100%-1.5rem)] mx-3 sm:w-full sm:mx-0 !top-1/2 !-translate-y-1/2">
          {selectedAptForDetail && (
            <div className="flex flex-col max-h-[90vh] sm:max-h-none overflow-y-auto scrollbar-hide pb-6">
              {/* Top Bar - Header Background & Close */}
              <div className="relative h-20 sm:h-24 bg-gradient-to-br from-primary/[0.03] to-primary/[0.08] overflow-hidden">
                <div className="absolute top-4 right-4 z-50">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDetailAppointmentId(null)}
                    className="rounded-full bg-card/40 backdrop-blur-md hover:bg-card/60 size-8 transition-colors shadow-sm"
                  >
                    <X className="size-3.5 text-black/40" />
                  </Button>
                </div>
              </div>

              {/* Profile Header Section */}
              <div className="px-5 sm:px-8 pb-6 pt-0 -mt-10 relative z-10">
                <div className="flex items-end gap-4 mb-5">
                  <div className="size-20 sm:size-24 rounded-3xl bg-card shadow-xl flex items-center justify-center p-1 shrink-0">
                    <div className="size-full bg-background rounded-[1.4rem] flex items-center justify-center text-muted-foreground/20 border border-border">
                      {detailClient?.isVip ? (
                        <UserStar className="size-8 sm:size-10" />
                      ) : detailClient?.id &&
                        appointments
                          .filter(
                            (a) =>
                              a.clientId === detailClient.id &&
                              (a.status === S.COMPLETED || a.status === S.CONFIRMED)
                          )
                          .sort((a, b) => b.date.localeCompare(a.date))[0]?.date &&
                        new Date().getTime() -
                          parseLocalDate(
                            appointments
                              .filter(
                                (a) =>
                                  a.clientId === detailClient.id &&
                                  (a.status === S.COMPLETED || a.status === S.CONFIRMED)
                              )
                              .sort((a, b) => b.date.localeCompare(a.date))[0].date
                          ).getTime() >
                          1000 * 60 * 60 * 24 * 75 ? (
                        <Ghost className="size-8 sm:size-10" />
                      ) : (
                        <User className="size-8 sm:size-10" />
                      )}
                    </div>
                  </div>
                  <div className="pb-1 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-display font-black tracking-tight text-foreground leading-tight">
                        {detailClient?.name}
                      </h3>
                      {detailClient?.isVip && (
                        <div className="bg-[#FFD60A] text-black px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                          <Star className="size-2.5 fill-current" />
                          <span className="text-[7px] font-black uppercase tracking-widest">
                            VIP
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="size-3 opacity-50" />
                        <span className="text-xs font-semibold tracking-tight">
                          {detailClient?.phone || 'Sin número'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid of Details (Bento Style) */}
              <div className="px-5 sm:px-8 space-y-3">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between group transition-all hover:bg-neutral-50">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <Sparkle className="size-5" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 opacity-50">
                        Servicio
                      </p>
                      <p className="font-bold text-sm sm:text-base text-foreground leading-tight">
                        {detailService?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 opacity-50">
                      Costo
                    </p>
                    <p className="text-base sm:text-lg font-display font-black text-primary">
                      ${detailService?.price}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                      <Clock className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                        Hora
                      </p>
                      <p className="font-bold text-sm text-foreground truncate">
                        {selectedAptForDetail.startTime}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                      <CalendarIcon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                        Fecha
                      </p>
                      <p className="font-bold text-sm text-foreground truncate capitalize">
                        {selectedAptForDetail
                          ? format(parseLocalDate(selectedAptForDetail.date), 'd MMM', {
                              locale: es,
                            })
                          : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-1 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-between pl-4">
                  <AppointmentStatusBadge
                    status={selectedAptForDetail.status}
                    label={statusStyles[selectedAptForDetail.status].label}
                  />
                  <Select
                    value={selectedAptForDetail.status}
                    onValueChange={(val) =>
                      isAppointmentStatus(val) && handleStatusChange(selectedAptForDetail.id, val)
                    }
                  >
                    <SelectTrigger className="h-10 w-28 bg-neutral-50 border-none rounded-xl text-[9px] font-black uppercase tracking-widest px-3 focus:ring-primary/10">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-none shadow-xl glass-dark z-[200] p-1">
                      <SelectItem
                        value="pending"
                        className="rounded-lg text-[9px] font-bold uppercase tracking-wider focus:bg-card/10 my-0.5"
                      >
                        Pendiente
                      </SelectItem>
                      <SelectItem
                        value="confirmed"
                        className="rounded-lg text-[9px] font-bold uppercase tracking-wider text-blue-400 focus:bg-blue-500/10 my-0.5"
                      >
                        Confirmada
                      </SelectItem>
                      <SelectItem
                        value="completed"
                        className="rounded-lg text-[9px] font-bold uppercase tracking-wider text-emerald-400 focus:bg-emerald-500/10 my-0.5"
                      >
                        Completada
                      </SelectItem>
                      <SelectItem
                        value="cancelled"
                        className="rounded-lg text-[9px] font-bold uppercase tracking-wider text-rose-400 focus:bg-rose-500/10 my-0.5"
                      >
                        Cancelada
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(detailClient?.allergies ||
                  detailClient?.preferences ||
                  selectedAptForDetail.notes) && (
                  <div className="pt-1 space-y-2">
                    {detailClient?.allergies && (
                      <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100/50 flex items-start gap-3">
                        <AlertCircle className="size-3.5 text-rose-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] font-medium text-rose-900/80 leading-relaxed">
                          <span className="font-black uppercase text-[8px] tracking-widest opacity-40 mr-1">
                            Piel:
                          </span>{' '}
                          {detailClient.allergies}
                        </p>
                      </div>
                    )}

                    {detailClient?.preferences && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100/50 flex items-start gap-3">
                        <Heart className="size-3.5 text-indigo-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] font-medium text-indigo-900/80 leading-relaxed">
                          <span className="font-black uppercase text-[8px] tracking-widest opacity-40 mr-1">
                            Gusto:
                          </span>{' '}
                          {detailClient.preferences}
                        </p>
                      </div>
                    )}

                    {selectedAptForDetail.notes && (
                      <div className="p-3.5 rounded-xl bg-[#1D1D1F]/[0.02] border border-border flex items-start gap-3">
                        <StickyNote className="size-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <p className="text-[11px] font-medium text-foreground/70 leading-relaxed">
                          <span className="font-black uppercase text-[8px] tracking-widest opacity-40 mr-1">
                            Nota:
                          </span>{' '}
                          {selectedAptForDetail.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Center - Refined */}
              <div className="px-5 sm:px-8 pt-5 space-y-2.5">
                <Button
                  className="w-full h-12 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg flex items-center justify-between px-5 group transition-all"
                  onClick={() => {
                    if (detailClient?.phone) {
                      const msg = `Hola ${detailClient.name}! ✨ Recordatorio: tu cita de ${detailService?.name} hoy a las ${selectedAptForDetail.startTime}.`;
                      window.open(
                        `https://wa.me/${detailClient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
                        '_blank'
                      );
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="size-4" />
                    <span className="font-black text-[10px] uppercase tracking-widest">
                      WhatsApp
                    </span>
                  </div>
                  <ChevronRight className="size-3.5 opacity-40 group-hover:translate-x-0.5 transition-transform" />
                </Button>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(
                        generateGoogleCalendarLink(
                          selectedAptForDetail,
                          detailClient,
                          detailService
                        ),
                        '_blank'
                      )
                    }
                    className="h-10 rounded-xl border-border bg-card shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-foreground"
                  >
                    <CalendarIcon className="size-3.5 text-blue-500" />
                    Calendario
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmCancelId(selectedAptForDetail.id)}
                    className="h-10 rounded-xl border-border bg-card shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-rose-500"
                  >
                    <X className="size-3.5" />
                    Anular
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AgendarModal
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        date={selectedDate}
        startTime={startTime}
        onSuccess={() => {
          setIsAddOpen(false);
          setStartTime('');
        }}
      />

      <Dialog open={!!confirmCancelId} onOpenChange={(open) => !open && setConfirmCancelId(null)}>
        <DialogContent className="max-w-xl md:max-w-2xl bg-card border-none shadow-2xl rounded-[3.5rem] p-0 overflow-hidden">
          <div className="bg-[#FF3B30] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-64 bg-card/20 rounded-full blur-[100px]" />
            <div className="relative z-10 space-y-4">
              <div className="size-16 rounded-[2rem] bg-card/10 border border-white/20 flex items-center justify-center">
                <X className="size-10 text-white" />
              </div>
              <div>
                <DialogTitle className="text-4xl font-black tracking-tighter">
                  ¿Confirmar Cancelación?
                </DialogTitle>
                <DialogDescription className="text-white/70 text-[13px] font-bold uppercase tracking-[0.2em] mt-2">
                  Este espacio quedará libre de inmediato
                </DialogDescription>
              </div>
            </div>
          </div>
          <div className="p-12 space-y-10">
            <p className="text-muted-foreground font-medium text-lg leading-relaxed">
              Al confirmar, la clienta recibirá una notificación automática y el espacio se
              habilitará en tu portal de reservas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="ghost"
                onClick={() => setConfirmCancelId(null)}
                className="flex-1 h-16 rounded-[1.75rem] text-[15px] font-bold hover:bg-neutral-100 transition-all text-muted-foreground"
              >
                Volver
              </Button>
              <Button
                onClick={async () => {
                  if (confirmCancelId) {
                    try {
                      await cancelAppointment(confirmCancelId);
                      setConfirmCancelId(null);
                      toast.success(t('appointments.cancelled'), {
                        description: t('appointments.cancelled'),
                      });
                    } catch (err) {
                      console.error('Cancel mutation failed:', err);
                      toast.error(t('appointments.cancelFailed'), {
                        description: t('common.errors.calendar_sync_failed'),
                      });
                    }
                  }
                }}
                className="flex-[1.5] h-16 rounded-[1.75rem] bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90 transition-all font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#FF3B30]/30"
              >
                Cancelar Cita
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-10 items-center"
          >
            <div className="w-full max-w-4xl space-y-6">
              <div className="flex items-center justify-between px-8 py-6 bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <CircleDollarSign className="size-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                      Proyectado de hoy
                    </p>
                    <p className="text-2xl font-display font-black tracking-tight leading-none">
                      $
                      {filteredAppointments
                        .reduce((sum, apt) => {
                          const s = services.find((srv) => srv.id === apt.serviceId);
                          return sum + (s?.price || 0);
                        }, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right px-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                    Total Servicios
                  </p>
                  <p className="text-xl font-display font-black tracking-tight">
                    {filteredAppointments.length}
                  </p>
                </div>
              </div>

              <AnimatePresence mode="popLayout" initial={false}>
                {isLoading ? (
                  <motion.div
                    key="skeletons"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {[1, 2, 3].map((i) => (
                      <SkeletonItem key={i} />
                    ))}
                  </motion.div>
                ) : filteredAppointments.length > 0 ? (
                  <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="space-y-4 relative py-4"
                  >
                    {/* Timeline Vertical Line */}
                    <div className="absolute left-[40px] top-12 bottom-12 w-px bg-black/[0.04] hidden md:block" />

                    {filteredAppointments.slice(0, displayLimit).map((apt) => {
                      const client = clients.find((c) => c.id === apt.clientId);
                      const service = services.find((s) => s.id === apt.serviceId);
                      const statusConfig = statusStyles[apt.status];
                      const isNext = apt.id === nextUpId;
                      const cardShadow = getAppointmentShadow(apt.id);

                      // Calculate duration in minutes
                      const [h1, m1] = apt.startTime.split(':').map(Number);
                      const [h2, m2] = apt.endTime.split(':').map(Number);
                      const duration = h2 * 60 + m2 - (h1 * 60 + m1);

                      return (
                        <motion.div
                          key={apt.id}
                          variants={item}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setDetailAppointmentId(apt.id)}
                          className={cn(
                            'group relative flex flex-col md:flex-row items-stretch md:items-center justify-between p-6 sm:p-8 rounded-[2.5rem] bg-card border border-border gap-5 sm:gap-6 transition-all duration-500 cursor-pointer overflow-hidden',
                            isNext
                              ? 'bg-background ring-1 ring-primary/20 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.04)]'
                              : cn(cardShadow, 'hover:bg-neutral-50/50 hover:border-border')
                          )}
                        >
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 sm:gap-8 lg:gap-12 flex-1 min-w-0 w-full">
                            {/* Left: Precise Time */}
                            <div className="flex flex-row sm:flex-col items-center sm:items-center justify-between sm:justify-center border-b sm:border-b-0 sm:border-r border-border pb-4 sm:pb-0 pr-0 sm:pr-8 lg:pr-12 shrink-0">
                              <div className="flex flex-col sm:items-center text-left sm:text-center">
                                <span
                                  className={cn(
                                    'text-2xl lg:text-3xl font-display font-black tracking-tighter leading-none transition-colors',
                                    isNext ? 'text-primary' : 'text-foreground'
                                  )}
                                >
                                  {apt.startTime}
                                </span>
                                <div className="flex items-center gap-1 mt-1 opacity-40">
                                  <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                    Inicia
                                  </span>
                                </div>
                              </div>

                              {/* Mobile-only pricing and duration preview in the header row */}
                              <div className="flex sm:hidden items-center gap-3">
                                <div className="flex items-center gap-1 opacity-60">
                                  <Clock className="size-3.5" />
                                  <span className="text-xs font-bold text-muted-foreground">
                                    {duration}m
                                  </span>
                                </div>
                                <span
                                  className={cn(
                                    'text-lg font-display font-black tracking-tight',
                                    isNext ? 'text-primary' : 'text-foreground'
                                  )}
                                >
                                  ${service?.price}
                                </span>
                              </div>
                            </div>

                            {/* Middle: Content Section */}
                            <div className="flex-1 min-w-0 w-full space-y-3">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <h4 className="font-display font-black text-lg sm:text-xl lg:text-3xl tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors text-wrap break-words min-w-0 max-w-full">
                                  {client?.name}
                                </h4>
                                {client?.isVip && (
                                  <div className="bg-[#FFD60A]/10 text-[#A28400] px-2.5 py-0.5 rounded-lg flex items-center gap-1 border border-[#FFD60A]/20 shrink-0">
                                    <Star className="size-2.5 fill-current" />
                                    <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                                      VIP
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#1D1D1F]/[0.02] border border-border w-fit max-w-full">
                                  <Sparkle className="size-3.5 text-primary opacity-50 shrink-0" />
                                  <span className="text-foreground/70 font-black uppercase tracking-widest text-[10px] lg:text-[12px] text-wrap break-words leading-tight">
                                    {service?.name}
                                  </span>
                                </div>

                                {/* Stats Block: Duration > Price (desktop/tablet) */}
                                <div className="hidden sm:flex items-center gap-4 ml-1">
                                  <div className="flex items-center gap-1.5 text-muted-foreground/70">
                                    <Clock className="size-4" />
                                    <span className="text-xs lg:text-sm font-bold leading-none">
                                      {duration}m
                                    </span>
                                  </div>
                                  <div className="w-px h-3 bg-black/[0.04]" />
                                  <div className="flex items-baseline gap-1">
                                    <span
                                      className={cn(
                                        'text-md lg:text-2xl font-display font-black tracking-tight',
                                        isNext ? 'text-primary' : 'text-foreground'
                                      )}
                                    >
                                      ${service?.price}
                                    </span>
                                    <span className="text-[9px] font-black uppercase opacity-30">
                                      MXN
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions and Status */}
                          <div className="flex items-center justify-between md:justify-end gap-3 lg:gap-6 w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-border">
                            <div className="flex flex-col items-end gap-1.5 md:border-r border-border md:pr-6 md:mr-2">
                              <Select
                                value={apt.status}
                                onValueChange={(val) =>
                                  isAppointmentStatus(val) && handleStatusChange(apt.id, val)
                                }
                              >
                                <SelectTrigger
                                  className={cn(
                                    'h-9 w-32 rounded-full text-[8.5px] font-black uppercase tracking-widest border-none px-4 transition-all ring-1 ring-black/5 hover:ring-black/10 shadow-none bg-neutral-100',
                                    statusConfig.bg,
                                    statusConfig.text
                                  )}
                                >
                                  <div className="flex items-center gap-1.5 font-black uppercase">
                                    <div className={cn('size-1 rounded-full', statusConfig.dot)} />
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="rounded-[1.25rem] border-none glass shadow-2xl p-1 z-[150]">
                                  <SelectItem
                                    value="pending"
                                    className="rounded-lg text-[8px] font-black uppercase tracking-widest py-1.5"
                                  >
                                    Pendiente
                                  </SelectItem>
                                  <SelectItem
                                    value="confirmed"
                                    className="rounded-lg text-[8px] font-black uppercase tracking-widest text-blue-500 py-1.5"
                                  >
                                    Confirmada
                                  </SelectItem>
                                  <SelectItem
                                    value="completed"
                                    className="rounded-lg text-[8px] font-black uppercase tracking-widest text-emerald-500 py-1.5"
                                  >
                                    Finalizada
                                  </SelectItem>
                                  <SelectItem
                                    value="cancelled"
                                    className="rounded-lg text-[8px] font-black uppercase tracking-widest text-rose-500 py-1.5"
                                  >
                                    Cancelada
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="size-11 lg:size-14 rounded-full bg-neutral-50 flex items-center justify-center text-black/10 group-hover:bg-[#1D1D1F] group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl">
                              <ChevronRight className="size-5 lg:size-8 stroke-[3]" />
                            </div>
                          </div>

                          {/* Vertical Indicator for Next Up */}
                          {isNext && (
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ) : (
                  <div className="bg-neutral-50/50 py-32 rounded-[3rem] border-2 border-dashed border-border flex flex-col items-center text-center p-8">
                    <CalendarIcon className="size-16 text-muted-foreground/5 mb-6" />
                    <h3 className="text-2xl font-bold tracking-tight">
                      {t('appointments.emptyToday')}
                    </h3>
                    <p className="text-muted-foreground mt-2 font-medium">
                      Disfruta el descanso o agenda una nueva visita.
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : view === 'month' ? (
          <motion.div
            key="month-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="space-y-6"
          >
            <div className="bg-card/50 backdrop-blur-xl rounded-[2.5rem] border border-border shadow-xl overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border bg-neutral-100/30">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                  <div key={day} className="py-4 text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-px bg-black/[0.03]">
                {calendarDays.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isHoy = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate || new Date());
                  const dayAppointments = appointments.filter((apt) =>
                    isSameDay(parseLocalDate(apt.date), day)
                  );

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => {
                        setSelectedDate(day);
                        setView('day');
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedDate(day);
                          setView('day');
                        }
                      }}
                      className={cn(
                        'min-h-[90px] md:min-h-[130px] p-2 md:p-4 bg-card transition-all cursor-pointer hover:bg-neutral-50/50 relative group',
                        !isCurrentMonth && 'opacity-20 pointer-events-none'
                      )}
                    >
                      <span
                        className={cn(
                          'size-8 md:size-10 flex items-center justify-center rounded-xl text-xs md:text-lg font-black transition-all mb-2',
                          isHoy
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground opacity-30 group-hover:opacity-100'
                        )}
                      >
                        {format(day, 'd')}
                      </span>

                      <div className="flex flex-wrap gap-1">
                        {dayAppointments.slice(0, 4).map((apt) => (
                          <div
                            key={apt.id}
                            className="size-1.5 md:size-2 rounded-full bg-neutral-200"
                          />
                        ))}
                        {dayAppointments.length > 4 && (
                          <span className="text-[8px] font-black text-muted-foreground/40">
                            +{dayAppointments.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden flex flex-col h-[700px]"
          >
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToWindowEdges]}
            >
              {/* Grid Header */}
              <div className="flex items-center border-b border-border bg-neutral-50/30 px-4 md:px-6 py-4">
                <div className="w-16 md:w-20" />
                <div
                  className={cn(
                    'flex-1 grid gap-2',
                    view === 'day' ? 'grid-cols-1' : 'grid-cols-7'
                  )}
                >
                  {(view === 'day'
                    ? [selectedDate || new Date()]
                    : eachDayOfInterval({
                        start: startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 }),
                        end: addDays(
                          startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 }),
                          6
                        ),
                      })
                  ).map((day) => (
                    <div key={day.toISOString()} className="text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#007AFF] mb-1">
                        {format(day, 'EEE', { locale: es })}
                      </p>
                      <div
                        className={cn(
                          'size-8 md:size-10 mx-auto flex items-center justify-center rounded-xl font-bold transition-all',
                          isSameDay(day, new Date())
                            ? 'bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20'
                            : 'text-foreground'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Content */}
              <div className="flex-1 overflow-y-auto relative" ref={gridScrollRef}>
                <div className="flex min-h-[1440px]">
                  {/* Time Scale */}
                  <div className="w-16 md:w-20 border-r border-border bg-neutral-100/30 backdrop-blur-sm z-20">
                    {Array.from({ length: 24 }).map((_, h) => (
                      <div key={h} className="h-[60px] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground/30 tabular-nums">
                          {String(h).padStart(2, '0')}:00
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  <div
                    className={cn(
                      'flex-1 grid gap-px bg-black/[0.03] relative',
                      view === 'day' ? 'grid-cols-1' : 'grid-cols-7'
                    )}
                  >
                    {(view === 'day'
                      ? [selectedDate || new Date()]
                      : eachDayOfInterval({
                          start: startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 }),
                          end: addDays(
                            startOfWeek(selectedDate || new Date(), { weekStartsOn: 1 }),
                            6
                          ),
                        })
                    ).map((day) => {
                      const dayApts = appointments.filter(
                        (a) => isSameDay(parseLocalDate(a.date), day) && a.status !== S.CANCELLED
                      );

                      return (
                        <DroppableColumn
                          key={day.toISOString()}
                          day={day}
                          onSlotClick={(time) => {
                            setStartTime(time);
                            setSelectedDate(day);
                            setIsAddOpen(true);
                          }}
                        >
                          {dayApts.map((apt) => {
                            const client = clients.find((c) => c.id === apt.clientId);
                            const service = services.find((s) => s.id === apt.serviceId);
                            const style = statusStyles[apt.status];

                            return (
                              <DraggableAppointment
                                key={apt.id}
                                apt={apt}
                                client={client}
                                service={service}
                                statusStyle={style}
                                onDetailClick={setDetailAppointmentId}
                              />
                            );
                          })}
                        </DroppableColumn>
                      );
                    })}

                    {/* Current Time Indicator */}
                    {((view === 'day' && isSameDay(selectedDate || new Date(), now)) ||
                      view === 'week') && (
                      <div
                        className="absolute left-0 right-0 border-t border-[#FF3B30] z-40 pointer-events-none flex items-center"
                        style={{ top: `${now.getHours() * 60 + now.getMinutes()}px` }}
                      >
                        <div className="size-2 rounded-full bg-[#FF3B30] -ml-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DragOverlay
                dropAnimation={{
                  sideEffects: defaultDropAnimationSideEffects({
                    styles: {
                      active: {
                        opacity: '0.4',
                      },
                    },
                  }),
                }}
              >
                {activeApt ? (
                  <AppointmentCard
                    apt={activeApt}
                    client={clients.find((c) => c.id === activeApt.clientId)}
                    service={services.find((s) => s.id === activeApt.serviceId)}
                    statusStyle={statusStyles[activeApt.status]}
                    style={{ position: 'relative' }}
                    isOverlay
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
