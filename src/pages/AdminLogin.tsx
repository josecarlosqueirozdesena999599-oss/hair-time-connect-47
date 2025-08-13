import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings } from "@/lib/supabase-storage";
import { useToast } from "@/hooks/use-toast";
import { Lock, User } from "lucide-react";

const AdminLogin = () => {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("admin_logged_in") === "true"
  );
  const { toast } = useToast();

  if (isLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async () => {
    const settings = await getSettings();
    if (password === settings?.admin_password) {
      localStorage.setItem("admin_logged_in", "true");
      setIsLoggedIn(true);
      toast({
        title: "Login realizado! 🎉",
        description: "Bem-vindo ao painel administrativo",
      });
    } else {
      toast({
        title: "Erro no login ❌",
        description: "Senha incorreta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 bg-card/95 backdrop-blur-sm shadow-elegant">
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground font-heading">
            Acesso Administrativo
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Entre com sua senha para acessar o painel
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-foreground font-medium text-sm sm:text-base">
              Senha
            </Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                className="pl-10 h-12 text-base"
                placeholder="Digite sua senha"
              />
            </div>
          </div>

          <Button
            onClick={handleLogin}
            className="w-full h-12"
            variant="hero"
          >
            Entrar no Painel
          </Button>
        </div>

        <div className="mt-4 sm:mt-6 text-center">
          <Button
            variant="link"
            onClick={() => window.history.back()}
            className="text-muted-foreground text-sm"
          >
            ← Voltar para o agendamento
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;