import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  getExpenses, 
  createExpense, 
  deleteExpense as deleteSupabaseExpense, 
  Expense 
} from "@/lib/supabase-storage";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminExpenses = ({ onDataChange }: { onDataChange?: () => void }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split('T')[0]
  });
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return <Navigate to="/auth" replace />;
      }
      setUser(user);
      
      const expensesData = await getExpenses();
      setExpenses(expensesData);
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

  const handleAddExpense = async () => {
    if (!newExpense.description || !newExpense.amount || !newExpense.category) {
      toast({
        title: "Erro ❌",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const success = await createExpense({
      description: newExpense.description,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      expense_date: newExpense.date
    });

    if (success) {
      const expensesData = await getExpenses();
      setExpenses(expensesData);
      setNewExpense({
        description: "",
        amount: "",
        category: "",
        date: new Date().toISOString().split('T')[0]
      });

      toast({
        title: "Despesa adicionada! ✅",
        description: `${newExpense.description} - R$ ${parseFloat(newExpense.amount).toFixed(2)}`,
      });

      // Notify parent component to refresh data
      onDataChange?.();
    } else {
      toast({
        title: "Erro ❌",
        description: "Erro ao adicionar despesa",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const success = await deleteSupabaseExpense(expenseId);
    if (success) {
      const expensesData = await getExpenses();
      setExpenses(expensesData);
      toast({
        title: "Despesa removida! 🗑️",
        description: "A despesa foi excluída com sucesso",
      });

      // Notify parent component to refresh data
      onDataChange?.();
    } else {
      toast({
        title: "Erro ❌",
        description: "Erro ao remover despesa",
        variant: "destructive",
      });
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
              Gerenciar Despesas
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Add new expense */}
        <Card className="p-6 bg-gradient-card">
          <h2 className="text-xl font-semibold text-foreground mb-4 font-heading">
            Adicionar Nova Despesa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                value={newExpense.description}
                onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ex: Energia elétrica"
              />
            </div>
            <div>
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={newExpense.category} onValueChange={(value) => setNewExpense(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="energia">Energia Elétrica</SelectItem>
                  <SelectItem value="agua">Água</SelectItem>
                  <SelectItem value="aluguel">Aluguel</SelectItem>
                  <SelectItem value="produtos">Produtos</SelectItem>
                  <SelectItem value="equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <Button
            onClick={handleAddExpense}
            className="mt-4"
            variant="hero"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Despesa
          </Button>
        </Card>

        {/* Expenses list */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4 font-heading">
            Despesas Registradas
          </h2>
          <div className="space-y-4">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} • {new Date(expense.expense_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-danger text-lg">
                    -R$ {expense.amount.toFixed(2)}
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma despesa registrada ainda
              </div>
            )}
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 bg-gradient-card">
          <h2 className="text-xl font-semibold text-foreground mb-4 font-heading">
            Resumo Financeiro
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-danger-light rounded-lg border border-danger">
              <p className="text-sm text-danger/80 mb-1">Total de Despesas</p>
              <p className="text-2xl font-bold text-danger">
                R$ {expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Despesas Este Mês</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {expenses
                  .filter(exp => exp.expense_date.startsWith(new Date().toISOString().substring(0, 7)))
                  .reduce((sum, exp) => sum + exp.amount, 0)
                  .toFixed(2)
                }
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminExpenses;