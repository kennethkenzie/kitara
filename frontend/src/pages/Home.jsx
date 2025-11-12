import React, { useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import ShowCard from '../components/ShowCard';
import { shows } from '../mockData';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const Home = () => {
  const navigate = useNavigate();
  const featuredShows = [shows[12], shows[0], shows[4], shows[5], shows[1]];

  const scrollContainerRef = useRef({});
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scroll = (category, direction) => {
    const container = scrollContainerRef.current[category];
    if (container) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categoryGroups = [
    { title: 'Trending Now', shows: shows.filter(s => s.views.includes('M')).slice(0, 8) },
    { title: 'Romance', shows: shows.filter(s => s.category === 'romance') },
    { title: 'Fantasy & Adventure', shows: shows.filter(s => s.category === 'fantasy') },
    { title: 'Thriller & Mystery', shows: shows.filter(s => ['thriller', 'mystery'].includes(s.category)) },
    { title: 'New Releases', shows: shows.slice(0, 8) },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Carousel Section */}
      <div className="relative h-[600px] w-full overflow-hidden group">
        <div ref={emblaRef} className="overflow-hidden h-full">
          <div className="flex h-full">
            {featuredShows.map((featuredShow, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 relative h-full">
                <div className="absolute inset-0">
                  <img
                    src={featuredShow.thumbnail}
                    alt={featuredShow.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                <div className="relative h-full max-w-7xl mx-auto px-12 flex items-center">
                  <div className="max-w-xl space-y-6">
                    <h1 className="text-5xl font-bold text-white leading-tight">
                      {featuredShow.title}
                    </h1>
                    <p className="text-lg text-gray-300">
                      {featuredShow.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span> {featuredShow.rating}
                      </span>
                      <span>•</span>
                      <span>{featuredShow.episodes} Episodes</span>
                      <span>•</span>
                      <span>{featuredShow.views} Views</span>
                    </div>
                    <Button
                      onClick={() => navigate(`/show/${featuredShow.id}`)}
                      size="lg"
                      className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold px-8 py-6 text-lg rounded-full transition-all hover:scale-105"
                    >
                      <Play className="w-6 h-6 mr-2 fill-white" />
                      Play Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <button
          onClick={scrollPrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {featuredShows.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors"
            />
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="pb-20">
        {categoryGroups.map((group, idx) => (
          <div key={idx} className="mt-12 px-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{group.title}</h2>
              <button
                onClick={() => navigate('/categories')}
                className="text-pink-500 hover:text-pink-400 flex items-center gap-1 text-sm font-semibold transition-colors"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative group/slider">
              <button
                onClick={() => scroll(group.title, 'left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 hover:bg-black rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity -ml-6"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>

              <div
                ref={(el) => (scrollContainerRef.current[group.title] = el)}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {group.shows.map((show) => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>

              <button
                onClick={() => scroll(group.title, 'right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-black/80 hover:bg-black rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity -mr-6"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
