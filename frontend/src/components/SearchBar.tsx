
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Search, X, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { searchMedicines, processOCR, Medicine } from "@/hooks/use-api";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchMeds = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchMedicines(query);
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchMeds, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/medicine/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleSelectFromGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCaptureImage = () => {
    if (captureInputRef.current) {
      captureInputRef.current.click();
    }
  };

  const processImage = async (file: File) => {
    setIsCapturing(true);
    try {
      const ocrResult = await processOCR(file); // full object returned
  
      if (ocrResult) {
        // 👇 Pass result via router state
        navigate('/medicine', { state: { ocrMedicine: ocrResult } });
      } else {
        alert("No medicine detected in the image.");
      }
    } catch (error) {
      console.error("OCR processing error:", error);
      alert("Something went wrong while processing the image.");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await processImage(file);
    
    // Reset file input
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleResultClick = (medicineName: string) => {
    navigate(`/medicine?name=${encodeURIComponent(medicineName)}`);
    setShowResults(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Search for a medicine..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="w-full pl-10 pr-12"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={clearSearch}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 ml-1"
                  disabled={isCapturing}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-0" align="end">
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center p-3"
                    onClick={handleSelectFromGallery}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    <span>Select from gallery</span>
                  </Button>
                  <Button
                    variant="ghost" 
                    className="flex justify-start items-center p-3"
                    onClick={handleCaptureImage}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    <span>Take a photo</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        
        <input
          ref={captureInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="hidden"
        />
      </form>

      {/* Search Results */}
      {showResults && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-card rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {results.map((medicine) => (
              <li
                key={medicine.id}
                className="px-4 py-2 hover:bg-accent cursor-pointer text-left"
                onClick={() => handleResultClick(medicine.name)}
              >
                <div className="font-medium">{medicine.name}</div>
                <div className="text-xs text-muted-foreground">{medicine.salt_composition}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {isCapturing && (
        <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
          <span className="text-white text-sm animate-pulse">Processing image...</span>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
