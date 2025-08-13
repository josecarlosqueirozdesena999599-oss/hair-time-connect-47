import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimeSlotCard } from "@/components/TimeSlotCard";
import { ServiceCard } from "@/components/ServiceCard";
import { 
  getServices, 
  getSettings, 
  generateTimeSlots, 
  isSlotAvailable, 
  createAppointment,
  Service,
  BarberShopSettings
} from "@/lib/supabase-storage";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Phone, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<BarberShopSettings | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesData, settingsData] = await Promise.all([
          getServices(),
          getSettings()
        ]);
        
        setServices(servicesData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Erro ao carregar dados ❌",
          description: "Tente recarregar a página",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Generate next 7 days
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        day: '2-digit', 
        month: '2-digit' 
      })
    };
  });

  useEffect(() => {
    if (selectedDate) {
      const loadSlots = async () => {
        try {
          const slots = await generateTimeSlots(selectedDate);
          setAvailableSlots(slots);
        } catch (error) {
          console.error('Error loading slots:', error);
          toast({
            title: "Erro ao carregar horários ❌",
            description: "Tente selecionar outra data",
            variant: "destructive",
          });
        }
      };

      loadSlots();
    }
  }, [selectedDate, toast]);

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !customerName.trim()) {
      toast({
        title: "Dados incompletos ❌",
        description: "Preencha todos os campos para agendar",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save appointment to Supabase
      const success = await createAppointment({
        customer_name: customerName.trim(),
        service_id: selectedService.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        price: selectedService.price
      });

      if (!success) {
        throw new Error('Failed to create appointment');
      }

    // Create WhatsApp message
    const formattedDate = new Date(selectedDate).toLocaleDateString('pt-BR');
    const message = `🔥 *NOVO AGENDAMENTO* 🔥\n\n` +
      `👤 *Cliente:* ${customerName}\n` +
      `✂️ *Serviço:* ${selectedService.name}\n` +
      `📅 *Data:* ${formattedDate}\n` +
      `⏰ *Horário:* ${selectedTime}\n` +
      `💰 *Valor:* R$ ${selectedService.price.toFixed(2)}\n\n` +
      `📱 Agendamento realizado pelo sistema online!\n` +
      `✅ Confirme sua presença por favor.`;

      const whatsappUrl = `https://wa.me/${settings?.whatsapp}?text=${encodeURIComponent(message)}`;
      
      // Open WhatsApp
      window.open(whatsappUrl, '_blank');

      // Reset form
      setSelectedService(null);
      setSelectedDate("");
      setSelectedTime("");
      setCustomerName("");
      setAvailableSlots([]);

      toast({
        title: "Agendamento realizado! 🎉",
        description: "Você será redirecionado para o WhatsApp",
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro ao agendar ❌",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Mobile Layout */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-bold font-heading flex-1 pr-2">
                {settings?.name || 'Barbearia Premium'}
              </h1>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary font-medium backdrop-blur-sm">
                  <User className="w-4 h-4 mr-1" />
                  Login
                </Button>
              </Link>
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Agendamento Online - Rápido e Fácil
            </p>
            <p className="text-primary-foreground/60 text-xs mt-1">
              Usuários não precisam de login
            </p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-2">
                {settings?.name || 'Barbearia Premium'}
              </h1>
              <p className="text-primary-foreground/80 text-base sm:text-lg">
                Agendamento Online - Rápido e Fácil
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="text-primary-foreground/70 text-sm text-right">
                Usuários não precisam de login
              </p>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground hover:text-primary font-medium backdrop-blur-sm">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-safe">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
            <p className="mt-6 text-muted-foreground text-lg">Carregando...</p>
          </div>
        ) : (
        <div className="space-y-4">
          {/* Step 1 - Select Service */}
          {!selectedService && (
            <Card className="p-4 sm:p-6 bg-card shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground font-heading">
                  Escolha o Serviço
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    selected={selectedService?.id === service.id}
                    onSelect={() => setSelectedService(service)}
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Step 2 - Select Date */}
          {selectedService && !selectedDate && (
            <Card className="p-4 sm:p-6 bg-card shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground font-heading">
                  Escolha a Data
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {next7Days.map((day) => (
                  <Button
                    key={day.date}
                    variant={selectedDate === day.date ? "default" : "outline"}
                    onClick={() => setSelectedDate(day.date)}
                    className="h-auto p-3 flex flex-col text-sm font-medium"
                  >
                    <Calendar className="w-4 h-4 mb-1" />
                    <span className="text-xs leading-tight">{day.label}</span>
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Step 3 - Select Time */}
          {selectedService && selectedDate && !selectedTime && (
            <Card className="p-4 sm:p-6 bg-card shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground font-heading">
                  Escolha o Horário
                </h2>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.length === 0 && selectedDate ? (
                  <div className="col-span-full text-center py-8">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Carregando horários...</p>
                  </div>
                ) : (
                  availableSlots.map((slot) => (
                    <TimeSlotCard
                      key={slot.id}
                      time={slot.time}
                      available={slot.available}
                      selected={selectedTime === slot.time}
                      onSelect={() => setSelectedTime(slot.time)}
                    />
                  ))
                )}
              </div>
            </Card>
          )}

          {/* Step 4 - Customer Details */}
          {selectedService && selectedDate && selectedTime && (
            <Card className="p-4 sm:p-6 bg-card shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  4
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-foreground font-heading">
                  Seus Dados
                </h2>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName" className="text-foreground font-medium text-sm sm:text-base">
                    Nome Completo *
                  </Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="customerName"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="pl-12 h-12 text-base"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Summary - Shows after all selections on mobile */}
          {selectedService && selectedDate && selectedTime && customerName && (
            <Card className="p-4 sm:p-6 bg-card shadow-lg border-2 border-primary/20">
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 font-heading">
                📋 Resumo do Agendamento
              </h2>
              
              <div className="space-y-3">
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Serviço</p>
                  <p className="font-semibold text-foreground text-sm">{selectedService.name}</p>
                  <p className="text-primary font-bold text-base">R$ {selectedService.price.toFixed(2)}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-semibold text-foreground text-sm">
                      {new Date(selectedDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground">Horário</p>
                    <p className="font-semibold text-foreground text-sm">{selectedTime}</p>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-foreground text-sm">{customerName}</p>
                </div>
                
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-base font-semibold text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">
                      R$ {selectedService.price.toFixed(2)}
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleBooking}
                    className="w-full h-14 text-base font-semibold"
                    variant="hero"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    🚀 Agendar via WhatsApp
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Compact summary for partial selections */}
          {selectedService && !(selectedDate && selectedTime && customerName) && (
            <Card className="p-4 bg-card shadow-md border border-primary/10">
              <h3 className="text-sm font-medium text-foreground mb-3 opacity-75">
                Resumo Parcial
              </h3>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Serviço:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-primary">R$ {selectedService.price.toFixed(2)}</span>
                </div>
                
                {selectedDate && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Data:</span>
                    <span className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </div>
                )}
                
                {selectedTime && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Horário:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
        )}
      </main>
    </div>
  );
};

export default Index;