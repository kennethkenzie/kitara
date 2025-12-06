import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Film, Eye, Activity, TrendingUp, Plus, Loader2, Star, Clock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { showsAPI } from '../../services/api';
import { toast } from '../../hooks/use-toast';
import AdminLayout from '../../layouts/AdminLayout';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const showsData = await showsAPI.getAll();
      setShows(showsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  // Calculate stats
  const totalShows = shows.length;
  const totalEpisodes = shows.reduce((sum, show) => sum + show.total_episodes, 0);
  const exclusiveShows = shows.filter(s => s.is_exclusive).length;
  const featuredShows = shows.filter(s => s.is_featured).length;

  // Group shows by category
  const categories = ['Action', 'Drama', 'Comedy', 'Fantasy', 'Mystery', 'Horror'];
  const showsByCategory = categories.map(cat => ({
    name: cat,
    shows: shows.filter(s => s.category === cat),
    count: shows.filter(s => s.category === cat).length
  }));

  const statCards = [
    {
      title: 'Total Shows',
      value: totalShows,
      icon: Film,
      color: 'from-pink-500 to-rose-500',
      description: 'All content',
    },
    {
      title: 'Total Episodes',
      value: totalEpisodes,
      icon: Activity,
      color: 'from-purple-500 to-indigo-500',
      description: 'Available content',
    },
    {
      title: 'Exclusive Shows',
      value: exclusiveShows,
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      description: 'Premium content',
    },
    {
      title: 'Featured Shows',
      value: featuredShows,
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      description: 'Highlighted',
    },
  ];

  const topRatedShows = [...shows]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <AdminLayout>
      <div className="px-4 md:px-8 lg:px-12 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-gray-400">Manage your Ekitara Cinema platform</p>
            </div>
            <Button
              onClick={() => navigate('/admin/shows/new')}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Show
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            {statCards.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all hover:scale-105">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-gray-400 text-xs md:text-sm mb-1">{stat.title}</h3>
                    <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-xs md:text-sm text-gray-500">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Category Breakdown and Top Rated */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Category Distribution */}
            <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">Content by Category</CardTitle>
                <CardDescription className="text-gray-400 text-sm">Shows distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {showsByCategory.map((cat, idx) => {
                    const percentage = totalShows > 0 ? (cat.count / totalShows * 100).toFixed(0) : 0;
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm md:text-base font-medium">{cat.name}</span>
                          <span className="text-gray-400 text-xs md:text-sm">{cat.count} shows ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Rated Shows */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg md:text-xl">Top Rated</CardTitle>
                <CardDescription className="text-gray-400 text-sm">Highest ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topRatedShows.map((show, idx) => (
                    <div 
                      key={show.id} 
                      className="flex items-center justify-between p-2 md:p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/shows/${show.id}/edit`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{show.title}</p>
                        <p className="text-gray-400 text-xs">{show.category}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        <span className="text-sm font-semibold">{show.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Shows by Category - Detailed Listing */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Shows by Category</h2>
              <Button
                onClick={() => navigate('/admin/shows')}
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
              >
                View All Shows
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {showsByCategory.map((category) => (
              category.count > 0 && (
                <Card key={category.name} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white text-xl">{category.name}</CardTitle>
                        <CardDescription className="text-gray-400 text-sm">
                          {category.count} show{category.count !== 1 ? 's' : ''}
                        </CardDescription>
                      </div>
                      <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50">
                        {category.count}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.shows.map((show) => (
                        <div
                          key={show.id}
                          onClick={() => navigate(`/admin/shows/${show.id}/edit`)}
                          className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all cursor-pointer group"
                        >
                          <div className="relative h-32">
                            <img
                              src={show.thumbnail}
                              alt={show.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                            {show.is_exclusive && (
                              <Badge className="absolute top-2 right-2 bg-yellow-500 text-black text-xs">
                                Exclusive
                              </Badge>
                            )}
                            {show.is_featured && (
                              <Badge className="absolute top-2 left-2 bg-pink-500 text-white text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="text-white font-semibold text-sm mb-1 truncate">{show.title}</h4>
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                {show.rating}
                              </span>
                              <span>{show.total_episodes} eps</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
