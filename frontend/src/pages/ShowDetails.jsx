import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Share2, Star, Lock, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { showsAPI, watchlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';
import PaymentModal from '../components/PaymentModal';

const ShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [show, setShow] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, episode: null });

  useEffect(() => {
    fetchShowDetails();
  }, [id]);

  const fetchShowDetails = async () => {
    try {
      const [showData, episodesData] = await Promise.all([
        showsAPI.getById(id),
        showsAPI.getEpisodes(id),
      ]);
      setShow(showData);
      setEpisodes(episodesData);
      
      // Check if in watchlist
      if (user) {
        try {
          const watchlist = await watchlistAPI.get();
          setIsInWatchlist(watchlist.some(item => item.show_id === id));
        } catch (error) {
          console.error('Error checking watchlist:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching show details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load show details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: `/show/${id}` } } });
      return;
    }

    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await watchlistAPI.remove(id);
        setIsInWatchlist(false);
        toast({
          title: 'Removed from Watchlist',
          description: `${show.title} has been removed from your watchlist.`,
        });
      } else {
        await watchlistAPI.add(id);
        setIsInWatchlist(true);
        toast({
          title: 'Added to Watchlist',
          description: `${show.title} has been added to your watchlist.`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update watchlist',
        variant: 'destructive',
      });
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handlePlayEpisode = (episode) => {
    // Check if episode is locked (episodes 6+)
    if (episode.is_locked) {
      if (!user) {
        navigate('/auth', { state: { from: { pathname: `/show/${id}` } } });
        return;
      }
      // Open payment modal
      setPaymentModal({ isOpen: true, episode });
      return;
    }
    navigate(`/player/${show.id}/${episode.episode_number}`);
  };

  const handlePaymentSuccess = () => {
    // Refresh show details to get updated episode access
    fetchShowDetails();
    toast({
      title: 'Success!',
      description: 'Episode unlocked. Enjoy watching!',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Show not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={show.thumbnail}
            alt={show.title}
            className="w-full h-full object-cover blur-sm scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </div>

        <div className="relative h-full max-w-7xl mx-auto px-12 flex items-end pb-12">
          <div className="flex gap-8 items-end">
            <img
              src={show.thumbnail}
              alt={show.title}
              className="w-64 rounded-lg shadow-2xl"
            />
            <div className="flex-1 space-y-4 pb-2">
              <div className="flex items-center gap-3">
                {show.is_exclusive && (
                  <Badge className="bg-pink-500 text-white border-none font-bold">
                    EXCLUSIVE
                  </Badge>
                )}
                <Badge className="bg-gray-800 text-gray-300 border-gray-700">
                  {show.category.toUpperCase()}
                </Badge>
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">{show.title}</h1>
              <div className="flex items-center gap-6 text-gray-300">
                <span className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{show.rating}</span>
                </span>
                <span>{show.total_episodes} Episodes</span>
                <span>{show.views} Views</span>
                <span>{show.duration}</span>
              </div>
              <p className="text-lg text-gray-300 max-w-2xl">{show.description}</p>
              <div className="flex items-center gap-4 pt-2">
                <Button
                  onClick={() => handlePlayEpisode(episodes[0])}
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold px-8 rounded-full transition-all hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  Play Episode 1
                </Button>
                <Button
                  onClick={toggleWatchlist}
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800 rounded-full"
                  disabled={watchlistLoading}
                >
                  {watchlistLoading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : isInWatchlist ? (
                    <Check className="w-5 h-5 mr-2" />
                  ) : (
                    <Plus className="w-5 h-5 mr-2" />
                  )}
                  {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-800 rounded-full"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="max-w-7xl mx-auto px-12 py-12">
        <h2 className="text-3xl font-bold text-white mb-6">Episodes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              onClick={() => handlePlayEpisode(episode)}
              className="group relative bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-pink-500 transition-all"
            >
              <div className="relative aspect-video bg-gray-800">
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
                  {episode.is_locked ? (
                    <div className="flex flex-col items-center gap-2">
                      <Lock className="w-8 h-8 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">
                        200 UGX
                      </span>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-white ml-1" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
                  {Math.floor(episode.duration / 60)}:{String(episode.duration % 60).padStart(2, '0')}
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-white font-semibold">{episode.title}</h3>
                <p className="text-sm text-gray-400">Episode {episode.episode_number}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, episode: null })}
        episode={paymentModal.episode}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ShowDetails;
