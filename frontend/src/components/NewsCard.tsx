
import { Card, CardContent } from "@/components/ui/card";
import { NewsItem } from "@/hooks/use-api";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  news: NewsItem;
  className?: string;
}

const NewsCard = ({ news, className }: NewsCardProps) => {
  const openArticle = () => {
    window.open(news.url, "_blank", "noopener,noreferrer");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card 
      className={cn("overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]", className)}
      onClick={openArticle}
    >
      <div className="aspect-video relative bg-muted">
        <img 
          src={news.imageUrl} 
          alt={news.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <span className="text-xs text-white/90">{formatDate(news.publishedAt)}</span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{news.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{news.summary}</p>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
