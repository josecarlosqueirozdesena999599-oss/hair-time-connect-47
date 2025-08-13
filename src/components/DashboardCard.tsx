import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "success" | "primary" | "danger" | "muted";
  description?: string;
}

export const DashboardCard = ({ title, value, icon: Icon, color, description }: DashboardCardProps) => {
  const colorClasses = {
    success: "text-success bg-success-light border-success",
    primary: "text-primary bg-primary/10 border-primary",
    danger: "text-danger bg-danger-light border-danger", 
    muted: "text-muted-foreground bg-muted border-muted-foreground"
  };

  return (
    <Card className="p-6 bg-gradient-card hover:shadow-elegant transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1 font-heading">{value}</p>
          {description && (
            <p className="text-muted-foreground text-xs mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};