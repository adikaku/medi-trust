import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookmarkPlus, Languages, Pill, Search, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDiaryEntries, useMedicines, processOCR } from "@/hooks/use-api";
import { useAuth } from "@/contexts/auth-context";
import SearchBar from "@/components/SearchBar";
import type { DiaryEntry, Medicine } from "@/hooks/use-api";

const MedicinePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [medicineToRender, setMedicineToRender] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState("en");
  const [activeTab, setActiveTab] = useState("info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryParams = new URLSearchParams(location.search);
  const medicineName = queryParams.get("name");
  const searchQuery = queryParams.get("q");

  const { medicines } = useMedicines();
  const { addEntry } = useDiaryEntries(user?.id || null);

  const isSearchResults = !medicineName && searchQuery;
  const isDefaultView = !medicineName && !searchQuery && !medicineToRender;

  // Function to handle file selection for OCR
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Process the image with OCR
      const ocrResult = await processOCR(file);
      
      // Convert OCR result to Medicine object
      const medicine: Medicine = {
        id: "ocr-" + Date.now(),
        name: ocrResult.name || "Unknown Medicine",
        sub_category: ocrResult.category || "Uncategorized",
        salt_composition: ocrResult.salt_composition || "Not available",
        medicine_desc: ocrResult.description || "No description available",
        side_effects: ocrResult.side_effects || "No side effects information available",
        price: ocrResult.price || 0,
        manufacturer_name: ocrResult.manufacturer || "Unknown",
        pack_size_label: ocrResult.pack_size || "N/A",
        generic_name: ocrResult.generic_name || "Not available",
        unit_size: ocrResult.unit_size || "N/A",
        mrp: ocrResult.mrp || 0,
      };
      
      setMedicineToRender(medicine);
      toast({
        title: "Medicine Info Retrieved",
        description: `Successfully processed information for ${medicine.name}`,
      });
    } catch (err) {
      console.error("OCR processing error:", err);
      setError("Failed to process medicine information from image");
      toast({
        title: "OCR Processing Failed",
        description: "Could not extract medicine information from image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveToDiary = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to save medicines to your diary",
        variant: "destructive",
      });
      navigate("/login", { state: { from: location } });
      return;
    }

    if (!medicineToRender) return;

    const entry: Omit<DiaryEntry, "id"> = {
      medicineId: medicineToRender.id || "ocr",
      medicineName: medicineToRender.name,
      date: new Date().toISOString(),
      tags: [medicineToRender.sub_category || "Uncategorized"],
      notes: "Added from medicine info page",
    };

    const success = await addEntry(entry);

    if (success) {
      toast({
        title: "Saved to Diary",
        description: `${medicineToRender.name} has been added to your diary`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save to diary",
        variant: "destructive",
      });
    }
  };

  if (isSearchResults) {
    const filteredMedicines = medicines.filter(med => med.name.toLowerCase().includes(searchQuery!.toLowerCase()));

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Search Results for "{searchQuery}"</h1>
            <SearchBar />
          </div>

          {filteredMedicines.length > 0 ? (
            <div className="space-y-4">
              {filteredMedicines.map((med) => (
                <Card key={med.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate(`/medicine?name=${encodeURIComponent(med.name)}`)}>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-medium">{med.name}</h3>
                    <p className="text-sm text-muted-foreground">{med.salt_composition}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline">{med.sub_category}</Badge>
                      <span className="font-semibold">₹{med.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <Search className="h-10 w-10 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No results found</h3>
              <p className="text-muted-foreground">Try a different search term or browse our medicines</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isDefaultView) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-4">Medicine Information</h1>
              <p className="text-muted-foreground">Search for a medicine or scan a package to view details</p>
            </div>
            <div className="max-w-md mx-auto mb-8">
              <SearchBar />
            </div>
            <div className="flex justify-center mb-8">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <Button onClick={handleUploadClick} className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload Medicine Image
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
              
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, idx) => (
              <div key={`skeleton-${idx}`} className="h-4 bg-muted rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !medicineToRender) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Medicine Not Found</h2>
          <p className="mb-6 text-muted-foreground">We couldn't find information for this medicine.</p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("/")}>Return to Home</Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <Button variant="outline" onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Medicine Image
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const splitString = (str: string) => str.split(",").map(item => item.trim());

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            <Button variant="outline" size="sm" onClick={handleUploadClick}>
              <Upload className="mr-2 h-4 w-4" />
              Scan New
            </Button>
            <Button variant="outline" size="sm" onClick={() => setActiveLang(activeLang === "en" ? "hi" : "en")}>
              <Languages className="mr-2 h-4 w-4" />
              {activeLang === "en" ? "Translate" : "English"}
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{medicineToRender.name}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge>{medicineToRender.sub_category}</Badge>
            <Badge variant="outline">₹{medicineToRender.price}</Badge>
            <Badge variant="outline">{medicineToRender.pack_size_label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Manufactured by {medicineToRender.manufacturer_name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
                <TabsTrigger value="composition">Composition</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{medicineToRender.medicine_desc}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="side-effects" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Side Effects</CardTitle>
                    <CardDescription>Possible side effects that may occur</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1">
                      {splitString(medicineToRender.side_effects).map((effect, idx) => (
                        <li key={`${effect}-${idx}`}>{effect}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="composition" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Salt Composition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{medicineToRender.salt_composition}</p>
                    <div className="mt-4">
                      <Button variant="outline" size="sm">
                        <Pill className="mr-2 h-4 w-4" />
                        Compare Salt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            <div className="mt-6">
              <Button size="lg" onClick={handleSaveToDiary}>
                <BookmarkPlus className="mr-2 h-5 w-5" />
                Save to Diary
              </Button>
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Generic Alternatives</CardTitle>
                <CardDescription>Similar medicines at affordable prices</CardDescription>
              </CardHeader>
              <CardContent>
                {medicineToRender.generic_name ? (
                  <div className="space-y-3">
                    <div className="p-3 border rounded-md hover:bg-accent">
                      <div className="font-medium">
                        {medicineToRender.generic_name}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-muted-foreground">
                          {medicineToRender.unit_size}
                        </span>
                        <span className="font-semibold text-accent-foreground">
                          ₹{medicineToRender.mrp}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No generic alternatives found.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicinePage;