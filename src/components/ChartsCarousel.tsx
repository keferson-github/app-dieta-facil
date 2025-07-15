import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface ChartsCarouselProps {
  items: CarouselItem[];
  className?: string;
}

const ChartsCarousel = ({ items, className }: ChartsCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => prev === 0 ? items.length - 1 : prev - 1);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex(prev => (prev + 1) % items.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;
    
    if (Math.abs(diff) > swipeThreshold) {
      setIsAutoPlaying(false);
      if (diff > 0) {
        // Swipe left - next
        setCurrentIndex(prev => (prev + 1) % items.length);
      } else {
        // Swipe right - previous
        setCurrentIndex(prev => prev === 0 ? items.length - 1 : prev - 1);
      }
    }
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (items.length === 0) return null;

  return (
    <div className={cn("relative w-full", className)}>
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {items.map((item, index) => (
            <div
              key={item.id}
              className="w-full flex-shrink-0"
            >
              <Card 
                className="glass-effect border border-purple-200/50 dark:border-purple-700/50 shadow-health h-full rounded-[10px]"
                style={{
                  borderImage: 'linear-gradient(135deg, rgb(147 51 234 / 0.3), rgb(168 85 247 / 0.3), rgb(196 181 253 / 0.3)) 1',
                  borderRadius: '10px'
                }}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-primary-dark flex items-center justify-between">
                    {item.title}
                    <div className="flex items-center gap-1">
                      {items.length > 1 && (
                        <span className="text-xs text-secondary-dark bg-health-50 dark:bg-health-900/20 px-2 py-1 rounded-full">
                          {index + 1} de {items.length}
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {item.content}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows - Only show on larger screens */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-lg h-8 w-8 p-0 rounded-full hidden sm:flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-lg h-8 w-8 p-0 rounded-full hidden sm:flex"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {items.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-health-500 scale-125"
                  : "bg-health-300 hover:bg-health-400"
              )}
            />
          ))}
        </div>
      )}

      {/* Auto-play indicator */}
      {items.length > 1 && isAutoPlaying && (
        <div className="absolute top-4 right-4 bg-health-500/20 backdrop-blur-sm rounded-full px-2 py-1">
          <div className="w-1.5 h-1.5 bg-health-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default ChartsCarousel;
