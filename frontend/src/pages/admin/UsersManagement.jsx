import React, { useEffect, useState } from 'react';
import { Search, Loader2, Shield, Coins } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { adminUsersAPI } from '../../services/adminAPI';
import { toast } from '../../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const data = await adminUsersAPI.getAll();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (user) => {
    try {
      const details = await adminUsersAPI.getDetails(user.id);
      setSelectedUser(user);
      setUserDetails(details);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user details',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAdmin = async (userId, currentStatus) => {
    try {
      await adminUsersAPI.update(userId, { is_admin: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !currentStatus } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, is_admin: !currentStatus });
      }
      toast({
        title: 'Success',
        description: `Admin status ${!currentStatus ? 'granted' : 'revoked'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update admin status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCoins = async (userId, newCoins) => {
    try {
      await adminUsersAPI.update(userId, { coins: newCoins });
      setUsers(users.map(u => u.id === userId ? { ...u, coins: newCoins } : u));
      if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, coins: newCoins });
      }
      toast({
        title: 'Success',
        description: 'Coins updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update coins',
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Users Management</h1>
            <p className="text-gray-400">{users.length} registered users</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border-gray-800 text-white pl-12 py-6"
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-16 h-16 border-2 border-pink-500">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-pink-500 text-white text-xl">
                      {user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold truncate">{user.name}</h3>
                      {user.is_admin && (
                        <Badge className="bg-yellow-500 text-black border-none">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">C</div>
                  <span className="text-yellow-400 font-semibold">{user.coins} Coins</span>
                </div>

                <Button
                  onClick={() => handleViewDetails(user)}
                  variant="outline"
                  className="w-full border-gray-700 text-white hover:bg-gray-800"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No users found</p>
          </div>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">User Details</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage user settings and view activity
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 border-2 border-pink-500">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="bg-pink-500 text-white text-2xl">
                    {selectedUser.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                  <p className="text-gray-400">{selectedUser.email}</p>
                  <p className="text-sm text-gray-500">
                    Joined: {new Date(selectedUser.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              {userDetails && (
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{selectedUser.coins}</p>
                      <p className="text-xs text-gray-400">Coins</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-white">{userDetails.watchlist_count}</p>
                      <p className="text-xs text-gray-400">Watchlist</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-white">{userDetails.watch_history_count}</p>
                      <p className="text-xs text-gray-400">History</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Admin Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <Label className="text-white font-medium">Admin Privileges</Label>
                    <p className="text-sm text-gray-400">Grant admin access to this user</p>
                  </div>
                  <Switch
                    checked={selectedUser.is_admin}
                    onCheckedChange={() => handleToggleAdmin(selectedUser.id, selectedUser.is_admin)}
                  />
                </div>

                <div className="p-4 bg-gray-800 rounded-lg space-y-3">
                  <Label className="text-white font-medium">Adjust Coins</Label>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUpdateCoins(selectedUser.id, selectedUser.coins + 50)}
                      variant="outline"
                      className="border-gray-700 text-white hover:bg-gray-700"
                    >
                      +50
                    </Button>
                    <Button
                      onClick={() => handleUpdateCoins(selectedUser.id, selectedUser.coins + 100)}
                      variant="outline"
                      className="border-gray-700 text-white hover:bg-gray-700"
                    >
                      +100
                    </Button>
                    <Button
                      onClick={() => handleUpdateCoins(selectedUser.id, selectedUser.coins + 500)}
                      variant="outline"
                      className="border-gray-700 text-white hover:bg-gray-700"
                    >
                      +500
                    </Button>
                    <Button
                      onClick={() => handleUpdateCoins(selectedUser.id, 0)}
                      variant="outline"
                      className="border-red-800 text-red-500 hover:bg-red-950"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
