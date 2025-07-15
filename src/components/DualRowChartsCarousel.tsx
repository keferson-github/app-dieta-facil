import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CarouselItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface DualRowChartsCarouselProps {
  topRowItems: CarouselItem[];
  bottomRowItems: CarouselItem[];
}

const DualRowChartsCarousel = ({ topRowItems, bottomRowItems }: DualRowChartsCarouselProps) => {
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  const handleTopScroll = () => {
    if (topScrollRef.current) {
      const scrollLeft = topScrollRef.current.scrollLeft;
      const cardWidth = topScrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setTopIndex(newIndex);
    }
  };

  const handleBottomScroll = () => {
    if (bottomScrollRef.current) {
      const scrollLeft = bottomScrollRef.current.scrollLeft;
      const cardWidth = bottomScrollRef.current.offsetWidth;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setBottomIndex(newIndex);
    }
  };

  useEffect(() => {
    const topContainer = topScrollRef.current;
    const bottomContainer = bottomScrollRef.current;
    
    if (topContainer) {
      topContainer.addEventListener('scroll', handleTopScroll);
    }
    if (bottomContainer) {
      bottomContainer.addEventListener('scroll', handleBottomScroll);
    }
    
    return () => {
      if (topContainer) {
        topContainer.removeEventListener('scroll', handleTopScroll);
      }
      if (bottomContainer) {
        bottomContainer.removeEventListener('scroll', handleBottomScroll);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary-dark mb-2">
          📊 Seus Dados e Progresso
        </h3>
        <p className="text-sm text-secondary-dark">
          Acompanhe sua evolução com gráficos detalhados
        </p>
      </div>

      {/* Top Row Carousel */}
      <div className="relative">
        <div 
          ref={topScrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topRowItems.map((item) => (
            <Card 
              key={item.id}
              className="min-w-full snap-start glass-effect border border-purple-200/50 dark:border-purple-700/50 shadow-sm hover:shadow-md transition-shadow"
              style={{
                borderImage: 'linear-gradient(135deg, rgb(147 51 234 / 0.3), rgb(168 85 247 / 0.3)) 1'
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-primary-dark">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="w-full h-64">
                  {item.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Row Indicators */}
        <div className="flex justify-center gap-2 mt-2">
          {topRowItems.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === topIndex ? 'bg-health-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Row Carousel */}
      <div className="relative">
        <div 
          ref={bottomScrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {bottomRowItems.map((item) => (
            <Card 
              key={item.id}
              className="min-w-full snap-start glass-effect border border-orange-200/50 dark:border-orange-700/50 shadow-sm hover:shadow-md transition-shadow"
              style={{
                borderImage: 'linear-gradient(135deg, rgb(245 158 11 / 0.3), rgb(251 146 60 / 0.3)) 1'
              }}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-primary-dark">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="w-full h-64">
                  {item.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Row Indicators */}
        <div className="flex justify-center gap-2 mt-2">
          {bottomRowItems.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === bottomIndex ? 'bg-health-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DualRowChartsCarousel;
