import React, { useRef, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import ShowCard from '../components/ShowCard';
import { showsAPI } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredShows, setFeaturedShows] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scrollContainerRef = useRef({});

  // Auto-advance carousel with fade
  useEffect(() => {
    if (featuredShows.length === 0) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide, featuredShows]);

  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? featuredShows.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [featuredShows.length, isTransitioning]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === featuredShows.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [featuredShows.length, isTransitioning]);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const data = await showsAPI.getAll();
      setShows(data);
      const featured = data.filter(s => s.is_featured);
      setFeaturedShows(featured.length > 0 ? featured : data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (category, direction) => {
    const container = scrollContainerRef.current[category];
    if (container) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categoryGroups = [
    { title: 'Trending Now', shows: shows.filter(s => s.views.includes('M')).slice(0, 8) },
    { title: 'Action', shows: shows.filter(s => s.category === 'Action') },
    { title: 'Fantasy', shows: shows.filter(s => s.category === 'Fantasy') },
    { title: 'Mystery', shows: shows.filter(s => s.category === 'Mystery') },
    { title: 'Drama', shows: shows.filter(s => s.category === 'Drama') },
    { title: 'Comedy', shows: shows.filter(s => s.category === 'Comedy') },
    { title: 'Horror', shows: shows.filter(s => s.category === 'Horror') },
    { title: 'New Releases', shows: shows.slice(0, 8) },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Carousel Section with Fade */}
      <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden group">
        {featuredShows.map((featuredShow, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0">
              <img
                src={featuredShow.thumbnail}
                alt={featuredShow.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>

            <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex items-center">
              <div className="max-w-xl space-y-3 md:space-y-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  {featuredShow.title}
                </h1>
                <p className="text-sm md:text-base lg:text-lg text-gray-300">
                  {featuredShow.description}
                </p>
                <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-300">
                  <span className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span> {featuredShow.rating}
                  </span>
                  <span>•</span>
                  <span>{featuredShow.total_episodes} Episodes</span>
                  <span>•</span>
                  <span>{featuredShow.views} Views</span>
                </div>
                <Button
                  onClick={() => navigate(`/show/${featuredShow.id}`)}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 text-sm md:text-base lg:text-lg rounded-full transition-all hover:scale-105"
                >
                  <Play className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 mr-1 md:mr-2 fill-white" />
                  Play Now
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Navigation Buttons */}
        <button
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          {featuredShows.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setIsTransitioning(true);
                setTimeout(() => setIsTransitioning(false), 1000);
              }}
              className={`h-2 rounded-full transition-all ${
                currentSlide === index 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="pb-20">
        {categoryGroups.map((group, idx) => (
          <div key={idx} className="mt-8 md:mt-12 px-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white">{group.title}</h2>
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
