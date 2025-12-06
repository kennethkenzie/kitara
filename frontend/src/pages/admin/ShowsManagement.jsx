import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { showsAPI } from '../../services/api';
import { adminShowsAPI } from '../../services/adminAPI';
import { toast } from '../../hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

const ShowsManagement = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteShow, setDeleteShow] = useState(null);

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = shows.filter(
        (show) =>
          show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          show.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredShows(filtered);
    } else {
      setFilteredShows(shows);
    }
  }, [searchQuery, shows]);

  const fetchShows = async () => {
    try {
      const data = await showsAPI.getAll();
      setShows(data);
      setFilteredShows(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load shows',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteShow) return;

    try {
      await adminShowsAPI.delete(deleteShow.id);
      setShows(shows.filter((s) => s.id !== deleteShow.id));
      toast({
        title: 'Success',
        description: 'Show deleted successfully',
      });
      setDeleteShow(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete show',
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
            <h1 className="text-4xl font-bold text-white mb-2">Shows Management</h1>
            <p className="text-gray-400">{shows.length} shows total</p>
          </div>
          <Button
            onClick={() => navigate('/admin/shows/new')}
            className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Show
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search shows by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border-gray-800 text-white pl-12 py-6"
          />
        </div>

        {/* Shows Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredShows.map((show) => (
            <Card key={show.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors overflow-hidden group">
              <div className="relative aspect-[3/4]">
                <img
                  src={show.thumbnail}
                  alt={show.title}
                  className="w-full h-full object-cover"
                />
                {show.is_exclusive && (
                  <Badge className="absolute top-2 left-2 bg-pink-500 text-white border-none">
                    EXCLUSIVE
                  </Badge>
                )}
                {show.is_featured && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-black border-none">
                    FEATURED
                  </Badge>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="text-white font-semibold mb-1 line-clamp-2">{show.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                  <Badge variant="outline" className="border-gray-700 text-gray-300">
                    {show.category}
                  </Badge>
                  <span>•</span>
                  <span>{show.total_episodes} eps</span>
                  <span>•</span>
                  <span>★ {show.rating}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/admin/shows/${show.id}/edit`)}
                    size="sm"
                    variant="outline"
                    className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeleteShow(show)}
                    size="sm"
                    variant="outline"
                    className="border-red-800 text-red-500 hover:bg-red-950"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredShows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No shows found</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteShow} onOpenChange={() => setDeleteShow(null)}>
        <AlertDialogContent className="bg-gray-900 border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Show</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{deleteShow?.title}"? This action cannot be undone and will also delete all episodes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShowsManagement;
