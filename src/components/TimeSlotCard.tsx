import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TimeSlotCardProps {
  time: string;
  available: boolean;
  selected: boolean;
  onSelect: () => void;
}

export const TimeSlotCard = ({ time, available, selected, onSelect }: TimeSlotCardProps) => {
  return (
    <Card 
      className={cn(
        "p-3 cursor-pointer transition-all duration-300 min-h-[70px] active:scale-[0.95]",
        available 
          ? selected 
            ? "bg-primary border-primary text-primary-foreground shadow-lg" 
            : "bg-card border-border hover:border-primary/30 hover:shadow-md"
          : "bg-muted/50 border-muted opacity-60 cursor-not-allowed"
      )}
      onClick={available ? onSelect : undefined}
    >
      <div className="text-center h-full flex flex-col justify-center">
        <p className={cn(
          "font-semibold text-base",
          available 
            ? selected 
              ? "text-primary-foreground" 
              : "text-foreground"
            : "text-muted-foreground"
        )}>
          {time}
        </p>
        <p className={cn(
          "text-xs mt-1",
          available 
            ? selected 
              ? "text-primary-foreground/80" 
              : "text-muted-foreground"
            : "text-muted-foreground/60"
        )}>
          {available ? "Livre" : "Ocupado"}
        </p>
      </div>
    </Card>
  );
};