import { formatDate } from "../utils/date-utils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Download, 
  FileDown, 
  Filter, 
  Pill, 
  Plus, 
  Search, 
  X 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { DiaryEntry, useDiaryEntries } from "@/hooks/use-api";
import { useToast } from "@/hooks/use-toast";

const DiaryPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { entries, loading } = useDiaryEntries(user?.id || null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEntries, setFilteredEntries] = useState<DiaryEntry[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "recent" | "tagged">("all");
  
  console.log("🔍 useAuth() output:", user, isAuthenticated);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate("/login", { state: { from: { pathname: "/diary" } } });
    }
  }, [isAuthenticated, loading, navigate]);
  
  // Filter entries based on search and tags
  useEffect(() => {
    if (entries.length === 0) {
      setFilteredEntries([]);
      return;
    }
    
    let filtered = [...entries];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (entry) =>
          entry.medicineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((entry) =>
        selectedTags.some((tag) => entry.tags.includes(tag))
      );
    }
    
    // Apply tab filter
    if (activeTab === "recent") {
      // Sort by date descending and get top 5
      filtered = [...filtered]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    }
    
    setFilteredEntries(filtered);
  }, [entries, searchQuery, selectedTags, activeTab]);
  
  // Get all unique tags from entries
  const allTags = Array.from(
    new Set(entries.flatMap((entry) => entry.tags))
  ).sort();
  
  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };
  
  const handleExport = (format: "pdf" | "csv") => {
    toast({
      title: "Export Initiated",
      description: `Your diary is being exported in ${format.toUpperCase()} format`,
    });
    
    // Mock export functionality
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Your diary has been exported as ${format.toUpperCase()}`,
      });
    }, 2000);
  };
  

  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Personal Health Diary</h1>
            <p className="text-muted-foreground">
              Track your medicine usage and find affordable alternatives
            </p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>PDF Document</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <Download className="mr-2 h-4 w-4" />
                    <span>CSV Spreadsheet</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Search & Filter</CardTitle>
                <CardDescription>
                  Find entries by name or filter by tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search medicines..."
                    className="pl-9 pr-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-7 w-7"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Filter by Tags</h4>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={clearFilters}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allTags.length > 0 ? (
                      allTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleTagToggle(tag)}
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags available</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Diary Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Entries</span>
                    <span className="font-medium">{entries.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as "all" | "recent" | "tagged")}>
                  <div className="flex items-center justify-between">
                    <TabsList>
                      <TabsTrigger value="all">All Entries</TabsTrigger>
                      <TabsTrigger value="recent">Recent</TabsTrigger>
                      <TabsTrigger value="tagged">Tagged</TabsTrigger>
                    </TabsList>
                    
                    {/* <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Entry
                    </Button>*/}
                  </div>
                </Tabs>
              </CardHeader>
              
              <CardContent>
                {loading ? (
                  // Loading skeleton
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border rounded-lg animate-pulse">
                        <div className="h-5 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-muted rounded w-1/4 mb-3"></div>
                        <div className="h-4 bg-muted rounded w-full mb-2"></div>
                        <div className="h-4 bg-muted rounded w-5/6"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredEntries.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEntries.map((entry) => (
                      <DiaryEntryCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No entries found</h3>
                    <p className="text-muted-foreground mb-6">
                      {entries.length === 0
                        ? "Your diary is empty. Add medicines to keep track of them."
                        : "No entries match your current filters. Try adjusting your search."}
                    </p>
                    {/*{entries.length === 0 && (
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add First Entry
                      </Button> 
                    )} */}
                    {entries.length > 0 && (
                      <Button variant="outline" onClick={clearFilters}>
                        <Filter className="mr-2 h-4 w-4" />
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

interface DiaryEntryCardProps {
  entry: DiaryEntry;
}

const DiaryEntryCard = ({ entry }: DiaryEntryCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/medicine?name=${encodeURIComponent(entry.medicineName)}`);
  };
  
  
  
  return (
    <div 
      className="p-4 border rounded-lg hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-colors"
      onClick={handleCardClick}
    >
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-lg">{entry.medicineName}</h3>
        <div className="flex items-center text-muted-foreground text-sm">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          {formatDate(entry.date)}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mb-2">
        {entry.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
      
      {entry.notes && (
        <p className="text-sm text-muted-foreground">{entry.notes}</p>
      )}
    </div>
  );
};

export default DiaryPage;