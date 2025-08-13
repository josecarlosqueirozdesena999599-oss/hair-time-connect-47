import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/DashboardCard";
import { 
  getAppointments, 
  getExpenses, 
  getSettings,
  Appointment,
  Expense,
  BarberShopSettings
} from "@/lib/supabase-storage";
import { Calendar, DollarSign, Scissors, TrendingDown, LogOut, Settings, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminExpenses from "./AdminExpenses";
import AdminSettings from "./AdminSettings";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'expenses' | 'settings'>('dashboard');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<BarberShopSettings | null>(null);
  const { toast } = useToast();

  // Function to refresh all data
  const refreshData = async () => {
    const [appointmentsData, expensesData, settingsData] = await Promise.all([
      getAppointments(),
      getExpenses(),
      getSettings()
    ]);
    
    setAppointments(appointmentsData);
    setExpenses(expensesData);
    setSettings(settingsData);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return <Navigate to="/auth" replace />;
      }
      setUser(user);
      
      // Load data
      const [appointmentsData, expensesData, settingsData] = await Promise.all([
        getAppointments(),
        getExpenses(),
        getSettings()
      ]);
      
      setAppointments(appointmentsData);
      setExpenses(expensesData);
      setSettings(settingsData);
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Calculate today's metrics
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
  const todayRevenue = todayAppointments.reduce((sum, apt) => sum + apt.price, 0);

  // Calculate this month's metrics
  const thisMonth = new Date().toISOString().substring(0, 7);
  const monthAppointments = appointments.filter(apt => apt.appointment_date.startsWith(thisMonth));
  const monthRevenue = monthAppointments.reduce((sum, apt) => sum + apt.price, 0);
  const monthExpenses = expenses
    .filter(exp => exp.expense_date.startsWith(thisMonth))
    .reduce((sum, exp) => sum + exp.amount, 0);
  const monthProfit = monthRevenue - monthExpenses;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado! 👋",
      description: "Até a próxima!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-card">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground font-heading">
              {settings?.name || 'Barbearia Premium'} - Painel
            </h1>
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto">
              <Button
                variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('dashboard')}
                size="sm"
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Dashboard
              </Button>
              <Button
                variant={currentPage === 'expenses' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('expenses')}
                size="sm"
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                <Receipt className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Despesas
              </Button>
              <Button
                variant={currentPage === 'settings' ? 'default' : 'ghost'}
                onClick={() => setCurrentPage('settings')}
                size="sm"
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Config
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                size="sm"
                className="text-xs sm:text-sm whitespace-nowrap"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {currentPage === 'dashboard' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Today's metrics */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 font-heading">
                Hoje ({new Date().toLocaleDateString('pt-BR')})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <DashboardCard
                  title="Cortes Hoje"
                  value={todayAppointments.length.toString()}
                  icon={Scissors}
                  color="primary"
                  description={`${todayAppointments.length} agendamento${todayAppointments.length !== 1 ? 's' : ''} para hoje`}
                />
                <DashboardCard
                  title="Faturamento Hoje"
                  value={`R$ ${todayRevenue.toFixed(2)}`}
                  icon={DollarSign}
                  color="success"
                  description="Receita do dia atual"
                />
              </div>
            </section>

            {/* This month's metrics */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 font-heading">
                Este Mês ({new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <DashboardCard
                  title="Faturamento Mensal"
                  value={`R$ ${monthRevenue.toFixed(2)}`}
                  icon={DollarSign}
                  color="success"
                  description={`${monthAppointments.length} cortes realizados`}
                />
                <DashboardCard
                  title="Despesas Mensais"
                  value={`R$ ${monthExpenses.toFixed(2)}`}
                  icon={TrendingDown}
                  color="danger"
                  description="Total gasto no mês"
                />
                <DashboardCard
                  title="Lucro Líquido"
                  value={`R$ ${monthProfit.toFixed(2)}`}
                  icon={Calendar}
                  color={monthProfit >= 0 ? "success" : "danger"}
                  description="Faturamento - Despesas"
                />
              </div>
            </section>

            {/* Recent appointments */}
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 font-heading">
                Agendamentos Recentes
              </h2>
              <div className="bg-card rounded-lg border border-border shadow-card">
                {appointments.slice(-5).reverse().map((appointment, index) => (
                  <div key={appointment.id} className={`p-3 sm:p-4 ${index !== 0 ? 'border-t border-border' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm sm:text-base truncate">{appointment.customer_name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {appointment.service?.name} • {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.appointment_time}
                        </p>
                      </div>
                      <p className="font-semibold text-primary text-sm sm:text-base flex-shrink-0">R$ {appointment.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <div className="p-6 sm:p-8 text-center text-muted-foreground">
                    <p className="text-sm sm:text-base">Nenhum agendamento encontrado</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {currentPage === 'expenses' && (
          <div className="bg-background -m-8">
            <AdminExpenses onDataChange={refreshData} />
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="bg-background -m-8">
            <AdminSettings onDataChange={refreshData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;