import React from 'react';
import { Clock, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import ShowCard from '../components/ShowCard';
import { shows, user } from '../mockData';
import { toast } from '../hooks/use-toast';

const History = () => {
  const historyShows = user.watchHistory.map((item) => {
    const show = shows.find((s) => s.id === item.showId);
    return { ...show, lastWatched: item.timestamp, lastEpisode: item.episodeNumber };
  });

  const handleClearHistory = () => {
    toast({
      title: 'History Cleared',
      description: 'Your watch history has been cleared.',
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Watch History</h1>
          <p className="text-gray-400">Continue watching where you left off</p>
        </div>
        <Button
          onClick={handleClearHistory}
          variant="outline"
          className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear History
        </Button>
      </div>

      {historyShows.length > 0 ? (
        <div className="space-y-6">
          {historyShows.map((show) => (
            <div
              key={show.id}
              className="bg-gray-900 rounded-lg p-6 flex gap-6 hover:bg-gray-800 transition-colors"
            >
              <img
                src={show.thumbnail}
                alt={show.title}
                className="w-40 h-56 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{show.title}</h3>
                <p className="text-gray-400 mb-4">{show.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(show.lastWatched).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Last watched: Episode {show.lastEpisode}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => window.location.href = `/player/${show.id}/${show.lastEpisode}`}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  >
                    Continue Watching
                  </Button>
                  <Button
                    onClick={() => window.location.href = `/show/${show.id}`}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    View All Episodes
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No watch history yet</p>
          <p className="text-gray-500 mt-2">Start watching shows to see them here</p>
        </div>
      )}
    </div>
  );
};

export default History;
