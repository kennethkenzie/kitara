import React, { useEffect, useState } from 'react';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import ShowCard from '../components/ShowCard';
import { watchlistAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';

const Watchlist = () => {
  const [watchlistShows, setWatchlistShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchWatchlist();
  }, [user]);

  const fetchWatchlist = async () => {
    try {
      const data = await watchlistAPI.get();
      setWatchlistShows(data);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load watchlist',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearWatchlist = async () => {
    try {
      // Remove all items one by one
      for (const item of watchlistShows) {
        await watchlistAPI.remove(item.show_id);
      }
      setWatchlistShows([]);
      toast({
        title: 'Watchlist Cleared',
        description: 'All shows have been removed from your watchlist.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear watchlist',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">My Watchlist</h1>
          <p className="text-gray-400">{watchlistShows.length} shows saved</p>
        </div>
        {watchlistShows.length > 0 && (
          <Button
            onClick={handleClearWatchlist}
            variant="outline"
            className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Watchlist
          </Button>
        )}
      </div>

      {watchlistShows.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {watchlistShows.map((item) => (
            <ShowCard key={item.id} show={item.shows} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Your watchlist is empty</p>
          <p className="text-gray-500 mt-2">Add shows to your watchlist to watch them later</p>
          <Button
            onClick={() => navigate('/categories')}
            className="mt-6 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
          >
            Browse Shows
          </Button>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
