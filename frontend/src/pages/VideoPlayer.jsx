import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Share2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { showsAPI, historyAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';

const VideoPlayer = () => {
  const { showId, episodeNumber } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [show, setShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchData();
  }, [showId, episodeNumber]);

  useEffect(() => {
    // Scroll to top when episode changes
    window.scrollTo(0, 0);
    
    // Track watch history
    if (user && showId && episodeNumber) {
      trackWatchHistory();
    }
  }, [episodeNumber, user]);

  const fetchData = async () => {
    try {
      const [showData, episodesData] = await Promise.all([
        showsAPI.getById(showId),
        showsAPI.getEpisodes(showId),
      ]);
      setShow(showData);
      setEpisodes(episodesData);
      const episode = episodesData.find(ep => ep.episode_number === parseInt(episodeNumber));
      setCurrentEpisode(episode);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load video',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const trackWatchHistory = async () => {
    try {
      await historyAPI.add(showId, parseInt(episodeNumber));
    } catch (error) {
      console.error('Error tracking watch history:', error);
    }
  };

  const handleNextEpisode = () => {
    const nextEp = episodes.find(ep => ep.episode_number === currentEpisode.episode_number + 1);
    if (nextEp) {
      if (nextEp.is_locked && (!profile || profile.coins < nextEp.coins_required)) {
        toast({
          title: 'Insufficient Coins',
          description: `You need ${nextEp.coins_required} coins to unlock this episode.`,
          variant: 'destructive',
        });
        return;
      }
      navigate(`/player/${showId}/${nextEp.episode_number}`);
    }
  };

  const handlePrevEpisode = () => {
    const prevEp = episodes.find(ep => ep.episode_number === currentEpisode.episode_number - 1);
    if (prevEp) {
      navigate(`/player/${showId}/${prevEp.episode_number}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!show || !currentEpisode) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Episode not found</p>
      </div>
    );
  }

  const nextEpisode = episodes.find(ep => ep.episode_number === currentEpisode.episode_number + 1);
  const prevEpisode = episodes.find(ep => ep.episode_number === currentEpisode.episode_number - 1);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto pt-20 px-4 pb-20">
        {/* Video Player */}
        <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={currentEpisode.thumbnail}
              alt={currentEpisode.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-pink-500 rounded-full flex items-center justify-center mx-auto hover:bg-pink-600 transition-colors cursor-pointer">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                </div>
                <p className="text-white text-lg font-semibold">Video Player Demo</p>
                <p className="text-gray-300 text-sm">Click to play {currentEpisode.title}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Episode Info */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{show.title}</h1>
            <p className="text-xl text-gray-300 mb-3">
              Episode {currentEpisode.episode_number}: {currentEpisode.title}
            </p>
            <p className="text-gray-400">{show.description}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button
              onClick={() => {
                setIsLiked(!isLiked);
                toast({ title: isLiked ? 'Removed from favorites' : 'Added to favorites' });
              }}
              variant="outline"
              size="icon"
              className={`rounded-full border-gray-700 ${isLiked ? 'bg-pink-500 border-pink-500' : 'bg-gray-800'}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'text-white'}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full bg-gray-800 border-gray-700"
            >
              <Share2 className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={handlePrevEpisode}
            disabled={!prevEpisode}
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Previous Episode
          </Button>
          <Button
            onClick={() => navigate(`/show/${showId}`)}
            variant="outline"
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            All Episodes
          </Button>
          <Button
            onClick={handleNextEpisode}
            disabled={!nextEpisode}
            className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-600"
          >
            Next Episode
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* More Episodes */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">More Episodes</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {episodes.slice(0, 8).map((episode) => (
              <div
                key={episode.id}
                onClick={() => navigate(`/player/${showId}/${episode.episode_number}`)}
                className={`group relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all ${
                  episode.episode_number === currentEpisode.episode_number ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                <div className="relative aspect-video bg-gray-800">
                  <img
                    src={episode.thumbnail}
                    alt={episode.title}
                    className="w-full h-full object-cover"
                  />
                  {episode.episode_number === currentEpisode.episode_number && (
                    <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                      <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Now Playing
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-white text-sm font-semibold">Episode {episode.episode_number}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
