import React, { useEffect, useState } from 'react';
import { Clock, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { historyAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../hooks/use-toast';

const History = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const data = await historyAPI.get();
      setHistoryItems(data);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load watch history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await historyAPI.clear();
      setHistoryItems([]);
      toast({
        title: 'History Cleared',
        description: 'Your watch history has been cleared.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear history',
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
          <h1 className="text-4xl font-bold text-white mb-2">Watch History</h1>
          <p className="text-gray-400">Continue watching where you left off</p>
        </div>
        {historyItems.length > 0 && (
          <Button
            onClick={handleClearHistory}
            variant="outline"
            className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear History
          </Button>
        )}
      </div>

      {historyItems.length > 0 ? (
        <div className="space-y-6">
          {historyItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-lg p-6 flex gap-6 hover:bg-gray-800 transition-colors"
            >
              <img
                src={item.shows?.thumbnail}
                alt={item.shows?.title}
                className="w-40 h-56 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">{item.shows?.title}</h3>
                <p className="text-gray-400 mb-4">{item.shows?.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(item.watched_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Last watched: Episode {item.episode_number}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => navigate(`/player/${item.show_id}/${item.episode_number}`)}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                  >
                    Continue Watching
                  </Button>
                  <Button
                    onClick={() => navigate(`/show/${item.show_id}`)}
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

export default History;
