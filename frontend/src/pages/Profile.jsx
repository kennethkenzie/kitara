import React from 'react';
import { Camera, Coins, Star, Clock, Heart, Settings, LogOut } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { user, shows } from '../mockData';
import { toast } from '../hooks/use-toast';

const Profile = () => {
  const watchlistShows = shows.filter((show) => user.watchlist.includes(show.id));
  const totalWatchTime = user.watchHistory.length * 45; // Mock: 45 min average per show

  const handleBuyCoins = () => {
    toast({
      title: 'Purchase Coins',
      description: 'Coin purchase feature coming soon!',
    });
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 mb-8">
          <CardContent className="p-8">
            <div className="flex items-start gap-8">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-pink-500">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-pink-500 text-white text-3xl">GU</AvatarFallback>
                </Avatar>
                <button className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-gray-400 mb-4">{user.email}</p>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-sm font-bold">C</div>
                    <div>
                      <p className="text-yellow-400 font-bold text-xl">{user.coins}</p>
                      <p className="text-xs text-gray-400">Coins Balance</p>
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-700" />
                  <div>
                    <p className="text-white font-bold text-xl">{user.watchHistory.length}</p>
                    <p className="text-xs text-gray-400">Shows Watched</p>
                  </div>
                  <div className="h-12 w-px bg-gray-700" />
                  <div>
                    <p className="text-white font-bold text-xl">{watchlistShows.length}</p>
                    <p className="text-xs text-gray-400">In Watchlist</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleBuyCoins}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold"
              >
                <Coins className="w-5 h-5 mr-2" />
                Buy Coins
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Watch Stats */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-pink-500" />
                Watch Time
              </CardTitle>
              <CardDescription className="text-gray-400">Total viewing time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white mb-2">{totalWatchTime} min</p>
              <Progress value={65} className="h-2 bg-gray-800" />
              <p className="text-xs text-gray-400 mt-2">65% more than last month</p>
            </CardContent>
          </Card>

          {/* Favorite Genre */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Favorite Genre
              </CardTitle>
              <CardDescription className="text-gray-400">Most watched category</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white mb-2">Romance</p>
              <Progress value={80} className="h-2 bg-gray-800" />
              <p className="text-xs text-gray-400 mt-2">80% of your watch time</p>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-pink-500" />
                Rewards
              </CardTitle>
              <CardDescription className="text-gray-400">Earned this month</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white mb-2">250 Coins</p>
              <Progress value={50} className="h-2 bg-gray-800" />
              <p className="text-xs text-gray-400 mt-2">Watch 5 more episodes to earn 50 coins</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Account Settings</CardTitle>
            <CardDescription className="text-gray-400">Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <Settings className="w-5 h-5 mr-3" />
              Edit Profile
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <Settings className="w-5 h-5 mr-3" />
              Notification Preferences
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <Settings className="w-5 h-5 mr-3" />
              Privacy Settings
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start bg-gray-800 border-gray-700 text-pink-500 hover:bg-gray-700 hover:text-pink-400"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
