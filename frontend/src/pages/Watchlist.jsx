import React from 'react';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import ShowCard from '../components/ShowCard';
import { shows, user } from '../mockData';
import { toast } from '../hooks/use-toast';

const Watchlist = () => {
  const watchlistShows = shows.filter((show) => user.watchlist.includes(show.id));

  const handleClearWatchlist = () => {
    toast({
      title: 'Watchlist Cleared',
      description: 'All shows have been removed from your watchlist.',
    });
  };

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
          {watchlistShows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Your watchlist is empty</p>
          <p className="text-gray-500 mt-2">Add shows to your watchlist to watch them later</p>
          <Button
            onClick={() => window.location.href = '/categories'}
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
