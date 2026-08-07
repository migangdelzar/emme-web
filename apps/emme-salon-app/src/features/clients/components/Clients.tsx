import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { els } from '@emme/i18n';
import { useApp, Appointment, Service } from '@/context/AppContext';
import { useClientData } from '@/features/clients/hooks/useClientData';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  MoreVertical,
  Trash2,
  Pencil,
  Edit2,
  History,
  DollarSign,
  CreditCard,
  Calendar,
  User,
  UserStar,
  Star,
  StickyNote,
  MessageSquare,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Ghost,
  MapPin,
  Clock,
  X,
  AlertCircle,
  Heart,
  Sparkle,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { PhoneInput } from '@/shared/ui/PhoneInput';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from '@/shared/ui/dialog';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { ClientForm } from '@/features/clients/components/ClientForm';
import { cn, parseLocalDate } from '@/shared/lib/utils';
import { useAppTranslation } from '@/app/translation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function Clients() {
  const {
    loading: clientsLoading,
    clients,
    addClient,
    updateClient,
    deleteClient,
  } = useClientData();
  const { appointments, services } = useApp();
  const serviceMap = useMemo(() => {
    const map = new Map();
    for (const s of services) map.set(s.id, s);
    return map;
  }, [services]);
  const { t } = useAppTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setTimeout(() => setIsAddOpen(true), 100);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('add');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [filterVip, setFilterVip] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'spent' | 'visits' | 'recent'>('recent');
  const [filterType, setFilterType] = useState<'all' | 'new' | 'loyal' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClient = (id: string) => {
    deleteClient(id);
    toast.success(t('clients.deleted'));
    setDeleteConfirmId(null);
  };

  const getClientStats = (clientId: string) => {
    if (!clientId || !appointments)
      return { appointments: [], totalSpent: 0, lastVisit: null, visitsCount: 0 };

    const clientAppointments = appointments
      .filter((a) => a?.clientId === clientId)
      .sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.localeCompare(a.date);
      });

    const totalSpent = clientAppointments
      .filter((a) => a.status === 'confirmed' || a.status === 'completed')
      .reduce((sum, a) => {
        const service = serviceMap.get(a.serviceId);
        return sum + (service?.price || 0);
      }, 0);

    return {
      appointments: clientAppointments,
      totalSpent,
      lastVisit: clientAppointments[0]?.date || null,
      visitsCount: clientAppointments.length,
    };
  };

  const filteredClients = useMemo(
    () =>
      clients
        .filter((c) => {
          const matchesSearch =
            (c.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (c.phone || '').includes(search);

          const matchesVip = !filterVip || c.isVip;

          const stats = getClientStats(c.id);
          const isNew = stats.visitsCount <= 1;
          const isLoyal = stats.visitsCount >= 5;
          const lastVisitDate = stats.lastVisit ? parseLocalDate(stats.lastVisit) : null;
          const isInactive = lastVisitDate
            ? new Date().getTime() - lastVisitDate.getTime() > 1000 * 60 * 60 * 24 * 75
            : false; // 2.5 months

          let matchesFilter = true;
          if (filterType === 'new') matchesFilter = isNew;
          if (filterType === 'loyal') matchesFilter = isLoyal;
          if (filterType === 'inactive') matchesFilter = isInactive;

          return matchesSearch && matchesVip && matchesFilter;
        })
        .sort((a, b) => {
          const statsA = getClientStats(a.id);
          const statsB = getClientStats(b.id);
          if (sortBy === 'name') return a.name.localeCompare(b.name);
          if (sortBy === 'spent') return statsB.totalSpent - statsA.totalSpent;
          if (sortBy === 'visits') return statsB.visitsCount - statsA.visitsCount;
          if (sortBy === 'recent') {
            const dateA = statsA.lastVisit || '';
            const dateB = statsB.lastVisit || '';
            return dateB.localeCompare(dateA);
          }
          return 0;
        }),
    [clients, appointments, search, filterVip, filterType, sortBy]
  );

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filterVip, sortBy, filterType]);

  const ClientDetailsDialog = ({
    client,
    stats,
    initialEdit = false,
  }: {
    client: any;
    stats: any;
    initialEdit?: boolean;
  }) => {
    const [isEditing, setIsEditing] = useState(initialEdit);
    const [editName, setEditName] = useState(client.name);
    const [editPhone, setEditPhone] = useState(client.phone);
    const [editEmail, setEditEmail] = useState(client.email || '');
    const [editBirthday, setEditBirthday] = useState(client.birthday || '');
    const [editNotes, setEditNotes] = useState(client.notes || '');
    const [editAllergies, setEditAllergies] = useState(client.allergies || '');
    const [editPreferences, setEditPreferences] = useState(client.preferences || '');
    const [editIsVip, setEditIsVip] = useState(client.isVip || false);

    const [historyLimit, setHistoryLimit] = useState(5);

    const handleUpdate = () => {
      if (!editName.trim()) {
        toast.error(t('clients.nameRequired'));
        return;
      }
      if (!editPhone.trim()) {
        toast.error(t('clients.phoneRequired'));
        return;
      }

      const phoneDigits = editPhone.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        toast.error(t('clients.phoneInvalid'));
        return;
      }

      updateClient({
        ...client,
        name: editName,
        phone: editPhone,
        email: editEmail,
        birthday: editBirthday,
        notes: editNotes,
        allergies: editAllergies,
        preferences: editPreferences,
        isVip: editIsVip,
      });
      toast.success(t('clients.updated'));
      setIsEditing(false);
      setSelectedClient({
        ...client,
        name: editName,
        phone: editPhone,
        email: editEmail,
        birthday: editBirthday,
        notes: editNotes,
        allergies: editAllergies,
        preferences: editPreferences,
        isVip: editIsVip,
      });
    };

    return (
      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="max-w-xl md:max-w-4xl lg:max-w-[1100px] h-[95vh] sm:h-[85vh] p-0 overflow-hidden bg-background border-none shadow-2xl rounded-[40px] flex flex-col focus:outline-none">
          <DialogTitle className="sr-only">{t('clients.detailsTitle')}</DialogTitle>
          {/* Custom Header Navigation */}
          <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0 z-10 transition-all">
            <Button
              variant="ghost"
              onClick={() => setSelectedClient(null)}
              className="size-12 rounded-full bg-[#1D1D1F]/5 p-0 hover:bg-[#1D1D1F]/10 active:scale-90 transition-all font-display"
            >
              <X className="size-5 text-foreground" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
                className={cn(
                  'h-12 px-6 rounded-2xl text-[14px] font-semibold transition-all shadow-sm',
                  isEditing
                    ? 'bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90'
                    : 'bg-card border border-border text-foreground hover:bg-secondary'
                )}
              >
                {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="px-8 md:px-14 pb-14 space-y-10"
                >
                  <div className="space-y-2 mt-4 text-center">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                      Modo Edición
                    </span>
                    <h3 className="text-4xl font-display font-semibold tracking-tight text-foreground">
                      Refinar <span className="text-primary">Perfil</span>.
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                          Básicos de {client.name}
                        </Label>
                        <div className="space-y-6 bg-card p-8 rounded-[40px] border border-border shadow-sm">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1 text-foreground">
                              Nombre Completo
                            </span>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="premium-input bg-secondary/30 border-transparent focus:bg-card"
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1 text-foreground">
                              Móvil
                            </span>
                            <PhoneInput
                              value={editPhone}
                              onChange={setEditPhone}
                              className="h-14"
                              inputClassName="premium-input bg-secondary/30 border-transparent focus:bg-card px-5 font-bold"
                            />
                          </div>
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1 text-foreground">
                              E-mail
                            </span>
                            <Input
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="premium-input bg-secondary/30 border-transparent focus:bg-card"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                          Anillo Atelier
                        </Label>
                        <div className="space-y-6 bg-card p-8 rounded-[40px] border border-border shadow-sm">
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1 text-foreground">
                              Aniversario
                            </span>
                            <Input
                              value={editBirthday}
                              onChange={(e) => setEditBirthday(e.target.value)}
                              className="premium-input bg-secondary/30 border-transparent focus:bg-card"
                            />
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-border">
                            <div className="flex items-center gap-4">
                              <div
                                className={cn(
                                  'size-12 rounded-2xl flex items-center justify-center transition-all shadow-sm',
                                  editIsVip
                                    ? 'bg-[#FF9500] text-white shadow-[#FF9500]/20'
                                    : 'bg-secondary text-muted-foreground'
                                )}
                              >
                                <Star className={cn('size-6', editIsVip && 'fill-current')} />
                              </div>
                              <span className="text-sm font-semibold text-foreground">
                                Destacar como VIP
                              </span>
                            </div>
                            <Switch
                              checked={editIsVip}
                              onCheckedChange={setEditIsVip}
                              className="data-[state=checked]:bg-[#FF9500]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <Label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-1">
                        Cuidados & Notas Especiales
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card p-8 rounded-[44px] border border-border shadow-sm">
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest ml-1 opacity-60">
                            Piel & Alergias
                          </span>
                          <Input
                            value={editAllergies}
                            onChange={(e) => setEditAllergies(e.target.value)}
                            placeholder="Ninguna"
                            className="premium-input bg-secondary/30 border-transparent focus:bg-card"
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] font-bold text-[#5856D6] uppercase tracking-widest ml-1 opacity-60">
                            Preferencias
                          </span>
                          <Input
                            value={editPreferences}
                            onChange={(e) => setEditPreferences(e.target.value)}
                            placeholder="Gustos específicos..."
                            className="premium-input bg-secondary/30 border-transparent focus:bg-card"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest ml-1 text-foreground">
                            Bitácora & Relatos
                          </span>
                          <Textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="premium-input bg-secondary/30 border-transparent focus:bg-card min-h-[160px] p-8 resize-none text-base font-medium leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 flex flex-col-reverse sm:flex-row gap-4 max-w-2xl mx-auto">
                    <Button
                      variant="ghost"
                      className="flex-1 h-16 rounded-[28px] text-[14px] font-semibold text-[#FF3B30] hover:bg-[#FF3B30]/5 transition-all"
                      onClick={() => setDeleteConfirmId(client.id)}
                    >
                      Baja Permanente
                    </Button>
                    <Button
                      onClick={handleUpdate}
                      className="flex-[2] h-16 rounded-[28px] bg-[#1D1D1F] text-white hover:bg-[#1D1D1F]/90 font-semibold text-lg shadow-2xl active:scale-95 transition-all"
                    >
                      Guardar Cambios
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="px-8 md:px-14 pb-14 space-y-12"
                >
                  {/* Profile Header */}
                  <div className="flex flex-col items-center gap-6 mt-4">
                    <div className="relative group">
                      <Avatar className="h-40 w-40 border-white border-[8px] shadow-2xl rounded-[48px] transition-transform duration-700 group-hover:scale-105">
                        <AvatarFallback className="bg-[#1D1D1F] text-white text-5xl font-display font-semibold">
                          {client.name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {client.isVip && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -bottom-2 -right-2 bg-[#FF9500] text-white p-3 rounded-2xl border-[6px] border-white shadow-lg"
                        >
                          <Star className="size-6 fill-current" />
                        </motion.div>
                      )}
                    </div>

                    <div className="text-center space-y-3">
                      <h2 className="text-[44px] font-display font-semibold tracking-tight text-foreground leading-none">
                        {client.name}
                      </h2>
                      <div className="flex items-center justify-center gap-4 text-muted-foreground font-semibold text-lg">
                        <p>{client.phone}</p>
                        {client.email && (
                          <>
                            <div className="size-1.5 rounded-full bg-neutral-300" />
                            <p className="lowercase">{client.email}</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Button
                        className="h-14 rounded-full bg-[#34C759] text-white px-10 font-bold text-[14px] shadow-xl shadow-[#34C759]/20 active:scale-95 transition-all"
                        onClick={() =>
                          window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank')
                        }
                      >
                        WhatsApp Business
                      </Button>
                      <Button
                        variant="outline"
                        className="h-14 rounded-full bg-card border-border shadow-sm px-10 font-bold text-[14px] active:scale-95 transition-all"
                        onClick={() => (window.location.href = `tel:${client.phone}`)}
                      >
                        Llamar
                      </Button>
                    </div>
                  </div>

                  {/* Bento Grid Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Stats Bento */}
                    <div className="md:col-span-1 space-y-6">
                      <div className="bg-[#1D1D1F] p-8 rounded-[44px] text-white flex flex-col justify-between min-h-[180px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-transform active:scale-[0.98]">
                        <TrendingUp className="size-10 text-primary opacity-80" />
                        <div>
                          <p className="text-[12px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1">
                            Inversión Final
                          </p>
                          <p className="text-[40px] font-display font-semibold tracking-tighter leading-none">
                            ${stats.totalSpent.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="p-8 rounded-[44px] bg-card border border-border flex flex-col justify-between min-h-[140px] shadow-sm transition-transform active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                          <Phone className="size-5 text-muted-foreground opacity-40" />
                          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-60">
                            Visitas
                          </p>
                        </div>
                        <p className="text-5xl font-display font-semibold text-foreground tracking-tighter transition-all">
                          {stats.visitsCount}
                        </p>
                      </div>
                    </div>

                    {/* Details Bento */}
                    <div className="md:col-span-2 bg-secondary/40 p-10 rounded-[48px] border border-border flex flex-col gap-12">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                            Bio-Seguridad
                          </p>
                          <div className="bg-card p-7 rounded-[32px] border border-border shadow-sm flex items-center gap-5">
                            <div className="size-14 rounded-2xl bg-[#FF3B30]/5 flex items-center justify-center text-[#FF3B30]">
                              <Heart className="size-7" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF3B30] opacity-60">
                                Alergias
                              </p>
                              <p className="text-lg font-semibold text-foreground">
                                {client.allergies || 'Ninguna'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                            Preferencias
                          </p>
                          <div className="bg-card p-7 rounded-[32px] border border-border shadow-sm flex items-center gap-5">
                            <div className="size-14 rounded-2xl bg-[#5856D6]/5 flex items-center justify-center text-[#5856D6]">
                              <Sparkles className="size-7" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-widest text-[#5856D6] opacity-60">
                                Kuidado
                              </p>
                              <p className="text-lg font-semibold text-foreground">
                                {client.preferences || 'Estándar Premium'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60 ml-2">
                          Bitácora Personal
                        </p>
                        <div className="bg-card p-8 rounded-[40px] border border-border shadow-sm">
                          <p className="text-xl font-medium text-foreground leading-relaxed">
                            {client.notes
                              ? `"${client.notes}"`
                              : 'Esta clienta aún no tiene bitácora de sesión relevante registrada en su perfil.'}
                          </p>
                          <div className="pt-8 mt-8 border-t border-border flex flex-wrap items-center gap-10">
                            <div className="flex items-center gap-4">
                              <Calendar className="size-6 text-muted-foreground opacity-30" />
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                                  En el Atelier desde
                                </p>
                                <p className="text-base font-semibold text-foreground">
                                  {stats.appointments.length > 0
                                    ? format(
                                        parseLocalDate(
                                          stats.appointments[stats.appointments.length - 1].date
                                        ),
                                        'MMMM yyyy',
                                        { locale: es }
                                      )
                                    : 'Reciente'}
                                </p>
                              </div>
                            </div>
                            {client.birthday && (
                              <div className="flex items-center gap-4">
                                <div className="size-1.5 rounded-full bg-neutral-200" />
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                                    Aniversario
                                  </p>
                                  <p className="text-base font-semibold text-foreground">
                                    {client.birthday}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* History Section */}
                  <div className="space-y-10">
                    <div className="flex items-center justify-between px-4">
                      <h4 className="text-[34px] font-display font-semibold tracking-tight text-foreground">
                        Línea de Tiempo.
                      </h4>
                      <Badge
                        variant="outline"
                        className="h-9 px-6 rounded-full border-border text-muted-foreground font-bold text-[13px] tracking-tight bg-card"
                      >
                        {stats.visitsCount} Encuentros
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {stats.appointments.length > 0 ? (
                        stats.appointments.slice(0, historyLimit).map((apt: any) => {
                          const service = serviceMap.get(apt.serviceId);
                          if (clientsLoading) {
                            return (
                              <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
                                <Loader2 className="size-8 animate-spin text-primary opacity-50" />
                              </div>
                            );
                          }

                          return (
                            <div
                              key={apt.id}
                              className="bg-card p-8 rounded-[40px] border border-border flex items-center justify-between group transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1"
                            >
                              <div className="flex items-center gap-6">
                                <div className="size-16 rounded-3xl bg-secondary flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:text-white">
                                  <Sparkle className="size-7 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div>
                                  <p className="text-2xl font-display font-semibold text-foreground leading-tight mb-1">
                                    {service?.name}
                                  </p>
                                  <p className="text-sm font-semibold text-muted-foreground opacity-60 capitalize">
                                    {format(parseLocalDate(apt.date), "EEEE d 'de' MMMM", {
                                      locale: es,
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[28px] font-display font-semibold text-foreground tracking-tighter">
                                  ${service?.price}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="md:col-span-2 py-24 text-center bg-secondary/30 rounded-[48px] border border-dashed border-border">
                          <p className="text-[15px] font-bold text-muted-foreground opacity-30 uppercase tracking-[0.3em]">
                            Sin bitácora histórica
                          </p>
                        </div>
                      )}
                    </div>

                    {stats.appointments.length > historyLimit && (
                      <Button
                        variant="ghost"
                        onClick={() => setHistoryLimit((prev) => prev + 5)}
                        className="w-full h-20 rounded-[32px] bg-card border border-border text-lg font-bold text-primary hover:bg-card hover:shadow-xl transition-all"
                      >
                        Cargar más bitácora.
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-1000 pb-52 lg:pb-16 px-4 sm:px-6 lg:px-0 max-w-full mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6">
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">
            Base de Datos
          </span>
          <div className="space-y-1">
            <h2
              data-testid={els.clients.header}
              className="text-[40px] lg:text-[56px] font-display font-semibold tracking-tight text-foreground leading-[0.9]"
            >
              Relaciones.
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,113,227,0.5)]" />
              <p className="text-muted-foreground text-base font-medium">
                {clients.length} {clients.length === 1 ? 'alma registrada' : 'almas registradas'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent
          data-testid={els.clients.dialog}
          className="max-w-xl md:max-w-2xl lg:max-w-3xl material-thick border-none shadow-[0_60px_120px_-20px_rgba(0,0,0,0.2)] p-0 overflow-hidden outline-none rounded-[32px] h-[95vh] sm:h-[85vh] flex flex-col focus:outline-none"
        >
          <DialogTitle className="sr-only">{t('clients.newTitle')}</DialogTitle>
          <ClientForm onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="relative group w-full">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5.5 text-muted-foreground opacity-35 group-focus-within:text-primary group-focus-within:opacity-100 transition-all duration-500" />
        <Input
          data-testid={els.clients.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('clients.searchPlaceholder')}
          className="h-14 pl-14 pr-10 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all text-base font-medium focus:ring-8 focus:ring-primary/5 focus:border-primary/10 placeholder:text-muted-foreground/30 !text-foreground"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="size-4 text-muted-foreground/40" />
          </button>
        )}
      </div>

      <div className="space-y-5 lg:space-y-4 pb-3 border-b border-border">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:items-center">
          <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
            <div className="bg-secondary p-1 rounded-2xl flex gap-1 shadow-sm shrink-0">
              {[
                { id: 'recent', label: 'Recientes' },
                { id: 'name', label: 'A-Z' },
                { id: 'spent', label: 'Inversión' },
                { id: 'visits', label: 'Visitas' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id as any)}
                  className={cn(
                    'px-5 h-9 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap active:scale-95',
                    sortBy === opt.id
                      ? 'bg-card text-foreground shadow-sm scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              className={cn(
                'h-9 w-9 rounded-xl transition-all p-0 shadow-sm shrink-0 bg-card border border-border active:scale-90',
                filterVip
                  ? 'bg-[#FF9500] text-white border-transparent shadow-xl shadow-[#FF9500]/20'
                  : 'text-muted-foreground/40 hover:text-[#FF9500] hover:bg-[#FF9500]/5'
              )}
              onClick={() => setFilterVip(!filterVip)}
            >
              <Star
                className={cn(
                  'size-4.5 transition-all',
                  filterVip ? 'fill-current' : 'stroke-[1.5]'
                )}
              />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'new', label: 'Nuevos' },
              { id: 'loyal', label: 'Fieles' },
              { id: 'inactive', label: 'Pausa' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setFilterType(chip.id as any)}
                className={cn(
                  'px-4 h-9 rounded-full text-[11px] font-semibold transition-all duration-300 active:scale-95 border',
                  filterType === chip.id
                    ? 'bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-md'
                    : 'bg-card border-border text-muted-foreground hover:bg-secondary'
                )}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-0 space-y-2">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card p-6 rounded-[28px] border border-border shadow-sm animate-pulse space-y-6"
              >
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-black/[0.05]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-black/[0.05] rounded-full" />
                    <div className="h-3 w-20 bg-black/[0.05] rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div
            data-testid={els.clients.empty}
            className="py-20 md:py-40 text-center animate-in fade-in zoom-in duration-1000 bg-neutral-50/50 rounded-[44px] mt-4"
          >
            <div className="size-24 rounded-3xl mx-auto flex items-center justify-center mb-6 bg-card shadow-sm border border-border">
              <Search className="size-8 text-muted-foreground/20" />
            </div>
            <h3 className="text-xl md:text-4xl font-display font-semibold tracking-tight text-foreground mb-2 opacity-50">
              Silencio absoluto.
            </h3>
            <p className="text-[12px] md:text-[14px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-30">
              {search
                ? `SIN COINCIDENCIAS PARA TU RASTREO`
                : 'EL TELÓN ESTÁ CERRADO. REGISTRA A ALGUIEN'}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch pt-2">
              {paginatedClients.map((client, idx) => {
                const stats = getClientStats(client.id);
                return (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => {
                      setSelectedClient(client);
                      setIsEditingSelected(false);
                    }}
                    className="group cursor-pointer"
                  >
                    <div
                      className={cn(
                        'relative bg-card rounded-[28px] p-6 sm:p-8 flex flex-col h-full gap-6 overflow-hidden border border-border transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2',
                        !client.name && 'opacity-40'
                      )}
                    >
                      <div className="relative z-10 flex flex-col gap-5">
                        <div className="flex items-center justify-between">
                          <Avatar className="size-14 rounded-2xl shadow-sm border border-border transition-transform duration-500 group-hover:scale-110">
                            <AvatarFallback className="bg-[#1D1D1F] text-white text-lg font-display font-semibold transition-colors duration-500 group-hover:bg-primary">
                              {client.name.substring(0, 1).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {client.isVip && (
                            <div className="bg-[#FF9500]/10 text-[#FF9500] p-2 rounded-xl shadow-sm shadow-[#FF9500]/5">
                              <Star className="size-4.5 fill-current" />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="text-lg md:text-xl font-display font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-500 min-h-[3rem] text-wrap break-words line-clamp-2 leading-snug">
                            {client.name}
                          </h3>
                          <p className="text-[14px] text-[#515154] font-semibold flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                            <Phone className="size-3.5 text-[#515154] shrink-0" />
                            {client.phone}
                          </p>
                        </div>
                      </div>

                      <div className="relative z-10 mt-auto pt-6 border-t border-border flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-xl font-display font-semibold text-foreground tracking-tighter leading-none">
                            ${stats.totalSpent.toLocaleString()}
                          </p>
                          <p className="text-[10px] font-bold text-[#515154] uppercase tracking-[0.2em] opacity-80">
                            Atelier Balance
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-xl font-display font-semibold text-foreground tracking-tighter leading-none">
                            {stats.visitsCount}
                          </p>
                          <p className="text-[10px] font-bold text-[#515154] uppercase tracking-[0.2em] opacity-80">
                            Sesiones
                          </p>
                        </div>
                      </div>

                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="size-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center">
                          <ChevronRight className="size-4.5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 pt-20">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="size-16 rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-all flex items-center justify-center"
                >
                  <ChevronLeft className="size-6" />
                </Button>
                <div className="px-8 h-16 rounded-[24px] bg-[#1D1D1F] text-white flex items-center text-lg font-display font-semibold shadow-2xl">
                  {currentPage} / {totalPages}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="size-16 rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-all flex items-center justify-center"
                >
                  <ChevronRight className="size-6" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedClient && (
        <ClientDetailsDialog
          client={selectedClient}
          stats={getClientStats(selectedClient.id)}
          initialEdit={isEditingSelected}
        />
      )}

      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent className="rounded-[2rem] border-none p-0 overflow-hidden max-w-sm">
          <div className="bg-red-600 p-8 text-white flex flex-col items-center text-center">
            <div className="size-16 rounded-2xl bg-card/20 flex items-center justify-center mb-4">
              <Trash2 className="size-8 stroke-[2.5]" />
            </div>
            <AlertDialogTitle className="text-2xl font-black tracking-tighter text-white">
              ¿Confirmar Eliminación?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/80 font-medium pt-2 text-sm">
              Esta acción borrará el perfil de la clienta y todo su historial de forma permanente.
              No se puede deshacer.
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="p-6 bg-background flex-row gap-3 sm:justify-center">
            <AlertDialogCancel className="flex-1 h-12 rounded-xl border-none bg-secondary hover:bg-secondary/80 font-black uppercase text-[10px] tracking-widest mt-0">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteClient(deleteConfirmId)}
              className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 font-black uppercase text-[10px] tracking-widest"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
