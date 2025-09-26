import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CreditCard, User, Mail, Phone } from "lucide-react";
import { useState } from "react";

interface BookingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  selectedSeats: string[];
  totalPrice: number;
  onBookingComplete: () => void;
}

export const BookingModal = ({
  open,
  onOpenChange,
  event,
  selectedSeats,
  totalPrice,
  onBookingComplete,
}: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate booking process
    setTimeout(() => {
      onBookingComplete();
      onOpenChange(false);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-foreground">Complete Your Booking</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-gradient-card p-4 rounded-lg border border-border">
            <h3 className="font-semibold text-foreground mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event:</span>
                <span className="text-foreground">{event?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time:</span>
                <span className="text-foreground">{event?.date} at {event?.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats:</span>
                <span className="text-foreground">{selectedSeats.join(", ")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="text-foreground">{selectedSeats.length} ticket(s)</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-foreground">Total:</span>
                <span className="text-accent">${totalPrice}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  required
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    required
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 text-lg py-6"
            >
              Complete Booking - ${totalPrice}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};