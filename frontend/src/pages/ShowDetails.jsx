import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Plus, Check, Share2, Star, Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { shows, generateEpisodes, user } from '../mockData';
import { toast } from '../hooks/use-toast';

const ShowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const show = shows.find((s) => s.id === parseInt(id));
  const [isInWatchlist, setIsInWatchlist] = useState(user.watchlist.includes(parseInt(id)));

  if (!show) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-xl">Show not found</p>
      </div>
    );
  }

  const episodes = generateEpisodes(show.id, show.episodes);

  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    toast({
      title: isInWatchlist ? 'Removed from Watchlist' : 'Added to Watchlist',
      description: isInWatchlist
        ? `${show.title} has been removed from your watchlist.`
        : `${show.title} has been added to your watchlist.`,
    });
  };

  const handlePlayEpisode = (episode) => {
    if (episode.isLocked && user.coins < episode.coinsRequired) {
      toast({
        title: 'Insufficient Coins',
        description: `You need ${episode.coinsRequired} coins to unlock this episode.`,
        variant: 'destructive',
      });
      return;
    }
    navigate(`/player/${show.id}/${episode.episodeNumber}`);
  };

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
                {show.isExclusive && (
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
                <span>{show.episodes} Episodes</span>
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
                >
                  {isInWatchlist ? (
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
                  {episode.isLocked ? (
                    <div className="flex flex-col items-center gap-2">
                      <Lock className="w-8 h-8 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold flex items-center gap-1">
                        <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">C</div>
                        {episode.coinsRequired}
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
                <p className="text-sm text-gray-400">Episode {episode.episodeNumber}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShowDetails;
