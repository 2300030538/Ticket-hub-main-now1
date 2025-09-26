import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download, Share2, Calendar, MapPin, Clock } from "lucide-react";

interface TicketDisplayProps {
  booking: {
    id: string;
    event: any;
    seats: string[];
    totalPrice: number;
    bookingDate: string;
  };
}

export const TicketDisplay = ({ booking }: TicketDisplayProps) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground">Your digital tickets are ready</p>
      </div>

      <Card className="overflow-hidden bg-gradient-card border-border">
        <div className="bg-gradient-primary p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold">{booking.event.title}</h3>
              <p className="opacity-90">{booking.event.venue}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-75">Booking ID</p>
              <p className="font-mono font-semibold">{booking.id}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{booking.event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{booking.event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{booking.event.venue}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seats</p>
                <div className="flex flex-wrap gap-2">
                  {booking.seats.map((seat) => (
                    <span key={seat} className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold">
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-accent">${booking.totalPrice}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Booked On</p>
                <p className="text-foreground">{booking.bookingDate}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-lg mb-4">
                <QrCode className="w-32 h-32 text-black" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Show this QR code at the venue for entry
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="flex-1" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button className="flex-1" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Tickets
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};