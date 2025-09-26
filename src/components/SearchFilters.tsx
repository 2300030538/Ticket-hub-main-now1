import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface SearchFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

export const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedLocation,
  setSelectedLocation,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-4 p-6 bg-gradient-card rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-semibold text-foreground">Find Your Event</h3>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search events, artists, venues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background border-border focus:ring-accent"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="concert">Concerts</SelectItem>
            <SelectItem value="movie">Movies</SelectItem>
            <SelectItem value="sports">Sports</SelectItem>
            <SelectItem value="theater">Theater</SelectItem>
            <SelectItem value="comedy">Comedy</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            <SelectItem value="new-york">New York</SelectItem>
            <SelectItem value="los-angeles">Los Angeles</SelectItem>
            <SelectItem value="chicago">Chicago</SelectItem>
            <SelectItem value="miami">Miami</SelectItem>
            <SelectItem value="seattle">Seattle</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline"
        onClick={() => {
          setSearchTerm("");
          setSelectedCategory("all");
          setSelectedLocation("all");
        }}
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  );
};