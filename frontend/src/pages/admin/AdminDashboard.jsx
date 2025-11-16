import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Film, Eye, Activity, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { adminStatsAPI } from '../../services/adminAPI';
import { toast } from '../../hooks/use-toast';

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
    },
    {
      title: 'Total Shows',
      value: stats?.total_shows || 0,
      icon: Film,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Total Episodes',
      value: stats?.total_episodes || 0,
      icon: Activity,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      title: 'Total Views',
      value: stats?.total_views || 0,
      icon: Eye,
      color: 'from-green-500 to-emerald-500',
      change: stats?.views_30d ? `${stats.views_30d} this month` : '',
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your Kitara Cinema platform</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/admin/shows')}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Show
            </Button>
            <Button
              onClick={() => navigate('/admin/users')}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              <Users className="w-5 h-5 mr-2" />
              Manage Users
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {stat.change && (
                      <div className="flex items-center gap-1 text-green-500 text-sm">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value.toLocaleString()}</p>
                  {stat.change && <p className="text-sm text-gray-500">{stat.change}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
              <CardDescription className="text-gray-400">Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Activity</CardTitle>
              <CardDescription className="text-gray-400">Latest admin actions</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <div className="space-y-3">
                  {activity.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                      <Activity className="w-4 h-4 text-pink-500 mt-1" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium">
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
                <p className="text-gray-400 text-center py-8">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
