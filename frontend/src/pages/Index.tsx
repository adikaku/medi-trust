
import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import SearchBar from "@/components/SearchBar";
import NewsCard from "@/components/NewsCard";
import Logo from "@/components/Logo";
import { useLatestNews } from "@/hooks/use-api";

const Index = () => {
  const { news, loading: newsLoading } = useLatestNews();
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePharmacyButtonClick = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header Section */}
      <section className="mb-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-3">
          <Logo size="lg" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            MediTrust
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Your One-Stop Diary for Affordable Medicine Info
        </p>
      </section>

      {/* Search Section */}
      <section className="mb-10 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Find Medicine Information</h2>
            <SearchBar />
            <p className="mt-3 text-sm text-muted-foreground">
              Search by medicine name or use camera to scan medicine packaging
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Pharmacy Button */}
      <section className="mb-10 max-w-2xl mx-auto">
        <Link to="/pharmacy">
          <Button 
            className={`w-full py-6 bg-accent hover:bg-accent/90 text-accent-foreground group ${isAnimating ? 'scale-[0.98]' : ''}`}
            onClick={handlePharmacyButtonClick}
          >
            <MapPin className="mr-2 h-5 w-5 group-hover:text-primary" />
            <span className="text-lg">Jan Aushadhi Kendra Near Me</span>
          </Button>
        </Link>
      </section>

      {/* News Section */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Latest Medical News</h2>
          <Link to="/news" className="text-primary text-sm hover:underline">
            View All
          </Link>
        </div>
        <Separator className="mb-6" />
        
        {newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-full mb-1"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {news.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
