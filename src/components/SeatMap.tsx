import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  onSeatSelection: (seats: string[]) => void;
}

export const SeatMap = ({ onSeatSelection }: SeatMapProps) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;
  
  const unavailableSeats = ["A5", "A6", "C3", "C8", "E7", "F2", "F9"];

  const toggleSeat = (seatId: string) => {
    if (unavailableSeats.includes(seatId)) return;
    
    const newSelectedSeats = selectedSeats.includes(seatId)
      ? selectedSeats.filter(id => id !== seatId)
      : [...selectedSeats, seatId];
    
    setSelectedSeats(newSelectedSeats);
    onSeatSelection(newSelectedSeats);
  };

  const getSeatStatus = (seatId: string) => {
    if (unavailableSeats.includes(seatId)) return "unavailable";
    if (selectedSeats.includes(seatId)) return "selected";
    return "available";
  };

  const getSeatClassName = (status: string) => {
    switch (status) {
      case "selected":
        return "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow";
      case "unavailable":
        return "bg-muted text-muted-foreground cursor-not-allowed";
      default:
        return "bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-full h-4 bg-gradient-primary rounded-t-lg mb-4"></div>
        <p className="text-sm text-muted-foreground">SCREEN</p>
      </div>
      
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row} className="flex items-center justify-center gap-2">
            <span className="w-8 text-center font-semibold text-foreground">{row}</span>
            {Array.from({ length: seatsPerRow }, (_, i) => {
              const seatNumber = i + 1;
              const seatId = `${row}${seatNumber}`;
              const status = getSeatStatus(seatId);
              
              return (
                <Button
                  key={seatId}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 text-xs transition-all duration-200",
                    getSeatClassName(status)
                  )}
                  onClick={() => toggleSeat(seatId)}
                  disabled={status === "unavailable"}
                >
                  {seatNumber}
                </Button>
              );
            })}
          </div>
        ))}
      </div>
      
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-secondary rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-muted rounded"></div>
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  );
};