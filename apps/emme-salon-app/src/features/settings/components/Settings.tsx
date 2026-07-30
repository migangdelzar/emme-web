import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { els } from '@emme/i18n';
import { useApp, type BusinessProfile } from '@/context/AppContext';
import { useSettingsData } from '@/features/settings/hooks/useSettingsData';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card';
import {
  Briefcase,
  Palette,
  Bell,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Database,
  RefreshCw,
  Trash2,
  Clock,
  MapPin,
  MessageSquare,
  BotMessageSquare,
  Download,
  Info,
  Phone,
  ScanFace,
  User,
  Store,
  Ticket,
  Tag,
  Globe,
  LogOut,
  UserX,
  Plus,
  Calendar,
  ShieldCheck,
  Layout,
  Languages,
  Moon,
  Sun,
  Monitor,
  Zap,
  Settings2,
  Palmtree,
  Coffee,
  ShieldAlert,
  StickyNote,
  CircleX,
  TrendingUp,
  Sparkles,
  Sparkle,
  CalendarOff,
  CalendarClock,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { toast } from 'sonner';
import { cacheService } from '@/services/cacheService';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { ConnectGoogleButton } from '@/features/google-workspace/components/ConnectGoogleButton';
import { GoogleAccountStatus } from '@/features/google-workspace/components/GoogleAccountStatus';
import { CalendarSyncToggle } from '@/features/google-workspace/components/CalendarSyncToggle';
import { SheetsExportSection } from '@/features/google-workspace/components/SheetsExportSection';
import { SpreadsheetList } from '@/features/google-workspace/components/SpreadsheetList';
import { useGoogleOAuth } from '@/features/google-workspace/hooks/useGoogleOAuth';

type SettingsWhatsappBot = NonNullable<BusinessProfile['whatsappBot']> & {
  responseMode?: string;
};

type SettingsBusinessProfile = Omit<BusinessProfile, 'whatsappBot'> & {
  slotInterval?: number;
  whatsappBot?: SettingsWhatsappBot;
};

// Helper functions to calculate and format times nicely in the working hours UI
const getHoursLabel = (
  open: string,
  close: string,
  breakActive?: boolean,
  breakStart?: string,
  breakEnd?: string
) => {
  const toMins = (t: string) => {
    const [h, m] = (t || '').split(':').map(Number);
    return isNaN(h) || isNaN(m) ? 0 : h * 60 + m;
  };
  const o = toMins(open || '09:00');
  const c = toMins(close || '18:00');
  if (c <= o) return null;
  let diff = c - o;
  if (breakActive && breakStart && breakEnd) {
    const bs = toMins(breakStart);
    const be = toMins(breakEnd);
    if (be > bs && bs >= o && be <= c) {
      diff -= be - bs;
    }
  }
  const hrs = Math.floor(diff / 60);
  const mns = diff % 60;
  if (hrs <= 0 && mns <= 0) return null;
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} ${hrs === 1 ? 'hora' : 'horas'}`);
  if (mns > 0) parts.push(`${mns} min`);
  return parts.join(' y ') + ' de servicio';
};

const getBreakDurationLabel = (start: string, end: string) => {
  const toMins = (t: string) => {
    const [h, m] = (t || '').split(':').map(Number);
    return isNaN(h) || isNaN(m) ? 0 : h * 60 + m;
  };
  const s = toMins(start || '13:00');
  const e = toMins(end || '14:00');
  if (e <= s) return '';
  const diff = e - s;
  const hrs = Math.floor(diff / 60);
  const mns = diff % 60;
  const parts = [];
  if (hrs > 0) parts.push(`${hrs} ${hrs === 1 ? 'hora' : 'horas'}`);
  if (mns > 0) parts.push(`${mns} min`);
  return parts.join(' y ');
};

function WorkspaceContent() {
  const { status } = useGoogleOAuth();
  const isConnected = status.data?.connected ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <div className="bg-[#4285F4] size-1.5 rounded-full" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4285F4] opacity-60">
            Integración Google
          </span>
        </div>

        {status.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : !isConnected ? (
          <div className="bg-card border border-border rounded-[40px] p-10 lg:p-14 shadow-sm">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="size-20 rounded-[28px] bg-[#4285F4]/10 text-[#4285F4] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="size-10" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </div>
              <div className="space-y-3 max-w-md">
                <h3 className="text-2xl font-display font-semibold text-foreground">
                  Conecta Google Workspace
                </h3>
                <p className="text-sm font-medium text-muted-foreground opacity-60 leading-relaxed">
                  Sincroniza tu calendario, exporta datos a Sheets y gestiona tu negocio con las
                  herramientas de Google.
                </p>
              </div>
              <ConnectGoogleButton />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <GoogleAccountStatus />
            <CalendarSyncToggle />
            <SheetsExportSection />
            <SpreadsheetList />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function Settings() {
  const { loading: settingsLoading, services } = useSettingsData();
  const {
    profile,
    updateProfile,
    clients,
    appointments,
  } = useApp();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [formData, setFormData] = useState<SettingsBusinessProfile>(profile);
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddingPromotion, setIsAddingPromotion] = useState(false);
  const [newPromoData, setNewPromoData] = useState({
    title: '',
    serviceId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    discountValue: 0,
    discountType: 'percentage' as 'percentage' | 'fixed',
  });
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [showAddExceptionForm, setShowAddExceptionForm] = useState(false);
  const [exceptionStep, setExceptionStep] = useState(1);
  const [newExceptionData, setNewExceptionData] = useState({
    date: new Date().toISOString().split('T')[0],
    endDate: '',
    type: 'holiday' as 'holiday' | 'reduced' | 'vacation',
    note: '',
    open: '09:00',
    close: '14:00',
  });

  const confirmAddSpecialDate = () => {
    if (!newExceptionData.note.trim()) {
      toast.error('Por favor, ingresa el motivo o nombre de la excepción');
      return;
    }

    const newDate = {
      id: crypto.randomUUID(),
      date: newExceptionData.date,
      type: newExceptionData.type,
      note: newExceptionData.note,
      ...(newExceptionData.type === 'vacation'
        ? { endDate: newExceptionData.endDate || newExceptionData.date }
        : {}),
      ...(newExceptionData.type === 'reduced'
        ? { open: newExceptionData.open || '09:00', close: newExceptionData.close || '14:00' }
        : {}),
    };

    setFormData({
      ...formData,
      salonConfig: {
        ...(formData.salonConfig || { specialDates: [] }),
        specialDates: [newDate, ...(formData.salonConfig?.specialDates || [])],
      },
    });

    setShowAddExceptionForm(false);
    toast.success('Nueva excepción agregada correctamente');
  };

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsDetailOpen(true);
  };

  const { t } = useTranslation();

  const handleSave = () => {
    updateProfile(formData);
    toast.success(t('save') + ' successfully' || 'Configuración guardada correctamente');
  };

  const handleClearCache = () => {
    setIsClearing(true);
    setTimeout(() => {
      cacheService.clear();
      setIsClearing(false);
      toast.success('Caché del sistema liberada');
      setTimeout(() => window.location.reload(), 1000);
    }, 800);
  };

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      const data = {
        profile,
        services,
        clients,
        appointments,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `respaldo-nails-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      toast.success('Copia de seguridad generada');
    }, 1200);
  };

  const updateWorkingHours = (day: string, field: string, value: any) => {
    const currentDay = formData.workingHours?.[day] || {
      open: '09:00',
      close: '20:00',
      active: true,
    };
    const updatedDay = {
      ...currentDay,
      [field]: value,
    };

    // Initialize default pause times when breakActive is toggled to true
    if (field === 'breakActive' && value === true) {
      if (!updatedDay.breakStart) updatedDay.breakStart = '13:00';
      if (!updatedDay.breakEnd) updatedDay.breakEnd = '14:00';
    }

    const newHours = {
      ...formData.workingHours,
      [day]: updatedDay,
    };
    setFormData({ ...formData, workingHours: newHours });
  };

  const updateNotifications = (field: string, value: any) => {
    setFormData({
      ...formData,
      notifications: {
        ...(formData.notifications || { whatsappEnabled: true, reminderTime: 24, template: '' }),
        [field]: value,
      },
    });
  };

  const updateWhatsappBot = (field: string, value: any) => {
    setFormData({
      ...formData,
      whatsappBot: {
        ...(formData.whatsappBot || {
          enabled: true,
          autoReply: true,
          welcomeMessage: '',
          responseMode: 'always',
        }),
        [field]: value,
      },
    });
  };

  const updateSpecialDate = (id: string, field: string, value: any) => {
    if (!formData.salonConfig?.specialDates) return;
    setFormData({
      ...formData,
      salonConfig: {
        ...formData.salonConfig,
        specialDates: formData.salonConfig.specialDates.map((d) =>
          d.id === id ? { ...d, [field]: value } : d
        ),
      },
    });
  };

  const removeSpecialDate = (id: string) => {
    setFormData({
      ...formData,
      salonConfig: {
        ...(formData.salonConfig || { specialDates: [] }),
        specialDates: (formData.salonConfig?.specialDates || []).filter((d) => d.id !== id),
      },
    });
  };

  const addPromotion = () => {
    setNewPromoData({
      title: '',
      serviceId: services[0]?.id || '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      discountValue: 5,
      discountType: 'percentage',
    });
    setIsAddingPromotion(true);
  };

  const confirmAddPromotion = () => {
    if (!newPromoData.title || !newPromoData.serviceId) {
      toast.error('Por favor completa los campos principales');
      return;
    }

    const newPromo = {
      id: crypto.randomUUID(),
      ...newPromoData,
      isActive: true,
    };

    setFormData({
      ...formData,
      promotions: [...(formData.promotions || []), newPromo],
    });

    setIsAddingPromotion(false);
    toast.success('Promoción creada con éxito');
  };

  const removePromotion = (id: string) => {
    setFormData({
      ...formData,
      promotions: (formData.promotions || []).filter((p) => p.id !== id),
    });
  };

  const updatePromotion = (id: string, field: string, value: any) => {
    setFormData({
      ...formData,
      promotions: (formData.promotions || []).map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    });
  };

  const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

  const tabItems = [
    {
      id: 'perfil',
      label: t('settings:profile', 'Perfil'),
      icon: User,
      description: 'Información comercial',
      category: 'Negocio',
    },
    {
      id: 'salon',
      label: 'Horarios',
      icon: Clock,
      description: 'Gestión de tiempo',
      category: 'Negocio',
    },
    {
      id: 'bot',
      label: 'WhatsApp Bot',
      icon: BotMessageSquare,
      description: 'Asistente inteligente',
      category: 'Negocio',
    },
    {
      id: 'promociones',
      label: 'Promociones',
      icon: Ticket,
      description: 'Campañas activas',
      category: 'Negocio',
    },
    {
      id: 'notificaciones',
      label: 'Notificaciones',
      icon: Bell,
      description: 'Preferencias de avisos',
      category: t('settings:preferences', 'Preferencias'),
    },
    {
      id: 'workspace',
      label: 'Google Workspace',
      icon: RefreshCw,
      description: 'Sincronización de datos',
      category: t('settings:preferences', 'Preferencias'),
    },
    {
      id: 'apariencia',
      label: 'Apariencia',
      icon: Layout,
      description: t('theme', 'Tema visual y estilo'),
      category: t('settings:preferences', 'Preferencias'),
    },
    {
      id: 'idioma',
      label: t('language', 'Idioma'),
      icon: Globe,
      description: t('language_selection', 'Lenguaje de interfaz'),
      category: t('settings:preferences', 'Preferencias'),
    },
    {
      id: 'datos',
      label: 'Datos',
      icon: Database,
      description: 'Respaldos y limpieza',
      category: t('settings:advanced', 'Avanzado'),
    },
    {
      id: 'cuenta',
      label: t('settings:security', 'Seguridad'),
      icon: ShieldCheck,
      description: 'Privacidad y acceso',
      category: t('settings:advanced', 'Avanzado'),
    },
  ];

  const dangerItems = [{ id: 'delete', label: 'Eliminar Cuenta', icon: UserX, variant: 'danger' }];

  const handleDangerAction = (id: string) => {
    setActiveTab('cuenta');
    setDeleteStep(1);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-12 lg:space-y-16 animate-in fade-in duration-1000 max-w-full mx-auto pb-52 min-h-screen px-4 sm:px-6 lg:px-0">
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-end justify-between gap-8 pt-4 transition-all duration-700',
          isDetailOpen ? 'hidden lg:flex' : 'flex'
        )}
      >
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
            Control del Sistema
          </p>
          <div className="space-y-0">
            <h2
              data-testid={els.settings.header.testId}
              className="text-[40px] lg:text-[56px] font-display font-semibold tracking-tight text-foreground leading-none"
            >
              Ajustes.
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="size-2 rounded-full bg-[#86868B]/20" />
              <p className="text-muted-foreground text-base lg:text-lg font-medium">
                Configura tu entorno de trabajo con precisión.
              </p>
            </div>
          </div>
        </div>
        <div className="hidden lg:block">
          <Button
            onClick={handleSave}
            className="apple-button h-16 px-12 bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90 text-[15px] font-semibold rounded-2xl shadow-xl transition-all active:scale-95"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>

      {/* Mobile Header with Back Button (Only in Detail View) */}
      <AnimatePresence>
        {isDetailOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center justify-between gap-4 py-8 md:hidden"
          >
            <Button
              variant="ghost"
              onClick={() => setIsDetailOpen(false)}
              className="h-12 w-12 rounded-full bg-secondary p-0"
            >
              <ChevronRight className="size-5 rotate-180" />
            </Button>
            <div className="flex-1 text-center">
              {(() => {
                const item = tabItems.find((t) => t.id === activeTab);
                return (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 mb-0.5">
                      Sección
                    </span>
                    <span className="font-display font-semibold text-xl text-foreground">
                      {item?.label}
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="w-12 h-12" /> {/* Spacer */}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={cn(
          'grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 relative outline-none',
          isDetailOpen ? 'pb-4' : ''
        )}
      >
        {/* Navigation Sidebar / Mobile Menu */}
        <div
          className={cn(
            'lg:col-span-4 space-y-10 transition-all duration-700',
            isDetailOpen ? 'hidden lg:block' : 'block'
          )}
        >
          {['Negocio', 'Preferencias', 'Avanzado'].map((category) => (
            <div key={category} className="space-y-4">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-40 px-4">
                {category}
              </h3>
              <div data-testid={els.settings.tabs.testId} className="bg-card border border-border rounded-[32px] p-2 flex flex-col gap-1 shadow-sm">
                {tabItems
                  .filter((item) => item.category === category)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={cn(
                          'flex items-center justify-between px-5 py-4 rounded-[20px] transition-all duration-500 relative group outline-none active:scale-[0.98]',
                          isActive && !isDetailOpen
                            ? 'bg-secondary text-primary'
                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={cn(
                              'size-10 rounded-[14px] flex items-center justify-center transition-all duration-500',
                              isActive
                                ? 'bg-card shadow-sm text-primary'
                                : 'bg-secondary text-muted-foreground group-hover:text-primary'
                            )}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="font-display font-semibold text-[17px] tracking-tight leading-none mb-1">
                              {item.label}
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-medium uppercase tracking-widest leading-none',
                                isActive ? 'text-primary/60' : 'opacity-40'
                              )}
                            >
                              {item.description}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            'size-4 transition-all opacity-20',
                            isActive
                              ? 'opacity-40 translate-x-1'
                              : 'group-hover:opacity-40 group-hover:translate-x-0.5'
                          )}
                        />
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Desktop Logout - Only visible on desktop */}
          <div className="hidden lg:block pt-4">
            <button
              onClick={logout}
              className="w-full flex items-center justify-between px-6 py-5 rounded-[32px] bg-card border border-border transition-all duration-500 group hover:bg-black/[0.02] active:scale-95 shadow-sm"
            >
              <div className="flex items-center gap-5">
                <div className="size-11 rounded-[14px] flex items-center justify-center bg-secondary text-muted-foreground group-hover:text-[#FF3B30] transition-all">
                  <LogOut className="size-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-display font-semibold text-[17px] tracking-tight leading-none mb-1 text-foreground group-hover:text-[#FF3B30] transition-colors">
                    Cerrar Sesión
                  </span>
                  <span className="text-[10px] font-medium uppercase tracking-widest opacity-40 leading-none group-hover:text-[#FF3B30]/60 transition-colors">
                    Finalizar jornada
                  </span>
                </div>
              </div>
              <ChevronRight className="size-4 opacity-10 group-hover:opacity-40 group-hover:translate-x-1 transition-all" />
            </button>
          </div>

          {/* Logout Section (Mobile Only) */}
          <div className="lg:hidden space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 px-6">
              Sesión
            </h3>
            <div className="glass neumorph rounded-[2.5rem] p-2">
              <button
                onClick={logout}
                className="w-full flex items-center justify-between px-6 py-5 rounded-[2rem] transition-all group active:scale-95 text-foreground hover:bg-black/5"
              >
                <div className="flex items-center gap-5">
                  <div className="size-12 rounded-2xl flex items-center justify-center glass neumorph-inner text-muted-foreground group-hover:text-primary transition-all">
                    <LogOut className="size-6" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-display font-black text-lg tracking-tight leading-none mb-1">
                      Cerrar Sesión
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 leading-none">
                      Finalizar jornada
                    </span>
                  </div>
                </div>
                <ChevronRight className="size-5 opacity-5 group-hover:opacity-40 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Danger Zone Items (Mobile Menu Only) */}
          <div className="lg:hidden">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-red-500/40 px-6 mb-4">
              Zona Crítica
            </h3>
            <div className="glass border-red-500/10 bg-red-500/[0.02] rounded-[3rem] p-3">
              {dangerItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleDangerAction(item.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-6 py-5 rounded-[2rem] transition-all group active:scale-95',
                    item.variant === 'danger'
                      ? 'text-[#FF3B30] hover:bg-[#FF3B30]/5'
                      : 'text-foreground hover:bg-black/5'
                  )}
                >
                  <div className="flex items-center gap-5">
                    <div
                      className={cn(
                        'size-12 rounded-2xl flex items-center justify-center',
                        item.variant === 'danger' ? 'bg-[#FF3B30]/10' : 'glass'
                      )}
                    >
                      <item.icon className="size-6" />
                    </div>
                    <span className="font-display font-black text-lg">{item.label}</span>
                  </div>
                  <ChevronRight className="size-5 opacity-40 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Info */}
          <div className="p-10 rounded-[3.5rem] glass neumorph mt-10 hidden lg:block relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 rotate-12 group-hover:scale-125 transition-transform duration-1000">
              <HelpCircle className="size-32" />
            </div>
            <div className="relative z-10">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4">
                Soporte
              </h4>
              <p className="text-lg font-display font-black tracking-tight mb-6">
                ¿Necesitas ayuda técnica?
              </p>
              <Button
                variant="outline"
                className="w-full h-14 rounded-2xl text-[11px] font-black border-primary/20 text-primary hover:bg-primary/5 hover:text-primary gap-3 uppercase tracking-widest transition-all"
              >
                <HelpCircle className="size-5" /> Centro de Ayuda
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          className={cn(
            'lg:col-span-8 transition-all duration-700',
            isDetailOpen ? 'block' : 'hidden lg:block md:pl-8'
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="touch-pan-y md:touch-auto"
            >
              {activeTab === 'perfil' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-primary size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                        Identidad Digital
                      </span>
                    </div>
                    <div className="bg-card border border-border rounded-[40px] p-8 lg:p-12 shadow-sm space-y-12">
                      <div className="flex flex-col sm:flex-row items-center gap-10">
                        <div className="relative group">
                          <div className="size-32 rounded-[40px] bg-secondary flex items-center justify-center text-foreground text-4xl font-display font-semibold overflow-hidden group-hover:scale-105 transition-transform duration-700">
                            <ScanFace className="size-12 opacity-20 text-primary" strokeWidth={1} />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-black/5 cursor-pointer backdrop-blur-sm">
                              <Plus className="size-6 text-primary" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1 text-center sm:text-left">
                          <h4 className="text-[32px] font-display font-semibold text-foreground leading-tight">
                            {formData.name || 'Tu Estudio'}
                          </h4>
                          <p className="text-base font-medium text-muted-foreground opacity-60">
                            Control de marca y presencia digital
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4">
                            <Badge
                              variant="outline"
                              className="rounded-full px-4 py-1.5 border-border text-[11px] font-bold uppercase tracking-widest text-muted-foreground"
                            >
                              ID: {profile.id?.slice(0, 8) || 'STUDIO'}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-full px-4 py-1.5 border-[#34C759]/20 bg-[#34C759]/5 text-[11px] font-bold uppercase tracking-widest text-[#34C759]"
                            >
                              Activo
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-border">
                        <div className="space-y-3">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                            Nombre del Estudio
                          </Label>
                          <div className="relative">
                            <Store className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-primary opacity-30" />
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="premium-input pl-14"
                              placeholder="Ej: Nails By Emme"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                            Propietaria / Artista
                          </Label>
                          <div className="relative">
                            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-primary opacity-30" />
                            <Input
                              value={formData.owner}
                              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                              className="premium-input pl-14"
                              placeholder="Tu nombre completo"
                            />
                          </div>
                        </div>
                        <div className="lg:col-span-2 space-y-3">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                            Ubicación Física
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-primary opacity-30" />
                            <Input
                              value={formData.address || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                              }
                              className="premium-input pl-14"
                              placeholder="Calle, Ciudad o Plaza"
                            />
                          </div>
                        </div>
                        <div className="lg:col-span-2 space-y-3">
                          <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                            Biografía Profesional
                          </Label>
                          <div className="relative">
                            <StickyNote className="absolute left-5 top-6 size-4 text-primary opacity-30" />
                            <Textarea
                              value={formData.description}
                              onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                              }
                              className="min-h-[160px] pl-14 pt-5 pr-6 bg-card border border-border rounded-[32px] font-medium text-[16px] resize-none focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                              placeholder="Describe brevemente tus servicios o filosofía..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8 pt-8 border-t border-border">
                        <div className="space-y-1">
                          <h4 className="text-xl font-display font-semibold text-foreground">
                            Canales de Contacto
                          </h4>
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-40">
                            Comunicación directa con clientas
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                              Teléfono Móvil
                            </Label>
                            <PhoneInput
                              value={formData.phone}
                              onChange={(val) => setFormData({ ...formData, phone: val })}
                              className="h-14"
                            />
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                              Usuario de Instagram
                            </Label>
                            <div className="relative">
                              <Globe className="absolute left-5 top-1/2 -translate-y-1/2 size-4 text-primary opacity-30" />
                              <Input
                                value={formData.instagram}
                                onChange={(e) =>
                                  setFormData({ ...formData, instagram: e.target.value })
                                }
                                className="premium-input pl-14"
                                placeholder="@usuario"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Call to action to save changes contextually */}
                      <div className="pt-8 border-t border-border flex justify-end">
                        <Button
                          onClick={handleSave}
                          className="apple-button h-14 px-10 bg-[#1D1D1F] text-white hover:bg-neutral-800 text-[14px] font-semibold rounded-2xl shadow-xl active:scale-95 transition-all w-full sm:w-auto"
                        >
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'salon' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12 pb-20"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-[#AF52DE] size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#AF52DE] opacity-60">
                        Disponibilidad Temporal
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {days.map((day) => {
                        const hours = formData.workingHours?.[day] || {
                          open: '09:00',
                          close: '18:00',
                          active: true,
                          breakActive: false,
                          breakStart: '13:00',
                          breakEnd: '14:00',
                        };

                        const labelActiveHours = getHoursLabel(
                          hours.open,
                          hours.close,
                          hours.breakActive,
                          hours.breakStart,
                          hours.breakEnd
                        );

                        return (
                          <motion.div
                            key={day}
                            layout="position"
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            className={cn(
                              'relative transition-all duration-300 rounded-[24px] border sm:rounded-[32px] overflow-hidden',
                              hours.active
                                ? 'bg-card p-5 sm:p-6 border-border shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.05)]'
                                : 'bg-secondary/70 p-5 sm:p-6 border-transparent'
                            )}
                          >
                            {/* Floating Toggle Switch in Top-Right (aligned to padding) */}
                            <div className="absolute top-5 right-5 sm:top-6 sm:right-6 z-10">
                              <Switch
                                checked={!!hours.active}
                                onCheckedChange={(val) => updateWorkingHours(day, 'active', val)}
                                className="data-[state=checked]:bg-[#34C759] transition-all active:scale-95 cursor-pointer"
                              />
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="flex items-center gap-4 sm:gap-5 pr-14 lg:pr-0 lg:w-2/5">
                                <div
                                  className={cn(
                                    'size-12 sm:size-14 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0',
                                    hours.active
                                      ? 'bg-[#AF52DE]/10 text-[#AF52DE]'
                                      : 'bg-black/[0.03] text-muted-foreground/50'
                                  )}
                                >
                                  {hours.active ? (
                                    <Clock
                                      className="size-6 animate-pulse"
                                      style={{ animationDuration: '4s' }}
                                    />
                                  ) : (
                                    <Coffee className="size-6 text-muted-foreground/40" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <span className="capitalize font-display font-bold text-lg sm:text-xl text-foreground block leading-none">
                                    {day}
                                  </span>
                                  {hours.active ? (
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 pt-0.5">
                                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#AF52DE]/10 text-[#AF52DE] px-2 py-0.5 rounded-md inline-block w-fit">
                                        Atendiendo
                                      </span>
                                      {labelActiveHours && (
                                        <span className="text-[11px] font-medium text-muted-foreground">
                                          • {labelActiveHours}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs font-semibold text-muted-foreground/60 leading-none block">
                                      Día libre / Cerrado
                                    </span>
                                  )}
                                </div>
                              </div>

                              <AnimatePresence mode="wait">
                                {hours.active ? (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full lg:w-auto flex justify-start lg:justify-end"
                                  >
                                    <div className="grid grid-cols-2 gap-1.5 bg-secondary p-1 rounded-2xl border border-border w-full sm:flex sm:items-center sm:w-auto sm:p-1.5">
                                      <div className="flex items-center justify-between gap-1 pl-2.5 pr-2 py-1 bg-card rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-border min-w-0">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                                          Abre
                                        </span>
                                        <Input
                                          type="time"
                                          value={hours.open}
                                          onChange={(e) =>
                                            updateWorkingHours(day, 'open', e.target.value)
                                          }
                                          className="h-8 w-[72px] sm:w-[76px] bg-transparent border-none text-right font-bold text-xs text-foreground focus:ring-0 p-0 cursor-pointer shrink-0"
                                        />
                                      </div>
                                      <div className="flex items-center justify-between gap-1 pl-2.5 pr-2 py-1 bg-card rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-border min-w-0">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                                          Cierra
                                        </span>
                                        <Input
                                          type="time"
                                          value={hours.close}
                                          onChange={(e) =>
                                            updateWorkingHours(day, 'close', e.target.value)
                                          }
                                          className="h-8 w-[72px] sm:w-[76px] bg-transparent border-none text-right font-bold text-xs text-foreground focus:ring-0 p-0 cursor-pointer shrink-0"
                                        />
                                      </div>
                                    </div>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="w-full lg:w-auto text-muted-foreground/40 text-xs sm:text-sm font-medium lg:text-right hidden sm:block"
                                  >
                                    No se agendan citas este día
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            {/* Sub-section: Daily Break / Pause Option */}
                            <AnimatePresence initial={false}>
                              {hours.active && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="mt-5 pt-5 border-t border-border space-y-4 overflow-hidden"
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          'size-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0',
                                          hours.breakActive
                                            ? 'bg-[#FF9500]/10 text-[#FF9500]'
                                            : 'bg-secondary text-muted-foreground'
                                        )}
                                      >
                                        <Coffee className="size-5" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <span className="text-[14px] font-semibold text-foreground block">
                                          Pausa / Descanso de Comida
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground opacity-60 flex items-center gap-1.5">
                                          {hours.breakActive ? (
                                            <>
                                              <span className="bg-[#FF9500]/10 text-[#FF9500] px-1.5 py-0.5 rounded-md font-extrabold text-[9px]">
                                                Activo
                                              </span>
                                              {getBreakDurationLabel(
                                                hours.breakStart || '13:00',
                                                hours.breakEnd || '14:00'
                                              ) && (
                                                <span>
                                                  •{' '}
                                                  {getBreakDurationLabel(
                                                    hours.breakStart || '13:00',
                                                    hours.breakEnd || '14:00'
                                                  )}{' '}
                                                  de pausa
                                                </span>
                                              )}
                                            </>
                                          ) : (
                                            'Sin pausa activa'
                                          )}
                                        </span>
                                      </div>
                                    </div>

                                    <Switch
                                      checked={!!hours.breakActive}
                                      onCheckedChange={(val) =>
                                        updateWorkingHours(day, 'breakActive', val)
                                      }
                                      className="data-[state=checked]:bg-[#FF9500] cursor-pointer"
                                    />
                                  </div>

                                  <div className="overflow-hidden">
                                    <AnimatePresence initial={false}>
                                      {hours.breakActive && (
                                        <motion.div
                                          initial={{ opacity: 0, y: -10, height: 0 }}
                                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                                          exit={{ opacity: 0, y: -10, height: 0 }}
                                          transition={{ duration: 0.2, ease: 'easeOut' }}
                                        >
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#FF9500]/[0.02] border border-[#FF9500]/10 p-3 rounded-2xl w-full sm:w-fit mt-2">
                                            <div className="flex items-center gap-2 text-[#FF9500] shrink-0 font-bold text-xs px-1">
                                              <Coffee className="size-4" />
                                              <span>Rango de la pausa:</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-1 w-full sm:flex sm:items-center sm:gap-1.5 sm:w-auto">
                                              <div className="flex items-center justify-between gap-1 pl-2 pr-1.5 py-1 bg-card rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-[#FF9500]/10 min-w-0">
                                                <span className="text-[8.5px] font-bold text-[#FF9500] uppercase tracking-wider shrink-0">
                                                  Inicia
                                                </span>
                                                <Input
                                                  type="time"
                                                  value={hours.breakStart || '13:00'}
                                                  onChange={(e) =>
                                                    updateWorkingHours(
                                                      day,
                                                      'breakStart',
                                                      e.target.value
                                                    )
                                                  }
                                                  className="h-8 w-[68px] sm:w-[76px] bg-transparent border-none text-right font-bold text-xs text-foreground focus:ring-0 p-0 cursor-pointer shrink-0"
                                                />
                                              </div>
                                              <div className="flex items-center justify-between gap-1 pl-2 pr-1.5 py-1 bg-card rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] border border-[#FF9500]/10 min-w-0">
                                                <span className="text-[8.5px] font-bold text-[#FF9500] uppercase tracking-wider shrink-0">
                                                  Termina
                                                </span>
                                                <Input
                                                  type="time"
                                                  value={hours.breakEnd || '14:00'}
                                                  onChange={(e) =>
                                                    updateWorkingHours(
                                                      day,
                                                      'breakEnd',
                                                      e.target.value
                                                    )
                                                  }
                                                  className="h-8 w-[68px] sm:w-[76px] bg-transparent border-none text-right font-bold text-xs text-foreground focus:ring-0 p-0 cursor-pointer shrink-0"
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="px-2 flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-display font-semibold text-foreground">
                          Excepciones.
                        </h3>
                        <p className="text-[14px] font-medium text-muted-foreground opacity-60 leading-tight">
                          Días festivos o periodos vacacionales
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setExceptionStep(1);
                          setNewExceptionData({
                            date: new Date().toISOString().split('T')[0],
                            endDate: new Date().toISOString().split('T')[0],
                            type: 'holiday',
                            note: '',
                            open: '09:00',
                            close: '14:00',
                          });
                          setShowAddExceptionForm(true);
                        }}
                        variant="outline"
                        className={cn(
                          'h-12 rounded-2xl px-6 border-border hover:bg-secondary text-[13px] font-semibold gap-2 active:scale-95 transition-all',
                          showAddExceptionForm &&
                            'bg-secondary border-transparent cursor-not-allowed opacity-50'
                        )}
                        disabled={showAddExceptionForm}
                      >
                        <Plus className="size-4" /> Agregar Fecha
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <AnimatePresence mode="popLayout">
                        {showAddExceptionForm && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -15 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                            className="p-6 rounded-[32px] bg-card border-2 border-dashed border-[#AF52DE]/30 bg-[#AF52DE]/[0.01] shadow-md space-y-6 relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-[#AF52DE]/10 flex items-center justify-center text-[#AF52DE]">
                                  <Plus className="size-5" />
                                </div>
                                <div>
                                  <h4 className="font-display font-semibold text-base text-foreground">
                                    Nueva Excepción
                                  </h4>
                                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                    Paso {exceptionStep} de 2
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowAddExceptionForm(false)}
                                className="size-8 rounded-full text-muted-foreground hover:bg-black/5"
                              >
                                <X className="size-4" />
                              </Button>
                            </div>

                            <AnimatePresence mode="wait">
                              {exceptionStep === 1 ? (
                                <motion.div
                                  key="step1"
                                  initial={{ opacity: 0, x: -15 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 15 }}
                                  transition={{ duration: 0.2 }}
                                  className="space-y-4"
                                >
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                                      Motivo o Evento
                                    </Label>
                                    <Input
                                      value={newExceptionData.note}
                                      onChange={(e) =>
                                        setNewExceptionData({
                                          ...newExceptionData,
                                          note: e.target.value,
                                        })
                                      }
                                      className="h-12 bg-secondary border-none rounded-2xl font-semibold text-sm px-4 focus:ring-4 focus:ring-[#AF52DE]/10 placeholder:text-muted-foreground/40 placeholder:font-normal"
                                      placeholder="Ej: Año Nuevo, Cierre Administrativo..."
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                                      Fecha
                                    </Label>
                                    <Input
                                      type="date"
                                      value={newExceptionData.date}
                                      onChange={(e) => {
                                        const newDateVal = e.target.value;
                                        setNewExceptionData({
                                          ...newExceptionData,
                                          date: newDateVal,
                                          endDate: newDateVal,
                                        });
                                      }}
                                      className="h-12 bg-secondary border-none rounded-2xl font-semibold text-sm px-4 focus:ring-4 focus:ring-[#AF52DE]/10"
                                    />
                                  </div>

                                  <div className="flex justify-end pt-2">
                                    <Button
                                      onClick={() => {
                                        if (!newExceptionData.note.trim()) {
                                          toast.error(
                                            'Por favor, ingresa el motivo o nombre de la excepción'
                                          );
                                          return;
                                        }
                                        setExceptionStep(2);
                                      }}
                                      type="button"
                                      className="h-11 rounded-2xl bg-[#AF52DE] hover:bg-[#AF52DE]/90 text-white font-semibold text-xs px-6 gap-2"
                                    >
                                      Siguiente <ChevronRight className="size-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="step2"
                                  initial={{ opacity: 0, x: 15 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -15 }}
                                  transition={{ duration: 0.2 }}
                                  className="space-y-5"
                                >
                                  <div className="space-y-2">
                                    <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                                      Seleccionar Tipo
                                    </Label>

                                    <div className="flex flex-col gap-2">
                                      {/* Holiday Option */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setNewExceptionData({
                                            ...newExceptionData,
                                            type: 'holiday',
                                          })
                                        }
                                        className={cn(
                                          'p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 w-full cursor-pointer active:scale-[0.99]',
                                          newExceptionData.type === 'holiday'
                                            ? 'bg-[#FF3B30] border-transparent text-white shadow-lg shadow-[#FF3B30]/15'
                                            : 'bg-secondary border-transparent text-foreground hover:bg-black/[0.02]'
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            'size-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                                            newExceptionData.type === 'holiday'
                                              ? 'bg-card/20 text-white'
                                              : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                          )}
                                        >
                                          <CalendarOff className="size-5" />
                                        </div>
                                        <div className="text-left">
                                          <div className="font-bold text-xs">No abre (Cerrado)</div>
                                          <div
                                            className={cn(
                                              'text-[10px] mt-0.5 transition-all',
                                              newExceptionData.type === 'holiday'
                                                ? 'text-white/80'
                                                : 'text-muted-foreground'
                                            )}
                                          >
                                            Cerrado todo el día por feriado o descanso
                                          </div>
                                        </div>
                                      </button>

                                      {/* Reduced Option */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setNewExceptionData({
                                            ...newExceptionData,
                                            type: 'reduced',
                                          })
                                        }
                                        className={cn(
                                          'p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 w-full cursor-pointer active:scale-[0.99]',
                                          newExceptionData.type === 'reduced'
                                            ? 'bg-[#FF9500] border-transparent text-white shadow-lg shadow-[#FF9500]/15'
                                            : 'bg-secondary border-transparent text-foreground hover:bg-black/[0.02]'
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            'size-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                                            newExceptionData.type === 'reduced'
                                              ? 'bg-card/20 text-white'
                                              : 'bg-[#FF9500]/10 text-[#FF9500]'
                                          )}
                                        >
                                          <CalendarClock className="size-5" />
                                        </div>
                                        <div className="text-left">
                                          <div className="font-bold text-xs">Medio Día</div>
                                          <div
                                            className={cn(
                                              'text-[10px] mt-0.5 transition-all',
                                              newExceptionData.type === 'reduced'
                                                ? 'text-white/80'
                                                : 'text-muted-foreground'
                                            )}
                                          >
                                            Se abre en un horario predefinido por el salón
                                          </div>
                                        </div>
                                      </button>

                                      {/* Vacation Option */}
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setNewExceptionData({
                                            ...newExceptionData,
                                            type: 'vacation',
                                          })
                                        }
                                        className={cn(
                                          'p-3.5 rounded-2xl border text-left transition-all duration-300 flex items-center gap-4 w-full cursor-pointer active:scale-[0.99]',
                                          newExceptionData.type === 'vacation'
                                            ? 'bg-primary border-transparent text-white shadow-lg shadow-[#0071E3]/15'
                                            : 'bg-secondary border-transparent text-foreground hover:bg-black/[0.02]'
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            'size-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
                                            newExceptionData.type === 'vacation'
                                              ? 'bg-card/20 text-white'
                                              : 'bg-primary/10 text-primary'
                                          )}
                                        >
                                          <CalendarDays className="size-5" />
                                        </div>
                                        <div className="text-left">
                                          <div className="font-bold text-xs">Vacaciones</div>
                                          <div
                                            className={cn(
                                              'text-[10px] mt-0.5 transition-all',
                                              newExceptionData.type === 'vacation'
                                                ? 'text-white/80'
                                                : 'text-muted-foreground'
                                            )}
                                          >
                                            Periodo programado fuera de servicio
                                          </div>
                                        </div>
                                      </button>
                                    </div>
                                  </div>

                                  {/* Clean dynamic sliding disclosures with AnimatePresence */}
                                  <AnimatePresence mode="wait">
                                    {newExceptionData.type === 'vacation' && (
                                      <motion.div
                                        key="vacation-dates animate"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-2 overflow-hidden"
                                      >
                                        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                                          Fecha Término
                                        </Label>
                                        <Input
                                          type="date"
                                          value={newExceptionData.endDate || newExceptionData.date}
                                          min={newExceptionData.date}
                                          onChange={(e) =>
                                            setNewExceptionData({
                                              ...newExceptionData,
                                              endDate: e.target.value,
                                            })
                                          }
                                          className="h-12 bg-secondary border-none rounded-2xl font-semibold text-sm px-4 focus:ring-4 focus:ring-primary/10"
                                        />
                                      </motion.div>
                                    )}

                                    {newExceptionData.type === 'reduced' && (
                                      <motion.div
                                        key="reduced-hours animate"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="p-4 rounded-2xl bg-[#FF9500]/5 border border-[#FF9500]/10 space-y-4 overflow-hidden"
                                      >
                                        <div className="flex items-center gap-2 text-[#FF9500] font-semibold text-xs px-1">
                                          <Clock className="size-4" />
                                          <span>Horario de atención:</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                                              Apertura
                                            </Label>
                                            <Input
                                              type="time"
                                              value={newExceptionData.open}
                                              onChange={(e) =>
                                                setNewExceptionData({
                                                  ...newExceptionData,
                                                  open: e.target.value,
                                                })
                                              }
                                              className="h-10 w-full bg-card border border-border rounded-xl text-center font-semibold text-xs text-foreground focus:ring-4 focus:ring-[#FF9500]/10 p-0"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                                              Cierre
                                            </Label>
                                            <Input
                                              type="time"
                                              value={newExceptionData.close}
                                              onChange={(e) =>
                                                setNewExceptionData({
                                                  ...newExceptionData,
                                                  close: e.target.value,
                                                })
                                              }
                                              className="h-10 w-full bg-card border border-border rounded-xl text-center font-semibold text-xs text-foreground focus:ring-4 focus:ring-[#FF9500]/10 p-0"
                                            />
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>

                                  <div className="flex items-center justify-between pt-4 border-t border-border w-full">
                                    <Button
                                      variant="ghost"
                                      onClick={() => setExceptionStep(1)}
                                      type="button"
                                      className="h-11 rounded-2xl font-semibold text-xs text-muted-foreground hover:bg-black/5 gap-1.5"
                                    >
                                      <ChevronLeft className="size-4" /> Volver
                                    </Button>

                                    <Button
                                      onClick={confirmAddSpecialDate}
                                      type="button"
                                      className="h-11 rounded-2xl bg-black hover:bg-black/80 text-white font-semibold text-xs px-6 gap-2"
                                    >
                                      Guardar <Check className="size-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {(formData.salonConfig?.specialDates || []).map((date) => (
                        <motion.div
                          key={date.id}
                          layout
                          className="p-6 rounded-[32px] bg-card border border-border shadow-sm space-y-5 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 mr-2">
                              <div
                                className={cn(
                                  'size-12 rounded-2xl flex items-center justify-center transition-all shrink-0',
                                  date.type === 'holiday'
                                    ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                                    : date.type === 'vacation'
                                      ? 'bg-primary/10 text-primary'
                                      : 'bg-[#FF9500]/10 text-[#FF9500]'
                                )}
                              >
                                {date.type === 'holiday' ? (
                                  <CalendarOff className="size-6" />
                                ) : date.type === 'vacation' ? (
                                  <CalendarDays className="size-6" />
                                ) : (
                                  <CalendarClock className="size-6" />
                                )}
                              </div>
                              <Input
                                value={date.note}
                                onChange={(e) => updateSpecialDate(date.id, 'note', e.target.value)}
                                className="text-xl font-display font-semibold tracking-tight border-none bg-transparent h-auto p-0 focus:ring-0 placeholder:text-muted-foreground/20 w-full"
                                placeholder="Motivo (ej: Navidad)"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSpecialDate(date.id)}
                              className="size-10 rounded-full text-muted-foreground opacity-20 hover:text-[#FF3B30] hover:bg-[#FF3B30]/5 hover:opacity-100 transition-all shrink-0"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                                {date.type === 'vacation' ? 'Fecha Inicio' : 'Fecha'}
                              </Label>
                              <Input
                                type="date"
                                value={date.date}
                                onChange={(e) => updateSpecialDate(date.id, 'date', e.target.value)}
                                className="h-12 bg-secondary border-none rounded-2xl font-semibold text-sm px-4 focus:ring-4 focus:ring-black/[0.02]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                                Tipo
                              </Label>
                              <Select
                                value={date.type || 'holiday'}
                                onValueChange={(val) => {
                                  updateSpecialDate(date.id, 'type', val);
                                  if (val === 'vacation' && !date.endDate) {
                                    updateSpecialDate(date.id, 'endDate', date.date);
                                  }
                                }}
                              >
                                <SelectTrigger className="h-12 bg-secondary border-none rounded-2xl font-semibold text-sm px-4">
                                  <SelectValue>
                                    {date.type === 'holiday'
                                      ? 'No abre'
                                      : date.type === 'reduced'
                                        ? 'Medio Día'
                                        : 'Vacaciones'}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border border-border bg-card opacity-100 shadow-2xl z-50 font-display text-sm text-foreground">
                                  <SelectItem value="holiday">No abre</SelectItem>
                                  <SelectItem value="reduced">Medio Día</SelectItem>
                                  <SelectItem value="vacation">Vacaciones</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Additional dynamic fields placed cleanly at full card width */}
                          <AnimatePresence mode="wait">
                            {date.type === 'vacation' && (
                              <motion.div
                                key={`vacation-${date.id}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2 overflow-hidden"
                              >
                                <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-4">
                                  Fecha Término
                                </Label>
                                <Input
                                  type="date"
                                  value={date.endDate || date.date}
                                  onChange={(e) =>
                                    updateSpecialDate(date.id, 'endDate', e.target.value)
                                  }
                                  className="h-12 bg-secondary border-none rounded-2xl font-semibold text-sm px-4 focus:ring-4 focus:ring-black/[0.02]"
                                />
                              </motion.div>
                            )}

                            {date.type === 'reduced' && (
                              <motion.div
                                key={`reduced-${date.id}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 rounded-2xl bg-secondary/80 border border-border space-y-3 overflow-hidden"
                              >
                                <div className="flex items-center gap-2 text-[#515154] font-medium text-xs px-1">
                                  <Clock className="size-4 text-[#FF9500]" />
                                  <span>Horario de atención:</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-3">
                                      Apertura
                                    </Label>
                                    <Input
                                      type="time"
                                      value={date.open || '09:00'}
                                      onChange={(e) =>
                                        updateSpecialDate(date.id, 'open', e.target.value)
                                      }
                                      className="h-10 w-full bg-card border border-border rounded-xl text-center font-semibold text-xs tracking-tight text-foreground focus:ring-4 focus:ring-[#FF9500]/5 p-0"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-3">
                                      Cierre
                                    </Label>
                                    <Input
                                      type="time"
                                      value={date.close || '14:00'}
                                      onChange={(e) =>
                                        updateSpecialDate(date.id, 'close', e.target.value)
                                      }
                                      className="h-10 w-full bg-card border border-border rounded-xl text-center font-semibold text-xs tracking-tight text-foreground focus:ring-4 focus:ring-[#FF9500]/5 p-0"
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1D1D1F] p-8 sm:p-10 lg:p-12 rounded-[32px] sm:rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/15 transition-all duration-700" />

                    <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8 sm:gap-10">
                      <div className="space-y-4 max-w-lg">
                        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-card/10 border border-white/5 shadow-inner">
                          <Zap className="size-3.5 text-[#4AD3FF]" />
                          <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/90">
                            Duración de Bloques
                          </span>
                        </div>
                        <h4 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight leading-tight text-white">
                          Frecuencia de la Agenda.
                        </h4>
                        <p className="text-zinc-300 text-sm sm:text-base font-medium leading-relaxed">
                          Define el tamaño de cada "casilla" de tiempo en tu calendario de reservas.
                          Al segmentar tu jornada, los clientes verán horarios disponibles con la
                          frecuencia seleccionada.
                        </p>

                        {/* Live scheduler preview for maximum UX clarity */}
                        <div className="pt-2">
                          <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider block mb-2.5">
                            Vista previa en tu agenda:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {Array.from({ length: 4 }).map((_, idx) => {
                              const interval = formData.slotInterval || 30;
                              const startTotalMins = 540 + idx * interval; // Starts at 9:00 AM
                              const hrs = Math.floor(startTotalMins / 60);
                              const mins = startTotalMins % 60;
                              const timeStr = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  if (settingsLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
        <Loader2 className="size-8 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  return (
                                <span
                                  key={idx}
                                  className="text-[11px] font-mono font-bold bg-card/10 text-white/95 px-2.5 py-1 rounded-lg border border-white/10"
                                >
                                  {timeStr}
                                </span>
                              );
                            })}
                            <span className="text-[11px] text-white/40 self-center pl-1 font-semibold">
                              ...
                            </span>
                          </div>
                          <p className="text-[11px] text-[#4AD3FF] font-bold mt-2.5">
                            ✓ Los clientes podrán agendar turnos cada {formData.slotInterval || 30}{' '}
                            minutos libremente.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 min-w-[240px] w-full xl:w-auto shrink-0">
                        <span className="text-center xl:text-left text-[11px] font-bold uppercase tracking-widest text-white/40 block">
                          Seleccionar Intervalo
                        </span>
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-2 gap-3">
                          {[15, 30, 45, 60].map((min) => {
                            const isSelected = (formData.slotInterval || 30) === min;
                            return (
                              <button
                                key={min}
                                type="button"
                                onClick={() => setFormData({ ...formData, slotInterval: min })}
                                className={cn(
                                  'h-20 rounded-[22px] flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden cursor-pointer',
                                  isSelected
                                    ? 'bg-primary text-white shadow-lg shadow-[#0071E3]/30 scale-105 ring-2 ring-white/10'
                                    : 'bg-card/5 border border-white/5 text-white/70 hover:bg-card/10 hover:text-white'
                                )}
                              >
                                {isSelected && (
                                  <div className="absolute top-2 right-2 size-1.5 rounded-full bg-card" />
                                )}
                                <span className="font-display font-extrabold text-2xl leading-none">
                                  {min}m
                                </span>
                                <span
                                  className={cn(
                                    'text-[9px] font-bold uppercase tracking-widest mt-1',
                                    isSelected ? 'text-white/85' : 'text-white/40'
                                  )}
                                >
                                  {min === 15
                                    ? 'Rápido'
                                    : min === 30
                                      ? 'Recomendado'
                                      : min === 45
                                        ? 'Estándar'
                                        : 'Extendido'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'promociones' && (
                <div className="space-y-6">
                  <AnimatePresence mode="wait">
                    {isAddingPromotion ? (
                      <motion.div
                        key="creation-flow"
                        initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-card rounded-3xl lg:rounded-[3rem] border border-border shadow-2xl overflow-hidden"
                      >
                        <div className="p-6 md:p-16 space-y-8 md:space-y-12 max-w-2xl mx-auto">
                          <div className="flex flex-col items-center text-center space-y-4 md:space-y-6">
                            <div className="size-16 lg:size-20 rounded-2xl lg:rounded-[2.5rem] bg-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                              <Plus className="size-8 lg:size-10" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1 md:space-y-2">
                              <h3 className="text-2xl md:text-4xl font-black tracking-tight">
                                Nuevo Descuento Temporal
                              </h3>
                              <p className="text-sm md:text-muted-foreground font-medium opacity-60">
                                Configura un descuento por tiempo limitado para un servicio.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-8 lg:space-y-10">
                            <div className="space-y-4 lg:space-y-6">
                              <div className="space-y-2 md:space-y-3">
                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">
                                  Nombre de la Promoción
                                </Label>
                                <Input
                                  value={newPromoData.title}
                                  onChange={(e) =>
                                    setNewPromoData({ ...newPromoData, title: e.target.value })
                                  }
                                  placeholder="Ej: Descuento de Primavera"
                                  className="h-14 lg:h-16 rounded-2xl bg-neutral-50 border-none text-lg lg:text-xl font-bold px-5 lg:px-6 focus-visible:ring-2 focus-visible:ring-blue-600/20 transition-all shadow-inner"
                                />
                              </div>

                              <div className="space-y-2 md:space-y-3">
                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">
                                  Servicio Seleccionado
                                </Label>
                                <Select
                                  value={newPromoData.serviceId || ''}
                                  onValueChange={(val) =>
                                    setNewPromoData({ ...newPromoData, serviceId: val })
                                  }
                                >
                                  <SelectTrigger className="h-14 lg:h-16 rounded-2xl bg-neutral-50 border-none font-bold text-foreground px-5 lg:px-6 shadow-inner focus:ring-0">
                                    <SelectValue placeholder="Selecciona un servicio" />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl border border-border bg-card text-foreground shadow-2xl z-50">
                                    {services.map((s) => (
                                      <SelectItem key={s.id} value={s.id}>
                                        {s.name} (${s.price})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                                <div className="space-y-2 md:space-y-3">
                                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">
                                    Fecha Inicio
                                  </Label>
                                  <Input
                                    type="date"
                                    value={newPromoData.startDate}
                                    onChange={(e) =>
                                      setNewPromoData({
                                        ...newPromoData,
                                        startDate: e.target.value,
                                      })
                                    }
                                    className="h-14 lg:h-16 rounded-2xl bg-neutral-50 border-none font-bold text-lg px-5 lg:px-6 focus-visible:ring-2 focus-visible:ring-blue-600/20 transition-all shadow-inner"
                                  />
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                  <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">
                                    Fecha Fin
                                  </Label>
                                  <Input
                                    type="date"
                                    value={newPromoData.endDate}
                                    onChange={(e) =>
                                      setNewPromoData({ ...newPromoData, endDate: e.target.value })
                                    }
                                    className="h-14 lg:h-16 rounded-2xl bg-neutral-50 border-none font-bold text-lg px-5 lg:px-6 focus-visible:ring-2 focus-visible:ring-blue-600/20 transition-all shadow-inner"
                                  />
                                </div>
                              </div>

                              <div className="space-y-2 md:space-y-3">
                                <Label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-1">
                                  Valor del Descuento
                                </Label>
                                <div className="flex h-14 lg:h-16 bg-neutral-50 rounded-2xl shadow-inner overflow-hidden">
                                  <Input
                                    type="number"
                                    value={newPromoData.discountValue}
                                    onChange={(e) =>
                                      setNewPromoData({
                                        ...newPromoData,
                                        discountValue: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="h-full flex-1 border-none bg-transparent font-black text-xl lg:text-2xl text-center focus-visible:ring-0"
                                  />
                                  <div className="p-1 lg:p-1.5 flex gap-1">
                                    {[
                                      { id: 'percentage', label: '%' },
                                      { id: 'fixed', label: '$' },
                                    ].map((type) => (
                                      <button
                                        key={type.id}
                                        type="button"
                                        onClick={() =>
                                          setNewPromoData({
                                            ...newPromoData,
                                            discountType: type.id as 'percentage' | 'fixed',
                                          })
                                        }
                                        className={cn(
                                          'h-full px-3 lg:px-4 rounded-xl font-black text-xs lg:text-sm transition-all duration-300',
                                          newPromoData.discountType === type.id
                                            ? 'bg-card text-blue-600 shadow-lg'
                                            : 'text-muted-foreground/20'
                                        )}
                                      >
                                        {type.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 lg:gap-4 pt-2 md:pt-4">
                              <Button
                                variant="ghost"
                                onClick={() => setIsAddingPromotion(false)}
                                className="h-12 lg:h-14 flex-1 rounded-2xl font-black text-[10px] lg:text-[11px] uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-muted-foreground hover:bg-neutral-100 transition-all"
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={confirmAddPromotion}
                                className="h-12 lg:h-14 flex-[2] rounded-2xl bg-blue-600 text-white font-black text-[10px] lg:text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95 transition-all"
                              >
                                Confirmar y Publicar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="promotions-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-card rounded-3xl lg:rounded-[2.5rem] border border-border shadow-sm overflow-hidden"
                      >
                        <div className="p-6 lg:p-10 border-b border-border bg-neutral-50/30">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
                            <div className="flex items-center gap-4 lg:gap-5">
                              <div className="size-12 lg:size-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                <Ticket className="size-6 lg:size-7" strokeWidth={1.5} />
                              </div>
                              <div>
                                <h3 className="text-xl lg:text-2xl font-bold tracking-tight">
                                  Descuentos Temporales
                                </h3>
                                <p className="text-xs lg:text-sm text-muted-foreground font-medium opacity-70">
                                  Gestiona rebajas automáticas en servicios por rango de fechas.
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={addPromotion}
                              className="h-10 lg:h-11 px-6 lg:px-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all font-bold text-[10px] uppercase tracking-[0.2em] gap-2 shadow-lg shadow-blue-600/20 border-none active:scale-95"
                            >
                              <Plus className="size-3.5" strokeWidth={3} /> Nuevo Descuento
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 lg:p-10">
                          <div className="space-y-4 lg:space-y-8">
                            <AnimatePresence mode="popLayout" initial={false}>
                              {(formData.promotions || []).map((promo) => (
                                <motion.div
                                  key={promo.id}
                                  layout
                                  initial={{ opacity: 0, y: 30 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="group bg-card rounded-3xl lg:rounded-[2.5rem] border border-border shadow-2xl shadow-black/[0.02] hover:shadow-blue-600/[0.05] transition-all overflow-hidden"
                                >
                                  <div className="p-5 lg:p-10">
                                    <div className="flex flex-col gap-6 lg:gap-10">
                                      {/* Title and Global Actions */}
                                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-6">
                                        <div className="flex items-center gap-4 lg:gap-5 flex-1 min-w-0">
                                          <div
                                            className={cn(
                                              'size-12 lg:size-16 rounded-2xl flex items-center justify-center transition-all shadow-inner shrink-0 group-hover:scale-105 duration-500',
                                              promo.isActive
                                                ? 'bg-blue-600 text-white shadow-blue-900/10'
                                                : 'bg-neutral-100 text-muted-foreground/30'
                                            )}
                                          >
                                            <Tag className="size-6 lg:size-8" strokeWidth={1.2} />
                                          </div>
                                          <div className="flex-1 min-w-0 space-y-1">
                                            <Input
                                              value={promo.title}
                                              onChange={(e) =>
                                                updatePromotion(promo.id, 'title', e.target.value)
                                              }
                                              className="text-xl lg:text-3xl font-black border-none bg-transparent h-auto p-0 focus-visible:ring-0 w-full placeholder:opacity-10 transition-all font-display text-foreground"
                                              placeholder="Nombre del descuento"
                                            />
                                            <div className="flex items-center gap-2 lg:gap-3">
                                              <div
                                                className={cn(
                                                  'size-1.5 rounded-full',
                                                  promo.isActive
                                                    ? 'bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                                    : 'bg-neutral-300'
                                                )}
                                              />
                                              <span className="text-[9px] lg:text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.25em]">
                                                {promo.isActive ? 'Activo y visible' : 'Pausado'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-3 lg:gap-4 justify-between md:justify-end bg-neutral-50 p-1.5 lg:p-2 pr-4 lg:pr-5 rounded-xl lg:rounded-2xl border border-border">
                                          <div className="flex items-center gap-3 lg:gap-4">
                                            <Switch
                                              checked={!!promo.isActive}
                                              onCheckedChange={(val) =>
                                                updatePromotion(promo.id, 'isActive', val)
                                              }
                                              className="data-[state=checked]:bg-blue-600 scale-90 lg:scale-100"
                                            />
                                            <span className="text-[9px] lg:text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
                                              {promo.isActive ? 'On' : 'Off'}
                                            </span>
                                          </div>
                                          <div className="h-5 lg:h-6 w-px bg-black/5 hidden md:block" />
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removePromotion(promo.id)}
                                            className="size-9 lg:size-10 rounded-full text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-all opacity-100 md:opacity-0 group-hover:opacity-100"
                                          >
                                            <Trash2 className="size-4 lg:size-5" />
                                          </Button>
                                        </div>
                                      </div>

                                      {/* Config Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 lg:pt-8 border-t border-border">
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <Label className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 ml-1">
                                              Servicio Aplicado
                                            </Label>
                                            <Select
                                              value={promo.serviceId || ''}
                                              onValueChange={(val) =>
                                                updatePromotion(promo.id, 'serviceId', val)
                                              }
                                            >
                                              <SelectTrigger className="h-12 bg-neutral-50 border border-border rounded-xl font-bold text-foreground px-4">
                                                <SelectValue placeholder="Selecciona el servicio" />
                                              </SelectTrigger>
                                              <SelectContent className="rounded-2xl border border-border bg-card text-foreground shadow-2xl z-50">
                                                {services.map((s) => (
                                                  <SelectItem key={s.id} value={s.id}>
                                                    {s.name} (${s.price})
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 ml-1">
                                                Fecha de Inicio
                                              </Label>
                                              <Input
                                                type="date"
                                                value={promo.startDate}
                                                onChange={(e) =>
                                                  updatePromotion(
                                                    promo.id,
                                                    'startDate',
                                                    e.target.value
                                                  )
                                                }
                                                className="h-10 bg-neutral-50 border border-border rounded-xl text-xs font-bold text-foreground"
                                              />
                                            </div>
                                            <div className="space-y-1.5">
                                              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 ml-1">
                                                Fecha de Fin
                                              </Label>
                                              <Input
                                                type="date"
                                                value={promo.endDate}
                                                onChange={(e) =>
                                                  updatePromotion(
                                                    promo.id,
                                                    'endDate',
                                                    e.target.value
                                                  )
                                                }
                                                className="h-10 bg-neutral-50 border border-border rounded-xl text-xs font-bold text-foreground"
                                              />
                                            </div>
                                          </div>
                                        </div>

                                        <div className="space-y-4 flex flex-col justify-between">
                                          <div className="space-y-2">
                                            <Label className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 ml-1">
                                              Valor del Descuento
                                            </Label>
                                            <div className="flex h-12 bg-neutral-50 rounded-xl border border-border shadow-inner overflow-hidden">
                                              <Input
                                                type="number"
                                                value={promo.discountValue}
                                                onChange={(e) =>
                                                  updatePromotion(
                                                    promo.id,
                                                    'discountValue',
                                                    parseInt(e.target.value) || 0
                                                  )
                                                }
                                                className="h-full flex-1 border-none bg-transparent font-black text-center focus-visible:ring-0 p-0 text-xl text-foreground"
                                              />
                                              <div className="p-1 flex gap-1 bg-neutral-100/50">
                                                {[
                                                  { id: 'percentage', label: '%' },
                                                  { id: 'fixed', label: '$' },
                                                ].map((type) => (
                                                  <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() =>
                                                      updatePromotion(
                                                        promo.id,
                                                        'discountType',
                                                        type.id as 'percentage' | 'fixed'
                                                      )
                                                    }
                                                    className={cn(
                                                      'h-full px-3 rounded-lg font-black text-xs transition-all duration-300',
                                                      promo.discountType === type.id
                                                        ? 'bg-card text-blue-600 shadow-sm'
                                                        : 'text-muted-foreground/30 hover:text-muted-foreground'
                                                    )}
                                                  >
                                                    {type.label}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          </div>

                                          {/* Mini summary sentence */}
                                          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-500/10 text-[11px] text-primary font-bold">
                                            ✓ Descuento de {promo.discountValue}
                                            {promo.discountType === 'percentage'
                                              ? '%'
                                              : '$'} en{' '}
                                            {services.find((s) => s.id === promo.serviceId)?.name ||
                                              'el servicio'}{' '}
                                            desde el{' '}
                                            {new Date(
                                              promo.startDate + 'T00:00:00'
                                            ).toLocaleDateString('es-ES', {
                                              day: 'numeric',
                                              month: 'short',
                                            })}{' '}
                                            al{' '}
                                            {new Date(
                                              promo.endDate + 'T00:00:00'
                                            ).toLocaleDateString('es-ES', {
                                              day: 'numeric',
                                              month: 'short',
                                            })}
                                            .
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </AnimatePresence>

                            {(formData.promotions || []).length === 0 && (
                              <div className="text-center py-16 lg:py-24 px-5 bg-neutral-50 rounded-[2.5rem] lg:rounded-[3.5rem] border border-border relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-600/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="flex flex-col items-center max-w-sm mx-auto space-y-6 lg:space-y-10 relative z-10">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-blue-600/20 blur-3xl animate-pulse" />
                                    <div className="size-20 lg:size-24 rounded-[2rem] lg:rounded-[3rem] bg-card flex items-center justify-center shadow-2xl shadow-black/10 border border-border transition-transform group-hover:scale-110 duration-700 relative z-10">
                                      <Ticket
                                        className="size-10 lg:size-12 text-blue-600"
                                        strokeWidth={0.8}
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2 lg:space-y-3">
                                    <h4 className="text-xl lg:text-2xl font-black tracking-tight">
                                      Atrae Más Reservas
                                    </h4>
                                    <p className="text-sm lg:text-[15px] text-muted-foreground font-medium leading-relaxed opacity-60">
                                      Los descuentos temporales motivan a tus clientes a agendar
                                      antes de que expire la oferta. ¡Crea el primero ahora!
                                    </p>
                                  </div>
                                  <Button
                                    onClick={addPromotion}
                                    className="h-12 lg:h-14 px-8 lg:px-12 rounded-full bg-blue-600 text-white font-black text-[10px] lg:text-[12px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-95 transition-all"
                                  >
                                    Crear primer descuento
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {activeTab === 'notificaciones' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-[#FF2D55] size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF2D55] opacity-60">
                        Gestión de Alertas
                      </span>
                    </div>

                    <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-sm">
                      {[
                        {
                          id: 'confirm',
                          title: 'Confirmaciones',
                          desc: 'Citas confirmadas por las clientas',
                          icon: ShieldCheck,
                          color: '#34C759',
                        },
                        {
                          id: 'reminders',
                          title: 'Recordatorios 24h',
                          desc: 'Alertas automáticas preventivas',
                          icon: Clock,
                          color: '#0071E3',
                        },
                        {
                          id: 'cancel',
                          title: 'Cancelaciones',
                          desc: 'Turnos cancelados o liberados',
                          icon: UserX,
                          color: '#FF3B30',
                        },
                        {
                          id: 'reschedule',
                          title: 'Reprogramaciones',
                          desc: 'Cambios de fecha y hora',
                          icon: RefreshCw,
                          color: '#AF52DE',
                        },
                      ].map((item, index, arr) => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center justify-between p-6 transition-all hover:bg-secondary/50',
                            index !== arr.length - 1 && 'border-b border-border'
                          )}
                        >
                          <div className="flex items-center gap-6">
                            <div
                              className="size-14 rounded-2xl flex items-center justify-center bg-card shadow-sm border border-border"
                              style={{ color: item.color }}
                            >
                              <item.icon className="size-6" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                              <p className="font-display font-semibold text-lg text-foreground leading-tight">
                                {item.title}
                              </p>
                              <p className="text-sm font-medium text-muted-foreground opacity-60">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <Switch
                            defaultChecked={true}
                            className="data-[state=checked]:bg-[#34C759]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-[#5856D6] size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#5856D6] opacity-60">
                        Inteligencia Artificial
                      </span>
                    </div>

                    <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-sm">
                      {[
                        {
                          id: 'trends',
                          title: 'Análisis de Tendencias',
                          desc: 'Reportes semanales de actividad comercial',
                          icon: TrendingUp,
                          color: '#5856D6',
                        },
                        {
                          id: 'daily',
                          title: 'Resumen Matutino',
                          desc: 'Tu agenda diaria a las 8:00 AM',
                          icon: Layout,
                          color: '#0071E3',
                        },
                      ].map((item, index, arr) => (
                        <div
                          key={item.id}
                          className={cn(
                            'flex items-center justify-between p-6 transition-all hover:bg-secondary/50',
                            index !== arr.length - 1 && 'border-b border-border'
                          )}
                        >
                          <div className="flex items-center gap-6">
                            <div
                              className="size-14 rounded-2xl flex items-center justify-center bg-card shadow-sm border border-border"
                              style={{ color: item.color }}
                            >
                              <item.icon className="size-6" strokeWidth={1.5} />
                            </div>
                            <div className="space-y-1">
                              <p className="font-display font-semibold text-lg text-foreground leading-tight">
                                {item.title}
                              </p>
                              <p className="text-sm font-medium text-muted-foreground opacity-60">
                                {item.desc}
                              </p>
                            </div>
                          </div>
                          <Switch
                            defaultChecked={item.id === 'daily'}
                            className="data-[state=checked]:bg-[#34C759]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-10 rounded-[40px] bg-secondary flex flex-col items-center text-center space-y-4">
                    <div className="size-12 rounded-full bg-card flex items-center justify-center text-muted-foreground">
                      <Info className="size-6" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground max-w-xs">
                      Las notificaciones push requieren permisos del navegador. Asegúrate de
                      tenerlos habilitados.
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => toast.info('Enviando notificación de prueba...')}
                      className="text-primary font-semibold text-[13px] hover:bg-primary/5 rounded-xl px-6"
                    >
                      Probar notificación
                    </Button>
                  </div>
                </motion.div>
              )}
              {activeTab === 'bot' && (
                <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                  <div className="glass neumorph rounded-[2.5rem] lg:rounded-[4.5rem] overflow-hidden border-none shadow-2xl transition-all duration-1000">
                    <div className="bg-[#128C7E] px-8 lg:px-20 py-12 lg:py-24 flex flex-col md:flex-row md:items-center justify-between gap-10 lg:gap-12 relative overflow-hidden">
                      <motion.div
                        animate={{
                          rotate: [0, 10, 0],
                          scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-0 right-0 p-8 lg:p-12 opacity-10 pointer-events-none"
                      >
                        <MessageSquare className="size-64 lg:size-[24rem] text-white" />
                      </motion.div>

                      <div className="relative z-10 space-y-6 lg:space-y-8">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card/20 backdrop-blur-xl text-white">
                          <div className="size-1.5 md:size-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] leading-none">
                            Smart AI Core Active
                          </span>
                        </div>
                        <div className="space-y-4 lg:space-y-6">
                          <h3 className="text-3xl lg:text-8xl font-display font-black tracking-tighter text-white leading-[0.9] italic">
                            WhatsApp Bot.
                          </h3>
                          <p className="text-white/60 text-base lg:text-2xl font-medium max-w-lg leading-snug">
                            Tu estudio nunca cierra. Nuestra IA responde, agenda y confirma citas
                            como si fueras tú.
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <Switch
                          checked={!!formData.whatsappBot?.enabled}
                          onCheckedChange={(val) => updateWhatsappBot('enabled', val)}
                          className="scale-150 lg:scale-[2] data-[state=checked]:bg-card data-[state=checked]:[&>span]:bg-[#128C7E]"
                        />
                      </div>
                    </div>

                    <div className="p-6 lg:p-20 space-y-12 lg:space-y-20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                        <div className="space-y-6 lg:space-y-8">
                          <Label className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 flex items-center gap-3 lg:gap-4 ml-4 italic">
                            <BotMessageSquare className="size-4 lg:size-5 text-primary" /> Modo de
                            Respuesta
                          </Label>
                          <div className="flex flex-col gap-2 lg:gap-3 p-2 lg:p-3 glass neumorph-inner rounded-[2rem] lg:rounded-[3rem]">
                            {[
                              {
                                id: 'inside',
                                label: 'Horario Laboral',
                                desc: 'Solo durante el servicio',
                              },
                              {
                                id: 'outside',
                                label: 'Fuera de Horario',
                                desc: 'Cuando estés descansando',
                              },
                              {
                                id: 'always',
                                label: 'Responder Siempre',
                                desc: 'Control total 24/7',
                              },
                            ].map((mode) => (
                              <button
                                key={mode.id}
                                onClick={() => updateWhatsappBot('responseMode', mode.id)}
                                className={cn(
                                  'flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] transition-all active:scale-95 text-left group',
                                  (formData.whatsappBot?.responseMode || 'always') === mode.id
                                    ? 'bg-primary text-white shadow-2xl shadow-primary/20'
                                    : 'hover:bg-neutral-50 text-muted-foreground'
                                )}
                              >
                                <div className="flex flex-col">
                                  <span className="font-display font-black text-base lg:text-lg tracking-tight leading-none mb-1">
                                    {mode.label}
                                  </span>
                                  <span
                                    className={cn(
                                      'text-[8px] lg:text-[10px] uppercase font-bold tracking-widest leading-none',
                                      mode.id === formData.whatsappBot?.responseMode
                                        ? 'text-white/40'
                                        : 'opacity-30'
                                    )}
                                  >
                                    {mode.desc}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    'size-1.5 lg:size-2 rounded-full',
                                    mode.id === formData.whatsappBot?.responseMode
                                      ? 'bg-card'
                                      : 'bg-black/5'
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-8 lg:space-y-12">
                          <div className="p-6 lg:p-10 rounded-3xl lg:rounded-[3.5rem] glass neumorph flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-10 h-full">
                            <div className="space-y-1 text-center md:text-left">
                              <span className="font-display font-black text-lg lg:text-2xl tracking-tight">
                                Notificaciones Push
                              </span>
                              <p className="text-xs lg:text-muted-foreground font-medium opacity-40 leading-tight">
                                Alerta inmediata ante cada nueva reserva.
                              </p>
                            </div>
                            <Switch
                              className="scale-110 lg:scale-125 data-[state=checked]:bg-primary"
                              defaultChecked
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'apariencia' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-primary size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                        Estilo Visual
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { id: 'light', name: 'Claro', icon: Sun },
                        { id: 'dark', name: 'Oscuro', icon: Moon },
                        { id: 'system', name: 'Sistema', icon: Monitor },
                      ].map((t) => (
                        <button
                          type="button"
                          key={t.id}
                          className={cn(
                            'relative overflow-hidden cursor-pointer group material-thin rounded-[32px] p-8 border transition-all duration-300 w-full text-left',
                            theme === t.id
                              ? 'border-primary shadow-lg shadow-primary/10'
                              : 'border-border dark:border-white/[0.04] hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5'
                          )}
                          onClick={() => setTheme(t.id)}
                        >
                          <div
                            className={cn(
                              'absolute inset-0 opacity-0 transition-opacity duration-300',
                              theme === t.id ? 'opacity-10 dark:opacity-20' : ''
                            )}
                          />

                          <div className="relative z-10 flex flex-col items-center gap-6">
                            <div
                              className={cn(
                                'size-16 rounded-[20px] flex items-center justify-center transition-transform duration-300 group-hover:scale-110',
                                theme === t.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-black/5 dark:bg-card/5 text-foreground/50'
                              )}
                            >
                              <t.icon className="size-8 stroke-[1.5]" />
                            </div>

                            <div className="text-center space-y-1">
                              <h3 className="font-display text-xl font-semibold tracking-tight">
                                {t.name}
                              </h3>
                              <p className="text-sm text-foreground/50 font-medium">
                                {t.id === 'system'
                                  ? 'Se adapta al dispositivo'
                                  : `Forzar modo ${t.name.toLowerCase()}`}
                              </p>
                            </div>

                            <div
                              className={cn(
                                'size-6 rounded-full border-2 flex items-center justify-center mt-2 transition-colors',
                                theme === t.id
                                  ? 'border-primary bg-primary'
                                  : 'border-border dark:border-white/10'
                              )}
                            >
                              {theme === t.id && (
                                <Check className="size-3.5 text-primary-foreground stroke-[3]" />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-primary size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                        Personalización
                      </span>
                    </div>

                    <div className="material-regular rounded-[32px] p-8 space-y-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <h4 className="font-display font-semibold text-xl tracking-tight">
                            Transiciones Suaves
                          </h4>
                          <p className="text-sm text-foreground/50 leading-relaxed max-w-md">
                            Experimenta animaciones fluidas al cambiar entre modos de vista.
                          </p>
                        </div>
                        <Switch defaultChecked className="scale-125" />
                      </div>

                      <hr className="border-border dark:border-white/5" />

                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <h4 className="font-display font-semibold text-xl tracking-tight">
                            Efecto Blur de Cristal
                          </h4>
                          <p className="text-sm text-foreground/50 leading-relaxed max-w-md">
                            Activa el diseño glassmorphism avanzado con capas translúcidas (consumo
                            extra de batería).
                          </p>
                        </div>
                        <Switch defaultChecked className="scale-125" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'idioma' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-primary size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                        Selección de Lenguaje
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { id: 'es', label: 'Español', flag: '🇪🇸', sub: 'Native layout' },
                        { id: 'en', label: 'English', flag: '🇺🇸', sub: 'International' },
                      ].map((lang) => {
                        const isSelected = formData.language === lang.id;
                        return (
                          <button
                            key={lang.id}
                            onClick={() => setFormData({ ...formData, language: lang.id })}
                            className={cn(
                              'relative flex items-center gap-6 p-8 rounded-[40px] border transition-all duration-300 text-left',
                              isSelected
                                ? 'bg-primary border-transparent text-white shadow-xl shadow-[#0071E3]/20'
                                : 'bg-card border-border hover:bg-secondary'
                            )}
                          >
                            <div
                              className={cn(
                                'size-16 rounded-2xl flex items-center justify-center text-3xl shadow-sm border',
                                isSelected ? 'bg-card/10 border-white/10' : 'bg-card border-border'
                              )}
                            >
                              {lang.flag}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-display font-semibold text-2xl tracking-tight leading-none mb-1">
                                {lang.label}
                              </span>
                              <span
                                className={cn(
                                  'text-[11px] font-bold uppercase tracking-widest opacity-40',
                                  isSelected ? 'text-white' : 'text-muted-foreground'
                                )}
                              >
                                {lang.sub}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-8 right-8">
                                <div className="size-6 rounded-full bg-card flex items-center justify-center text-primary">
                                  <Check className="size-4" strokeWidth={3} />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="p-10 rounded-[40px] bg-secondary flex flex-col items-center text-center space-y-4">
                    <div className="size-16 rounded-[24px] bg-card flex items-center justify-center text-muted-foreground shadow-sm">
                      <Globe className="size-8" strokeWidth={1} />
                    </div>
                    <h4 className="text-xl font-display font-semibold text-foreground">
                      Localización Global
                    </h4>
                    <p className="text-sm font-medium text-muted-foreground max-w-sm">
                      Estamos expandiendo NailSync a nuevos idiomas. Próximamente: Português,
                      Français e Italiano.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'workspace' && <WorkspaceContent />}

              {activeTab === 'datos' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12 pb-20"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-[#8E8E93] size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8E8E93] opacity-60">
                        Control de Información
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-10 rounded-[40px] bg-card border border-border shadow-sm space-y-8 group transition-all duration-300">
                        <div className="size-16 rounded-[24px] bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                          <Download className="size-8" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-2xl font-display font-semibold text-foreground">
                            Copia de Seguridad
                          </h4>
                          <p className="text-sm font-medium text-muted-foreground opacity-60 leading-relaxed">
                            Descarga todo tu ecosistema comercial en un archivo JSON encriptado.
                          </p>
                        </div>
                        <Button
                          onClick={handleExportData}
                          disabled={isExporting}
                          className="w-full h-14 bg-[#1D1D1F] text-white rounded-2xl font-semibold text-[13px] gap-3 active:scale-95 transition-all"
                        >
                          {isExporting ? (
                            <RefreshCw className="size-5 animate-spin" />
                          ) : (
                            'Exportar Datos'
                          )}
                        </Button>
                      </div>

                      <div className="p-10 rounded-[40px] bg-card border border-border shadow-sm space-y-8 group transition-all duration-300">
                        <div className="size-16 rounded-[24px] bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center transition-transform group-hover:scale-110">
                          <Trash2 className="size-8" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-2xl font-display font-semibold text-foreground">
                            Limpiar Caché
                          </h4>
                          <p className="text-sm font-medium text-muted-foreground opacity-60 leading-relaxed">
                            Libera espacio eliminando datos temporales y optimiza el rendimiento.
                          </p>
                        </div>
                        <Button
                          onClick={handleClearCache}
                          disabled={isClearing}
                          variant="outline"
                          className="w-full h-14 border-border hover:bg-black/[0.02] text-foreground rounded-2xl font-semibold text-[13px] gap-3 active:scale-95 transition-all"
                        >
                          {isClearing ? (
                            <RefreshCw className="size-5 animate-spin" />
                          ) : (
                            'Limpiar Todo'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1D1D1F] p-10 lg:p-14 rounded-[40px] text-white flex flex-col md:flex-row items-center gap-10">
                    <div className="size-20 rounded-[28px] bg-card/10 flex items-center justify-center">
                      <Database className="size-10 text-white" />
                    </div>
                    <div className="space-y-2 text-center md:text-left flex-1">
                      <h5 className="text-xl font-display font-semibold">Almacenamiento Cloud</h5>
                      <p className="text-white/40 text-base font-medium max-w-md">
                        Tu información está blindada con encriptación AES-256 y respaldada en tiempo
                        real.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cuenta' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-12 pb-20"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 px-2">
                      <div className="bg-[#FF3B30] size-1.5 rounded-full" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF3B30] opacity-60">
                        Zona Crítica
                      </span>
                    </div>

                    <div className="bg-card border border-border rounded-[40px] p-8 lg:p-14 shadow-sm space-y-12">
                      <div className="flex flex-col md:flex-row items-center gap-10">
                        <div className="size-24 rounded-[32px] bg-[#FF3B30]/10 text-[#FF3B30] flex items-center justify-center">
                          <ShieldAlert className="size-12" />
                        </div>
                        <div className="space-y-3 text-center md:text-left flex-1">
                          <h4 className="text-3xl font-display font-semibold text-foreground">
                            Eliminar Cuenta Permanentemente
                          </h4>
                          <p className="text-base font-medium text-muted-foreground opacity-60 leading-relaxed max-w-2xl">
                            Esta acción es irreversible. Se borrarán todos tus datos comerciales,
                            historiales de clientas, configuraciones de IA y reportes financieros
                            sin posibilidad de recuperación.
                          </p>
                        </div>
                      </div>

                      <div className="pt-10 border-t border-border">
                        {deleteStep === 0 ? (
                          <Button
                            variant="ghost"
                            onClick={() => setDeleteStep(1)}
                            className="w-full h-16 rounded-[24px] text-[#FF3B30] bg-[#FF3B30]/5 hover:bg-[#FF3B30] hover:text-white font-semibold text-lg transition-all"
                          >
                            Eliminar Mi Cuenta
                          </Button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8 max-w-md mx-auto text-center"
                          >
                            <div className="space-y-4">
                              <Label className="text-[11px] font-bold uppercase tracking-widest text-[#FF3B30] opacity-60">
                                Confirma escribiendo "ELIMINAR"
                              </Label>
                              <Input
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="ELIMINAR"
                                className="h-16 rounded-2xl border-2 border-[#FF3B30]/20 bg-neutral-50 text-[#FF3B30] font-black text-2xl text-center placeholder:opacity-10 focus:ring-[#FF3B30]/5"
                              />
                            </div>
                            <div className="flex gap-4">
                              <Button
                                variant="ghost"
                                onClick={() => setDeleteStep(0)}
                                className="flex-1 h-14 rounded-2xl font-semibold text-muted-foreground"
                              >
                                Cancelar
                              </Button>
                              <Button
                                disabled={deleteConfirmText !== 'ELIMINAR'}
                                className="flex-2 h-14 bg-[#FF3B30] text-white rounded-2xl font-semibold px-8 disabled:opacity-20"
                              >
                                Confirmar Eliminación
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
