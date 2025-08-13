import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  getSettings, 
  updateSettings, 
  getServices, 
  createService, 
  updateService,
  deleteService as deleteSupabaseService,
  BarberShopSettings, 
  Service 
} from "@/lib/supabase-storage";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = ({ onDataChange }: { onDataChange?: () => void }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<BarberShopSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState({ name: "", price: "", duration: "" });
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return <Navigate to="/auth" replace />;
      }
      setUser(user);
      
      const [settingsData, servicesData] = await Promise.all([
        getSettings(),
        getServices()
      ]);
      
      setSettings(settingsData);
      setServices(servicesData);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !settings) {
    return <Navigate to="/auth" replace />;
  }

  const weekDays = [
    { id: "monday", label: "Segunda-feira" },
    { id: "tuesday", label: "Terça-feira" },
    { id: "wednesday", label: "Quarta-feira" },
    { id: "thursday", label: "Quinta-feira" },
    { id: "friday", label: "Sexta-feira" },
    { id: "saturday", label: "Sábado" },
    { id: "sunday", label: "Domingo" }
  ];

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    const success = await updateSettings({
      name: settings.name,
      whatsapp: settings.whatsapp,
      admin_password: settings.admin_password,
      available_days: settings.available_days,
      slots_per_day: settings.slots_per_day,
      slots_per_hour: settings.slots_per_hour,
      working_hours_start: settings.working_hours_start,
      working_hours_end: settings.working_hours_end
    });

    if (success) {
      toast({
        title: "Configurações salvas! ✅",
        description: "As alterações foram aplicadas com sucesso",
      });

      // Notify parent component to refresh data
      onDataChange?.();
    } else {
      toast({
        title: "Erro ❌",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    }
  };

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.duration) {
      toast({
        title: "Erro ❌",
        description: "Preencha todos os campos do serviço",
        variant: "destructive",
      });
      return;
    }

    const success = await createService({
      name: newService.name,
      price: parseFloat(newService.price),
      duration: parseInt(newService.duration)
    });

    if (success) {
      const servicesData = await getServices();
      setServices(servicesData);
      setNewService({ name: "", price: "", duration: "" });

      toast({
        title: "Serviço adicionado! ✅",
        description: `${newService.name} foi adicionado com sucesso`,
      });
    } else {
      toast({
        title: "Erro ❌",
        description: "Erro ao adicionar serviço",
        variant: "destructive",
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    const success = await deleteSupabaseService(serviceId);
    if (success) {
      const servicesData = await getServices();
      setServices(servicesData);

      toast({
        title: "Serviço removido! 🗑️",
        description: "O serviço foi excluído com sucesso",
      });
    } else {
      toast({
        title: "Erro ❌",
        description: "Erro ao remover serviço",
        variant: "destructive",
      });
    }
  };

  const handleUpdateService = async (serviceId: string, field: keyof Service, value: any) => {
    const updateData: Partial<Service> = {};
    if (field === 'price') {
      updateData.price = parseFloat(value) || 0;
    } else if (field === 'duration') {
      updateData.duration = parseInt(value) || 0;
    } else if (field === 'name') {
      updateData.name = value;
    }

    const success = await updateService(serviceId, updateData);
    if (success) {
      const servicesData = await getServices();
      setServices(servicesData);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold text-foreground font-heading">
              Configurações do Estabelecimento
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Basic Settings */}
        <Card className="p-6 bg-gradient-card">
          <h2 className="text-xl font-semibold text-foreground mb-4 font-heading">
            Informações Básicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shopName">Nome do Estabelecimento</Label>
              <Input
                id="shopName"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Barbearia Premium"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp (com código do país)</Label>
              <Input
                id="whatsapp"
                value={settings.whatsapp}
                onChange={(e) => setSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="Ex: 5511999999999"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha de Acesso</Label>
                <Input
                  id="password"
                  type="password"
                  value={settings.admin_password}
                  onChange={(e) => setSettings(prev => ({ ...prev, admin_password: e.target.value }))}
                  placeholder="Nova senha"
                />
            </div>
          </div>
        </Card>

        {/* Working Hours & Capacity */}
        <Card className="p-6 bg-gradient-card">
          <h2 className="text-xl font-semibold text-foreground mb-4 font-heading">
            Horário de Funcionamento e Capacidade
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="startTime">Horário de Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={settings.working_hours_start}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    working_hours_start: e.target.value
                  }))}
                />
            </div>
            <div>
              <Label htmlFor="endTime">Horário de Término</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={settings.working_hours_end}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    working_hours_end: e.target.value
                  }))}
                />
            </div>
            <div>
              <Label htmlFor="slotsPerDay">Vagas por Dia</Label>
                <Input
                  id="slotsPerDay"
                  type="number"
                  value={settings.slots_per_day}
                  onChange={(e) => setSettings(prev => ({ ...prev, slots_per_day: parseInt(e.target.value) || 0 }))}
                />
            </div>
            <div>
              <Label htmlFor="slotsPerHour">Vagas por Hora</Label>
                <Input
                  id="slotsPerHour"
                  type="number"
                  value={settings.slots_per_hour}
                  onChange={(e) => setSettings(prev => ({ ...prev, slots_per_hour: parseInt(e.target.value) || 0 }))}
                />
            </div>
          </div>
        </Card>

        {/* Available Days */}
        <Card className="p-6 bg-gradient-card">
          <h2 className="text-xl font-semibold text-foreground mb-4 font-heading">
            Dias Disponíveis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weekDays.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={settings.available_days.includes(day.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSettings(prev => ({ 
                          ...prev, 
                          available_days: [...prev.available_days, day.id]
                        }));
                      } else {
                        setSettings(prev => ({ 
                          ...prev, 
                          available_days: prev.available_days.filter(d => d !== day.id)
                        }));
                      }
                    }}
                  />
                <Label htmlFor={day.id} className="text-sm">{day.label}</Label>
              </div>
            ))}
          </div>
        </Card>

        {/* Services Management */}
        <Card className="p-6 bg-gradient-card">
          <h2 className="text-xl font-semibold text-foreground mb-4 font-heading">
            Gerenciar Serviços
          </h2>
          
          {/* Add new service */}
          <div className="border border-border rounded-lg p-4 mb-6 bg-muted/30">
            <h3 className="font-medium text-foreground mb-3">Adicionar Novo Serviço</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Nome do serviço"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Preço (R$)"
                value={newService.price}
                onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Duração (min)"
                value={newService.duration}
                onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
              />
            </div>
            <Button onClick={handleAddService} className="mt-3" variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Serviço
            </Button>
          </div>

          {/* Services list */}
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <Input
                    value={service.name}
                    onChange={(e) => handleUpdateService(service.id, 'name', e.target.value)}
                    placeholder="Nome do serviço"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={service.price}
                    onChange={(e) => handleUpdateService(service.id, 'price', e.target.value)}
                    placeholder="Preço"
                  />
                  <Input
                    type="number"
                    value={service.duration}
                    onChange={(e) => handleUpdateService(service.id, 'duration', e.target.value)}
                    placeholder="Duração (min)"
                  />
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteService(service.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button onClick={handleSaveSettings} variant="hero" size="xl">
            <Save className="w-5 h-5 mr-2" />
            Salvar Todas as Configurações
          </Button>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;