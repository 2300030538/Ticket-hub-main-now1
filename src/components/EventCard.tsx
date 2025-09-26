import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Clock } from "lucide-react";

interface Event {
  id: string;
  title: string;
  venue: string;
  date: string;
  time: string;
  price: number;
  image: string;
  category: string;
  availability: string;
}

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export const EventCard = ({ event, onClick }: EventCardProps) => {
  return (
    <Card className="group overflow-hidden bg-gradient-card border-border hover:shadow-elegant transition-all duration-300 hover:scale-105 cursor-pointer">
      <div className="relative overflow-hidden" onClick={onClick}>
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
          {event.category}
        </Badge>
        <Badge 
          variant={event.availability === "Available" ? "default" : "destructive"}
          className="absolute top-3 right-3"
        >
          {event.availability}
        </Badge>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors">
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={16} />
            <span className="text-sm">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} />
            <span className="text-sm">{event.date}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span className="text-sm">{event.time}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">Starting from</span>
            <div className="text-2xl font-bold text-accent">${event.price}</div>
          </div>
          <Button 
            onClick={onClick}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            Book Now
          </Button>
        </div>
      </div>
    </Card>
  );
};