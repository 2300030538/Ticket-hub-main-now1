import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventCard } from "@/components/EventCard";
import { SearchFilters } from "@/components/SearchFilters";
import { SeatMap } from "@/components/SeatMap";
import { BookingModal } from "@/components/BookingModal";
import { TicketDisplay } from "@/components/TicketDisplay";
import { Separator } from "@/components/ui/separator";
import { Ticket, Star, MapPin, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

// Import event images
import concertImage from "@/assets/concert-image.jpg";
import movieImage from "@/assets/movie-image.jpg";
import sportsImage from "@/assets/sports-image.jpg";
import theaterImage from "@/assets/theater-image.jpg";

const events = [
  {
    id: "1",
    title: "Rock Legends Live",
    venue: "Madison Square Garden",
    date: "Dec 15, 2024",
    time: "8:00 PM",
    price: 89,
    image: concertImage,
    category: "concert",
    availability: "Available"
  },
  {
    id: "2",
    title: "Avengers: Secret Wars",
    venue: "AMC Empire 25",
    date: "Dec 20, 2024",
    time: "7:30 PM",
    price: 15,
    image: movieImage,
    category: "movie",
    availability: "Available"
  },
  {
    id: "3",
    title: "NBA Finals Game 7",
    venue: "Staples Center",
    date: "Jun 18, 2025",
    time: "9:00 PM",
    price: 250,
    image: sportsImage,
    category: "sports",
    availability: "Limited"
  },
  {
    id: "4",
    title: "Hamilton - Broadway",
    venue: "Richard Rodgers Theatre",
    date: "Jan 5, 2025",
    time: "8:00 PM",
    price: 125,
    image: theaterImage,
    category: "theater",
    availability: "Available"
  },
];

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showSeatMap, setShowSeatMap] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState<any>(null);
  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowSeatMap(true);
  };

  const handleSeatSelection = (seats: string[]) => {
    setSelectedSeats(seats);
  };

  const handleProceedToBooking = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "Please select seats",
        description: "You need to select at least one seat to proceed.",
        variant: "destructive"
      });
      return;
    }
    setShowSeatMap(false);
    setShowBooking(true);
  };

  const handleBookingComplete = () => {
    const newBooking = {
      id: `BK${Date.now()}`,
      event: selectedEvent,
      seats: selectedSeats,
      totalPrice: selectedEvent.price * selectedSeats.length,
      bookingDate: new Date().toLocaleDateString()
    };
    setBooking(newBooking);
    setShowBooking(false);
    setShowSeatMap(false);
    setSelectedEvent(null);
    setSelectedSeats([]);
    
    toast({
      title: "Booking Confirmed!",
      description: "Your tickets have been booked successfully.",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (booking) {
    return (
      <div className="min-h-screen bg-background p-6">
        <TicketDisplay booking={booking} />
        <div className="text-center mt-8">
          <Button 
            onClick={() => setBooking(null)}
            variant="outline"
          >
            Book More Tickets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-hero text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-2">
              <Ticket className="w-8 h-8" />
              <h2 className="text-2xl font-bold">TicketHub</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>Welcome, {user?.user_metadata?.full_name || user?.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Gateway to Amazing Events
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Discover and book tickets for concerts, movies, sports, and theater shows
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                <span>Instant Digital Tickets</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                <span>Best Price Guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>Nationwide Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search and Filters */}
        <div className="mb-12">
          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        </div>

        {/* Events Grid */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8">
            Featured Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onClick={() => handleEventClick(event)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      <Dialog open={showSeatMap} onOpenChange={setShowSeatMap}>
        <DialogContent className="max-w-4xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-foreground">
              Select Your Seats - {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="bg-gradient-card p-4 rounded-lg border border-border">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-foreground">{selectedEvent?.venue}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent?.date} at {selectedEvent?.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price per seat</p>
                  <p className="text-2xl font-bold text-accent">${selectedEvent?.price}</p>
                </div>
              </div>
            </div>

            <SeatMap onSeatSelection={handleSeatSelection} />

            <Separator />

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedSeats.length} seat(s)
                </p>
                <p className="text-lg font-semibold text-foreground">
                  Total: ${(selectedEvent?.price || 0) * selectedSeats.length}
                </p>
              </div>
              <Button 
                onClick={handleProceedToBooking}
                disabled={selectedSeats.length === 0}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                Proceed to Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      <BookingModal
        open={showBooking}
        onOpenChange={setShowBooking}
        event={selectedEvent}
        selectedSeats={selectedSeats}
        totalPrice={(selectedEvent?.price || 0) * selectedSeats.length}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
};

export default Index;