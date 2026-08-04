import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { els } from '@emme/i18n';
import { useApp } from '@/context/AppContext';
import { useServiceData } from '@/features/services/hooks/useServiceData';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
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
  Briefcase,
  Clock,
  DollarSign,
  Trash2,
  Edit2,
  Search,
  Filter,
  Power,
  Layers,
  Droplets,
  Brush,
  Blend,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/shared/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { useAppTranslation } from '@/app/translation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    filter: 'blur(4px)',
    transition: { duration: 0.2, ease: 'easeOut' as const },
  },
};

export function Services() {
  const {
    loading: servicesLoading,
    services,
    addService,
    updateService,
    deleteService,
  } = useServiceData();
  const { toggleServiceStatus } = useApp();
  const { t } = useAppTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setTimeout(() => handleOpenAdd(), 100);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('add');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const iconMap: Record<string, React.ElementType> = {
    'Manicura y Cuidado Natural': Sparkle,
    'Extensiones y Estructura': Layers,
    Pedicura: Droplets,
    'Nail Art y Efectos': Brush,
    'Servicios Complementarios': Blend,
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: 'Manicura y Cuidado Natural',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: 'Manicura y Cuidado Natural',
    });
    setEditingService(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      duration: String(service.duration),
      category: service.category,
    });
    setEditingService(service);
    setIsAddOpen(true);
  };

  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isAddOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, price, duration, description, category } = formData;

    if (!name.trim()) {
      toast.error(t('services.nameRequired'));
      return;
    }

    if (!price || Number(price) <= 0) {
      toast.error(t('services.priceInvalid'));
      return;
    }

    if (!duration || Number(duration) <= 0) {
      toast.error(t('services.durationInvalid'));
      return;
    }

    const payload = {
      name: name.trim(),
      description,
      price: Number(price),
      duration: Number(duration),
      category,
    };

    if (editingService) {
      updateService(editingService.id, payload);
      toast.success(t('services.updated'));
    } else {
      addService(payload);
      toast.success(t('services.added'));
    }

    setIsAddOpen(false);
    resetForm();
  };

  const categories = Array.from(new Set(services.map((s) => s.category)));
  const filterCategories = ['Todas', ...categories];

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / itemsPerPage));
  const paginatedServices = filteredServices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const handleDeleteService = (id: string) => {
    deleteService(id);
    toast.success(t('services.deleted'));
    setDeleteConfirmId(null);
  };

  const activeCount = services.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in duration-1000 pb-52 lg:pb-16 px-4 sm:px-6 lg:px-0 max-w-full mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-6">
        <div className="space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">
            {t('services.header')}
          </span>
          <div className="space-y-1">
            <h2
              data-testid={els.services.header.testId}
              className="text-[40px] lg:text-[56px] font-display font-semibold tracking-tight text-foreground leading-[0.9]"
            >
              {t('services.header')}.
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <div className="size-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(0,113,227,0.5)]" />
              <p className="text-muted-foreground text-base font-medium">
                {activeCount} {t('services.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent
          data-testid={els.services.dialog.testId}
          className="max-w-xl md:max-w-4xl lg:max-w-[1200px] xl:max-w-[1300px] material-thick border-none shadow-[0_80px_200px_-30px_rgba(0,0,0,0.4)] p-0 overflow-hidden outline-none sm:rounded-[32px] rounded-t-[32px] sm:!top-1/2 sm:!translate-y-[-50%] w-full h-[90vh] lg:h-[85vh] flex flex-col focus:outline-none"
        >
          <DialogTitle className="sr-only">
            {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
          </DialogTitle>
          <div className="flex flex-col lg:flex-row h-full lg:overflow-hidden overflow-y-auto">
            {/* Left: Preview Section (Desktop) / Header (Mobile) */}
            <div className="hidden lg:flex lg:w-2/5 bg-background border-b lg:border-b-0 lg:border-r border-border p-10 md:p-14 lg:p-16 relative overflow-hidden flex-col justify-center shrink-0">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 size-96 bg-primary/5 rounded-full blur-[120px]" />

              <div className="relative z-10 space-y-6 mb-12">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">
                  Atelier Config.
                </span>
                <h3 className="text-5xl md:text-7xl font-display font-semibold tracking-tight leading-[0.9] text-foreground">
                  {editingService ? 'Refinar.' : 'Diseñar.'}
                </h3>
                <p className="text-[15px] font-medium text-muted-foreground max-w-[240px] leading-relaxed">
                  {editingService
                    ? 'Ajusta cada detalle para mantener the excelencia de emmenails.'
                    : 'Diseña una nueva experiencia de lujo para tu catálogo exclusivo.'}
                </p>
              </div>

              {/* Live Preview Card */}
              <div className="perspective-1000 hidden lg:block">
                <motion.div
                  key={formData.category}
                  layout
                  initial={{ scale: 0.9, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="bg-card rounded-[32px] p-12 flex flex-col justify-between overflow-hidden border border-border shadow-2xl relative group h-[450px]"
                >
                  <div className="absolute top-0 right-0 p-8">
                    <div className="size-16 rounded-[24px] bg-[#1D1D1F] text-white flex items-center justify-center shadow-2xl">
                      {React.createElement(iconMap[formData.category] || Sparkle, {
                        className: 'size-8 stroke-[2.5]',
                      })}
                    </div>
                  </div>

                  <div className="mt-16 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">
                        Sello de Maestría
                      </span>
                    </div>
                    <h3 className="text-4xl font-display font-semibold tracking-tight text-foreground line-clamp-2 leading-[1.05]">
                      {formData.name || 'Nombre del Arte'}
                    </h3>
                    <p className="text-[16px] text-muted-foreground font-medium line-clamp-3 leading-relaxed max-w-[85%]">
                      {formData.description ||
                        'Describe la esencia y el resultado impecable de este tratamiento...'}
                    </p>
                  </div>

                  <div className="mt-auto pt-10 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-4 px-6 py-3 rounded-[24px] bg-secondary">
                      <Clock className="size-4.5 text-muted-foreground opacity-40" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                        {formData.duration || '0'} MINS
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-5xl font-display font-semibold tracking-tighter text-foreground">
                        ${formData.price || '0'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right: Form Section */}
            <div className="flex-1 flex flex-col h-full bg-card overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 sm:px-10 md:px-16 pt-5 md:pt-20 pb-6 space-y-6 sm:space-y-12">
                {/* Mobile Title */}
                <div className="lg:hidden space-y-0.5 pt-2 text-left">
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary opacity-60">
                    Atelier Config.
                  </span>
                  <h3 className="text-2xl font-display font-semibold tracking-tight text-foreground">
                    {editingService ? 'Refinar Tratamiento' : 'Diseñar Tratamiento'}
                  </h3>
                </div>
                {/* Category Group - Visual Picker */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 ml-1 sm:ml-4">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-40">
                      Universo
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4">
                    {Object.keys(iconMap).map((cat) => {
                      const CatIcon = iconMap[cat];
                      const isSelected = formData.category === cat;
                      if (servicesLoading) {
                        return (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-50">
                            <Loader2 className="size-8 animate-spin text-primary opacity-50" />
                          </div>
                        );
                      }

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={cn(
                            'p-3 sm:p-6 rounded-2xl sm:rounded-[32px] transition-all duration-300 flex flex-col items-center gap-2 sm:gap-3 group/cat border active:scale-95',
                            isSelected
                              ? 'bg-[#1D1D1F] text-white border-transparent shadow-xl'
                              : 'bg-card border-border text-muted-foreground hover:bg-secondary opacity-80 hover:opacity-100'
                          )}
                        >
                          <div
                            className={cn(
                              'size-8 sm:size-12 rounded-xl sm:rounded-[18px] flex items-center justify-center transition-all duration-300',
                              isSelected ? 'bg-card/10' : 'bg-secondary'
                            )}
                          >
                            <CatIcon
                              className={cn(
                                'size-4 sm:size-6',
                                isSelected ? 'text-white' : 'text-primary'
                              )}
                            />
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-center leading-tight">
                            {cat.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Basic Info Group */}
                <div className="space-y-6 sm:space-y-12">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 ml-1 sm:ml-4">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-40">
                        Identidad
                      </span>
                    </div>
                    <Input
                      ref={inputRef}
                      placeholder={t('services.namePlaceholder')}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 sm:h-16 lg:h-20 px-4 sm:px-8 text-base sm:text-2xl font-display font-semibold bg-secondary border-transparent rounded-xl sm:rounded-[24px] focus:bg-card focus:ring-8 focus:ring-primary/5 focus:border-primary/10 placeholder:text-muted-foreground/10 !text-foreground"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-10">
                    <div className="space-y-3">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-40 ml-1 sm:ml-4">
                        Inversión (MXN)
                      </span>
                      <div className="relative group">
                        <DollarSign className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 size-5 sm:size-7 text-primary opacity-25 group-focus-within:opacity-100 transition-opacity" />
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="h-12 sm:h-16 lg:h-20 pl-10 sm:pl-16 pr-4 sm:pr-8 text-lg sm:text-3xl font-display font-semibold bg-secondary border-transparent rounded-xl sm:rounded-[24px] focus:bg-card focus:ring-8 focus:ring-primary/5 focus:border-primary/10 placeholder:text-muted-foreground/10 !text-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-40 ml-1 sm:ml-4">
                        Duración
                      </span>
                      <div className="space-y-3 sm:space-y-6">
                        <div className="relative group">
                          <Clock className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 size-5 sm:size-7 text-primary opacity-25 group-focus-within:opacity-100 transition-opacity" />
                          <Input
                            type="number"
                            placeholder="60"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            className="h-12 sm:h-16 lg:h-20 pl-10 sm:pl-16 pr-12 sm:pr-20 text-lg sm:text-3xl font-display font-semibold bg-secondary border-transparent rounded-xl sm:rounded-[24px] focus:bg-card focus:ring-8 focus:ring-primary/5 focus:border-primary/10 placeholder:text-muted-foreground/10 !text-foreground"
                          />
                          <span className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-muted-foreground opacity-40 uppercase tracking-widest leading-none">
                            MIN
                          </span>
                        </div>
                        <div className="flex gap-1.5 p-1 bg-secondary rounded-xl sm:rounded-[24px] border border-border">
                          {[45, 60, 90, 120].map((m) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setFormData({ ...formData, duration: String(m) })}
                              className={cn(
                                'flex-1 h-9 sm:h-12 rounded-lg sm:rounded-[18px] text-[10px] sm:text-[11px] font-bold tracking-widest transition-all',
                                formData.duration === String(m)
                                  ? 'bg-card text-foreground shadow-sm scale-[1.03]'
                                  : 'text-muted-foreground hover:text-primary'
                              )}
                            >
                              {m}'
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Group */}
                <div className="space-y-3 pb-2">
                  <div className="flex items-center gap-2 ml-1 sm:ml-4">
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground opacity-40">
                      Experiencia
                    </span>
                  </div>
                  <Textarea
                    placeholder={t('services.descriptionPlaceholder')}
                    value={formData.description}
                    maxLength={250}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-24 sm:min-h-40 rounded-2xl sm:rounded-[32px] bg-secondary border-transparent text-sm sm:text-xl font-medium px-4 sm:px-10 py-4 sm:py-10 resize-none focus:bg-card focus:ring-8 focus:ring-primary/5 focus:border-primary/10 placeholder:text-muted-foreground/10 !text-foreground leading-relaxed"
                  />
                </div>
              </div>

              {/* Master Footer */}
              <div className="p-4 sm:p-10 md:p-14 pt-0 shrink-0 bg-card border-t border-border">
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 sm:pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddOpen(false)}
                    className="h-24 sm:h-32 rounded-xl sm:rounded-[24px] text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground flex-1"
                  >
                    Descartar
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="h-24 sm:h-32 rounded-xl sm:rounded-[24px] bg-[#1D1D1F] text-white hover:bg-primary shadow-2xl flex-[2.5] font-bold text-[12px] sm:text-[14px] uppercase tracking-[0.3em] transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {editingService ? 'Actualizar' : 'Inmortalizar'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tool Bar */}
      <div className="space-y-5 lg:space-y-4 pb-3 border-b border-border">
        <div className="relative group w-full px-2">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5.5 text-muted-foreground opacity-35 group-focus-within:text-primary group-focus-within:opacity-100 transition-all duration-500" />
          <Input
            data-testid={els.services.search.testId}
            placeholder="¿Qué experiencia buscas hoy?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-14 pl-14 pr-10 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all text-base font-medium focus:ring-8 focus:ring-primary/5 focus:border-primary/10 placeholder:text-muted-foreground/30 !text-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5 transition-all active:scale-90"
            >
              <X className="size-4 text-muted-foreground/40" />
            </button>
          )}
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
          <div className="bg-secondary p-1 rounded-2xl flex gap-1 shadow-sm shrink-0">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-6 h-10 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap relative active:scale-95',
                  selectedCategory === cat
                    ? 'bg-card text-foreground shadow-sm scale-[1.02]'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${selectedCategory}-${currentPage}-${searchQuery}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch pt-2"
        >
          {paginatedServices.map((service, idx) => {
            const Icon = iconMap[service.category] || Sparkle;
            return (
              <motion.div
                key={service.id}
                layout
                variants={itemVariants}
                onClick={() => setSelectedServiceForDetails(service)}
                className={cn(
                  'group relative bg-card border border-border rounded-[28px] p-6 lg:p-8 flex flex-col justify-between h-full overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] hover:-translate-y-2 cursor-pointer',
                  !service.isActive && 'opacity-40'
                )}
              >
                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div
                      className={cn(
                        'size-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-500',
                        service.isActive ? 'text-primary' : 'text-muted-foreground/40'
                      )}
                    >
                      <Icon className="size-7 stroke-[2.2]" />
                    </div>
                    <div className="flex gap-1.5 relative z-50">
                      <Button
                        aria-label={`Editar ${service.name}`}
                        variant="ghost"
                        size="icon"
                        className="size-10 rounded-full hover:bg-black/5 transition-all duration-500 active:scale-90"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(service);
                        }}
                      >
                        <Edit2 className="size-4.5" />
                      </Button>
                      <Button
                        aria-label={`${service.isActive ? 'Desactivar' : 'Activar'} ${service.name}`}
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'size-10 rounded-full transition-all duration-500 active:scale-90',
                          service.isActive
                            ? 'text-[#34C759] hover:bg-[#34C759]/10'
                            : 'text-muted-foreground/40 hover:bg-neutral-100'
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleServiceStatus(service.id);
                        }}
                      >
                        <Power className="size-4.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0051A3]">
                      {service.category.split(' ')[0]}
                    </span>
                    <h3 className="text-lg md:text-xl font-display font-semibold tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors duration-500 min-h-[3rem] text-wrap break-words line-clamp-2">
                      {service.name}
                    </h3>
                    <p className="text-[14px] text-[#4F4F52] font-semibold line-clamp-2 leading-relaxed opacity-90">
                      {service.description ||
                        'Experiencia exclusiva diseñada para resaltar tu belleza natural.'}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-8 pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-secondary">
                    <Clock className="size-3.5 text-[#515154]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#515154]">
                      {service.duration} MIN
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-display font-semibold tracking-tighter text-foreground leading-none">
                      ${service.price}
                    </p>
                  </div>
                </div>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className="size-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center">
                    <ChevronRight className="size-4.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Pagination UI */}
      {filteredServices.length > itemsPerPage && (
        <div className="flex items-center justify-center gap-6 pt-20">
          <Button
            variant="ghost"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="size-16 rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-all flex items-center justify-center"
          >
            <ChevronLeft className="size-6" />
          </Button>
          <div className="px-8 h-16 rounded-[24px] bg-[#1D1D1F] text-white flex items-center text-lg font-display font-semibold shadow-2xl">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="ghost"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="size-16 rounded-full bg-card border border-border shadow-sm hover:bg-secondary transition-all flex items-center justify-center"
          >
            <ChevronRight className="size-6" />
          </Button>
        </div>
      )}

      {filteredServices.length === 0 && (
        <div
          data-testid={els.services.empty.testId}
          className="py-20 md:py-40 text-center animate-in fade-in zoom-in duration-1000 bg-neutral-50/50 rounded-[44px] mt-4 mx-4"
        >
          <div className="size-24 rounded-3xl mx-auto flex items-center justify-center mb-6 bg-card shadow-sm border border-border">
            <Briefcase className="size-10 text-muted-foreground/20" />
          </div>
          <h3 className="text-xl md:text-4xl font-display font-semibold tracking-tight text-foreground mb-2 opacity-50">
            Silencio absoluto.
          </h3>
          <p className="text-[12px] md:text-[14px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-30">
            {searchQuery
              ? `SIN COINCIDENCIAS PARA TU RASTREO`
              : 'EL TELÓN ESTÁ CERRADO. INMORTALIZA UN SERVICIO'}
          </p>
        </div>
      )}

      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent className="glass shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-none p-0 overflow-hidden max-w-md sm:rounded-[3rem] rounded-t-[3rem]">
          <div className="bg-red-500/10 p-12 text-red-500 flex flex-col items-center text-center">
            <div className="size-24 rounded-[2rem] glass neumorph flex items-center justify-center mb-6">
              <Trash2 className="size-10 stroke-[2.5]" />
            </div>
            <AlertDialogTitle className="text-3xl font-display font-black tracking-tight">
              ¿Eliminar Tratamiento?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-medium text-red-500/60 pt-4 leading-relaxed">
              Esta acción es irreversible y eliminará el servicio de tu catálogo permanentemente.
            </AlertDialogDescription>
          </div>
          <AlertDialogFooter className="p-10 flex flex-row gap-4 bg-card/20">
            <AlertDialogCancel className="flex-1 h-16 rounded-[1.5rem] border-none glass hover:bg-card font-bold text-lg mt-0 transition-all">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDeleteService(deleteConfirmId)}
              className="flex-1 h-16 rounded-[1.5rem] bg-red-500 text-white hover:bg-red-600 font-bold text-lg shadow-xl shadow-red-500/20 transition-all"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Service Details Dialog */}
      <Dialog
        open={!!selectedServiceForDetails}
        onOpenChange={(open) => !open && setSelectedServiceForDetails(null)}
      >
        <DialogContent className="max-w-xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden bg-card border-none shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] sm:rounded-[3.5rem] rounded-t-[3.5rem] outline-none w-full !top-auto !bottom-0 !translate-y-0 sm:!top-1/2 sm:!bottom-auto sm:!translate-y-[-50%] sm:!left-1/2 sm:!translate-x-[-50%] h-[90vh] sm:h-auto overflow-y-auto no-scrollbar">
          {selectedServiceForDetails && (
            <div className="flex flex-col">
              {/* Premium Hero Detail Section */}
              <div className="relative h-[220px] sm:h-[300px] bg-[#1D1D1F] overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-white/5 opacity-50" />
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                <div className="absolute top-6 right-6 z-50">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedServiceForDetails(null)}
                    className="rounded-full bg-card/10 backdrop-blur-3xl hover:bg-card/20 size-10 transition-all text-white active:scale-90"
                  >
                    <X className="size-5" />
                  </Button>
                </div>

                <motion.div
                  initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 150, damping: 20 }}
                  className="relative size-32 sm:size-48 rounded-3xl bg-card/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl group"
                >
                  {React.createElement(iconMap[selectedServiceForDetails.category] || Sparkle, {
                    className: 'size-16 sm:size-24 text-primary stroke-[1.25] relative z-10',
                  })}
                </motion.div>

                <div className="absolute bottom-6 left-6">
                  <Badge className="bg-primary/20 text-primary border border-primary/30 py-1.5 px-4 text-[9px] font-black uppercase tracking-[0.2em] rounded-full backdrop-blur-3xl">
                    Exclusividad Atelier
                  </Badge>
                </div>
              </div>

              <div className="px-6 sm:px-12 pt-10 pb-12 space-y-10 bg-card">
                <div className="space-y-6">
                  <div className="flex items-center gap-2.5">
                    <div className="size-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
                      {selectedServiceForDetails.category}
                    </span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-display font-black tracking-tight leading-[0.9] text-foreground">
                    {selectedServiceForDetails.name}.
                  </h2>
                </div>

                {/* Bento Grid Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-[2rem] bg-background border border-border space-y-4 group transition-all">
                    <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30 mb-0.5">
                        Tiempo
                      </p>
                      <p className="text-xl font-display font-black text-foreground">
                        {selectedServiceForDetails.duration} Min
                      </p>
                    </div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-background border border-border space-y-4 group transition-all">
                    <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                      <DollarSign className="size-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30 mb-0.5">
                        Inversión
                      </p>
                      <p className="text-xl font-display font-black text-primary">
                        ${selectedServiceForDetails.price}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-30">
                      Descripción
                    </span>
                    <div className="h-px flex-1 bg-black/[0.03]" />
                  </div>
                  <p className="text-lg sm:text-xl font-medium text-foreground/80 leading-relaxed font-display">
                    {selectedServiceForDetails.description ||
                      'Un proceso meticuloso diseñado para elevar tu belleza natural al nivel emmenails.'}
                  </p>
                </div>

                <div className="pt-10 flex flex-col sm:flex-row gap-4 border-t border-border">
                  <Button
                    onClick={() => {
                      handleOpenEdit(selectedServiceForDetails);
                      setSelectedServiceForDetails(null);
                    }}
                    className="h-14 flex-1 rounded-2xl bg-[#1D1D1F] text-white hover:bg-primary font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                  >
                    Editar Tratamiento
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedServiceForDetails(null)}
                    className="h-14 flex-1 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-all"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
