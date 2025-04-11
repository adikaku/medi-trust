
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Pharmacy, useNearbyPharmacies } from "@/hooks/use-api";
import { useNavigate } from "react-router-dom";

const PharmacyPage = () => {
  const navigate = useNavigate();
  const { pharmacies, loading } = useNearbyPharmacies();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPharmacies, setFilteredPharmacies] = useState<Pharmacy[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (pharmacies.length > 0) {
      setFilteredPharmacies(pharmacies);
    }
  }, [pharmacies]);

  useEffect(() => {
    const fetchUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            // Default location (Delhi)
            setUserLocation({ lat: 28.6139, lng: 77.2090 });
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        // Default location (Delhi)
        setUserLocation({ lat: 28.6139, lng: 77.2090 });
      }
    };

    fetchUserLocation();

    // Mock map loading
    setTimeout(() => {
      setIsMapLoaded(true);
    }, 1500);
  }, []);

  useEffect(() => {
    if (searchQuery && pharmacies.length) {
      const filtered = pharmacies.filter(
        (pharmacy) =>
          pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pharmacy.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPharmacies(filtered);
    } else {
      setFilteredPharmacies(pharmacies);
    }
  }, [searchQuery, pharmacies]);

  const handlePhoneClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleLocationClick = (pharmacy: Pharmacy) => {
    // In a real app, this would center the map on the selected pharmacy
    console.log(`Navigate to pharmacy: ${pharmacy.name}`);
    
    // Open in Google Maps (for demonstration)
    const url = `https://www.google.com/maps/search/?api=1&query=${pharmacy.location.lat},${pharmacy.location.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Jan Aushadhi Kendra Locator</h1>
        <p className="text-muted-foreground">
          Find government pharmacies with affordable generic medicines near you
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - search and list */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Pharmacies</CardTitle>
              <CardDescription>
                Find pharmacies by name or address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Search pharmacies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">
                {filteredPharmacies.length} pharmacies found
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {loading ? (
              // Loading skeleton
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 bg-muted rounded w-full"></div>
                    </CardFooter>
                  </Card>
                ))
            ) : filteredPharmacies.length > 0 ? (
              filteredPharmacies.map((pharmacy) => (
                <Card key={pharmacy.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{pharmacy.name}</CardTitle>
                    <CardDescription>{pharmacy.address}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary font-normal text-sm flex items-center"
                      onClick={() => handlePhoneClick(pharmacy.phone)}
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {pharmacy.phone}
                    </Button>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleLocationClick(pharmacy)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Show on Map
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No pharmacies found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right side - map */}
        <div className="lg:col-span-2">
          <Card className="h-[70vh] overflow-hidden">
            {!isMapLoaded ? (
              <div className="h-full flex items-center justify-center bg-muted">
                <div className="text-center animate-pulse">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Loading map...</p>
                </div>
              </div>
            ) : (
              <div className="h-full relative">
                <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center">
                  <div className="text-center max-w-md px-4">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-lg font-semibold mb-2">Map Preview</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This is a mock map interface. In a production app, this would
                      integrate with Google Maps API to show real pharmacy locations.
                    </p>
                    <div className="space-x-2">
                      <Badge lat={userLocation?.lat} lng={userLocation?.lng} isUser />
                      {filteredPharmacies.slice(0, 3).map(pharmacy => (
                        <Badge 
                          key={pharmacy.id} 
                          lat={pharmacy.location.lat} 
                          lng={pharmacy.location.lng}
                          name={pharmacy.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// Mock map marker component
const Badge = ({ 
  lat, 
  lng, 
  isUser = false,
  name
}: { 
  lat?: number; 
  lng?: number; 
  isUser?: boolean;
  name?: string;
}) => {
  return (
    <div className="inline-block m-1">
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
        isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
      }`}>
        {isUser ? "You" : name?.split(' ')[0] || "Pharmacy"}
        <span className="text-[0.65rem] ml-1 opacity-70">
          {lat?.toFixed(2)}, {lng?.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default PharmacyPage;
