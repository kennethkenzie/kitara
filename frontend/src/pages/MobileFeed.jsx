import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react';
import { showsAPI } from '../services/api';

const MobileFeed = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const data = await showsAPI.getAll();
      // Shuffle shows for random order
      const shuffled = [...data].sort(() => Math.random() - 0.5);
      setShows(shuffled);
    } catch (error) {
      console.error('Error fetching shows:', error);
    }
  };

  const currentShow = shows[currentIndex];

  // Handle touch events for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > 50;
    const isSwipeDown = distance < -50;

    if (isSwipeUp) {
      goToNext();
    }

    if (isSwipeDown) {
      goToPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const goToNext = () => {
    if (currentIndex < shows.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back to first
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setCurrentIndex(shows.length - 1); // Loop to last
    }
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleShowClick = () => {
    navigate(`/show/${currentShow.id}`);
  };

  if (!currentShow) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        <img
          src={currentShow.thumbnail}
          alt={currentShow.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
      </div>

      {/* Top Gradient for Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/60 to-transparent z-10" />

      {/* Swipe Indicators */}
      <button
        onClick={goToPrev}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 text-white/50 z-20 animate-bounce"
      >
        <ChevronUp className="w-8 h-8" />
      </button>
      <button
        onClick={goToNext}
        className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-white/50 z-20 animate-bounce"
      >
        <ChevronDown className="w-8 h-8" />
      </button>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-end pb-20 px-4 z-30">
        <div className="space-y-3">
          {/* Show Info */}
          <div onClick={handleShowClick} className="cursor-pointer">
            <h1 className="text-white text-2xl font-bold mb-2 line-clamp-2">
              {currentShow.title}
            </h1>
            <p className="text-gray-200 text-sm mb-3 line-clamp-3">
              {currentShow.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-300 mb-3">
              <span className="flex items-center gap-1">
                <span className="text-yellow-400">★</span> {currentShow.rating}
              </span>
              <span>•</span>
              <span>{currentShow.category}</span>
              <span>•</span>
              <span>{currentShow.total_episodes} Episodes</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleShowClick}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            Watch Now
          </button>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30">
        {/* Like */}
        <div className="flex flex-col items-center gap-1">
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
            <Heart className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs font-semibold">{currentShow.views}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center gap-1">
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <span className="text-white text-xs font-semibold">0</span>
        </div>

        {/* Share */}
        <div className="flex flex-col items-center gap-1">
          <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors">
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Play/Pause */}
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white" />
            )}
          </button>
        </div>

        {/* Mute/Unmute */}
        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={toggleMute}
            className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-6 left-0 right-0 px-4 z-40 flex items-center gap-1">
        {shows.map((_, idx) => (
          <div
            key={idx}
            className={`h-0.5 flex-1 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* Show Counter */}
      <div className="absolute top-6 right-4 z-40 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-white text-xs font-semibold">
          {currentIndex + 1} / {shows.length}
        </span>
      </div>

      {/* Navigation hint - only show on first view */}
      {currentIndex === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-20 animate-pulse">
          <p className="text-white text-sm font-medium mb-2">Swipe up or down</p>
          <p className="text-white/70 text-xs">to explore more shows</p>
        </div>
      )}
    </div>
  );
};

export default MobileFeed;
