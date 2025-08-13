import { Card } from "@/components/ui/card";
import { Service } from "@/lib/supabase-storage";
import { cn } from "@/lib/utils";
import { Clock, Scissors } from "lucide-react";

interface ServiceCardProps {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}

export const ServiceCard = ({ service, selected, onSelect }: ServiceCardProps) => {
  return (
    <Card 
      className={cn(
        "p-4 cursor-pointer transition-all duration-300 hover:shadow-md bg-card min-h-[80px] active:scale-[0.98]",
        selected ? "border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5" : "border-border hover:border-primary/30"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Scissors className="w-4 h-4 text-primary flex-shrink-0" />
            <h3 className="font-semibold text-foreground font-heading text-base truncate">
              {service.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{service.duration} min</span>
          </div>
        </div>
        <div className="text-right ml-3 flex-shrink-0">
          <p className="text-lg font-bold text-primary">
            R$ {service.price.toFixed(2)}
          </p>
        </div>
      </div>
    </Card>
  );
};