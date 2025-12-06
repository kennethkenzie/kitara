import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Film, Eye, Activity, TrendingUp, Plus, Loader2, DollarSign, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { adminStatsAPI } from '../../services/adminAPI';
import { toast } from '../../hooks/use-toast';
import AdminLayout from '../../layouts/AdminLayout';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        adminStatsAPI.getStats(),
        adminStatsAPI.getActivity(10),
      ]);
      setStats(statsData);
      setActivity(activityData);
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      change: stats?.new_users_30d ? `+${stats.new_users_30d} this month` : '',
      trend: 'up',
    },
    {
      title: 'Total Shows',
      value: stats?.total_shows || 0,
      icon: Film,
      color: 'from-pink-500 to-rose-500',
      change: 'All categories',
    },
    {
      title: 'Total Episodes',
      value: stats?.total_episodes || 0,
      icon: Activity,
      color: 'from-purple-500 to-indigo-500',
      change: 'Content available',
    },
    {
      title: 'Total Views',
      value: stats?.total_views || 0,
      icon: Eye,
      color: 'from-green-500 to-emerald-500',
      change: stats?.views_30d ? `${stats.views_30d} this month` : '',
      trend: 'up',
    },
  ];

  const categoryStats = [
    { name: 'Action', count: 8, percentage: 19 },
    { name: 'Drama', count: 10, percentage: 23 },
    { name: 'Comedy', count: 6, percentage: 14 },
    { name: 'Fantasy', count: 6, percentage: 14 },
    { name: 'Mystery', count: 8, percentage: 19 },
    { name: 'Horror', count: 5, percentage: 11 },
  ];

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
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate('/admin/shows')}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 flex-1 md:flex-none"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Show
            </Button>
            <Button
              onClick={() => navigate('/admin/users')}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800 flex-1 md:flex-none"
            >
              <Users className="w-5 h-5 mr-2" />
              Users
            </Button>
          </div>
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
                    {stat.trend && (
                      <div className="flex items-center gap-1 text-green-500 text-sm">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-gray-400 text-xs md:text-sm mb-1">{stat.title}</h3>
                  <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</p>
                  {stat.change && <p className="text-xs md:text-sm text-gray-500">{stat.change}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Category Distribution */}
          <Card className="bg-gray-900 border-gray-800 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white text-lg md:text-xl">Content Distribution by Category</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Shows breakdown across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {categoryStats.map((cat, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm md:text-base font-medium">{cat.name}</span>
                      <span className="text-gray-400 text-xs md:text-sm">{cat.count} shows ({cat.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-rose-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Rated Shows */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg md:text-xl">Top Rated</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Highest rated shows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['African Tales', 'Explosive Justice', 'Quest for the Golden Crown', 'The Last Witness', 'The Cursed Village'].map((show, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 md:p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{show}</p>
                      <p className="text-gray-400 text-xs">#{idx + 1}</p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      <span className="text-sm font-semibold">{(4.9 - idx * 0.1).toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg md:text-xl">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 md:space-y-3">
              <Button
                onClick={() => navigate('/admin/shows')}
                variant="outline"
                className="w-full justify-start bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <Film className="w-5 h-5 mr-3" />
                Manage Shows & Episodes
              </Button>
              <Button
                onClick={() => navigate('/admin/users')}
                variant="outline"
                className="w-full justify-start bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <Users className="w-5 h-5 mr-3" />
                Manage Users
              </Button>
              <Button
                onClick={() => navigate('/admin/shows/new')}
                variant="outline"
                className="w-full justify-start bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <Plus className="w-5 h-5 mr-3" />
                Add New Show
              </Button>
              <Button
                onClick={() => navigate('/admin/analytics')}
                variant="outline"
                className="w-full justify-start bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
              >
                <Activity className="w-5 h-5 mr-3" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white text-lg md:text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400 text-sm">Latest platform updates</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <div className="space-y-2 md:space-y-3">
                  {activity.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-gray-800 rounded-lg">
                      <Activity className="w-4 h-4 text-pink-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">
                          {item.action} {item.resource_type}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {new Date(item.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No recent activity</p>
                  <p className="text-gray-500 text-xs mt-1">Actions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
