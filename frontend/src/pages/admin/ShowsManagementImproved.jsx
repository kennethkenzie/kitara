import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Loader2, Search, Filter, Download, Upload, CheckSquare, Square } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const ShowsManagementImproved = () => {
  const navigate = useNavigate();
  const [shows, setShows] = useState([]);
  const [filteredShows, setFilteredShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [deleteShow, setDeleteShow] = useState(null);
  const [selectedShows, setSelectedShows] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    filterAndSortShows();
  }, [searchQuery, categoryFilter, sortBy, shows]);

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

  const filterAndSortShows = () => {
    let filtered = [...shows];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (show) =>
          show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          show.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((show) => show.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'rating':
          return b.rating - a.rating;
        case 'episodes':
          return b.total_episodes - a.total_episodes;
        case 'views':
          return parseInt(b.views) - parseInt(a.views);
        default:
          return 0;
      }
    });

    setFilteredShows(filtered);
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

  const toggleSelectShow = (showId) => {
    setSelectedShows((prev) =>
      prev.includes(showId) ? prev.filter((id) => id !== showId) : [...prev, showId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedShows.length === filteredShows.length) {
      setSelectedShows([]);
    } else {
      setSelectedShows(filteredShows.map((show) => show.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedShows.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        // Bulk delete (would need backend support)
        for (const showId of selectedShows) {
          await adminShowsAPI.delete(showId);
        }
        setShows(shows.filter((s) => !selectedShows.includes(s.id)));
        toast({
          title: 'Success',
          description: `${selectedShows.length} shows deleted`,
        });
      }
      setSelectedShows([]);
      setBulkAction('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Bulk action failed',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Category', 'Rating', 'Episodes', 'Views'];
    const rows = filteredShows.map((show) => [
      show.title,
      show.category,
      show.rating,
      show.total_episodes,
      show.views,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shows.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className=\"min-h-screen bg-black flex items-center justify-center\">
        <Loader2 className=\"w-12 h-12 text-pink-500 animate-spin\" />
      </div>
    );
  }

  const categories = ['all', 'Action', 'Drama', 'Comedy', 'Fantasy', 'Mystery', 'Horror'];

  return (
    <div className=\"min-h-screen bg-black pt-16 md:pt-24 px-4 md:px-8 lg:px-12 pb-20\">
      <div className=\"max-w-7xl mx-auto\">
        {/* Header */}
        <div className=\"flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4\">
          <div>
            <h1 className=\"text-3xl md:text-4xl font-bold text-white mb-2\">Shows Management</h1>
            <p className=\"text-gray-400\">{filteredShows.length} shows found</p>
          </div>
          <Button
            onClick={() => navigate('/admin/shows/new')}
            className=\"bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700\"
          >
            <Plus className=\"w-5 h-5 mr-2\" />
            Add Show
          </Button>
        </div>

        {/* Filters and Actions */}
        <Card className=\"bg-gray-900 border-gray-800 mb-6\">
          <CardContent className=\"p-4 md:p-6\">
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4\">
              {/* Search */}
              <div className=\"relative\">
                <Search className=\"absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400\" />
                <Input
                  placeholder=\"Search shows...\"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=\"pl-10 bg-gray-800 border-gray-700 text-white\"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className=\"bg-gray-800 border-gray-700 text-white\">
                  <SelectValue placeholder=\"Category\" />
                </SelectTrigger>
                <SelectContent className=\"bg-gray-800 border-gray-700\">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className=\"text-white hover:bg-gray-700\">
                      {cat === 'all' ? 'All Categories' : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className=\"bg-gray-800 border-gray-700 text-white\">
                  <SelectValue placeholder=\"Sort by\" />
                </SelectTrigger>
                <SelectContent className=\"bg-gray-800 border-gray-700\">
                  <SelectItem value=\"title\" className=\"text-white hover:bg-gray-700\">Title</SelectItem>
                  <SelectItem value=\"rating\" className=\"text-white hover:bg-gray-700\">Rating</SelectItem>
                  <SelectItem value=\"episodes\" className=\"text-white hover:bg-gray-700\">Episodes</SelectItem>
                  <SelectItem value=\"views\" className=\"text-white hover:bg-gray-700\">Views</SelectItem>
                </SelectContent>
              </Select>

              {/* Export */}
              <Button
                onClick={exportToCSV}
                variant=\"outline\"
                className=\"border-gray-700 text-white hover:bg-gray-800\"
              >
                <Download className=\"w-4 h-4 mr-2\" />
                Export CSV
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedShows.length > 0 && (
              <div className=\"flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-800 rounded-lg\">
                <span className=\"text-white text-sm\">{selectedShows.length} selected</span>
                <div className=\"flex gap-2 flex-1\">
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className=\"bg-gray-700 border-gray-600 text-white w-full sm:w-48\">
                      <SelectValue placeholder=\"Bulk action\" />
                    </SelectTrigger>
                    <SelectContent className=\"bg-gray-700 border-gray-600\">
                      <SelectItem value=\"delete\" className=\"text-white hover:bg-gray-600\">Delete</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className=\"bg-pink-500 hover:bg-pink-600\"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shows Grid */}
        <div className=\"space-y-4\">
          {/* Select All */}
          <div className=\"flex items-center gap-2 p-3 bg-gray-900 rounded-lg border border-gray-800\">
            <button
              onClick={toggleSelectAll}
              className=\"text-white hover:text-pink-500 transition-colors\"
            >
              {selectedShows.length === filteredShows.length ? (
                <CheckSquare className=\"w-5 h-5\" />
              ) : (
                <Square className=\"w-5 h-5\" />
              )}
            </button>
            <span className=\"text-white text-sm\">Select All</span>
          </div>

          {filteredShows.map((show) => (
            <Card key={show.id} className=\"bg-gray-900 border-gray-800 hover:border-gray-700 transition-all\">
              <CardContent className=\"p-4 md:p-6\">
                <div className=\"flex flex-col md:flex-row gap-4\">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSelectShow(show.id)}
                    className=\"text-white hover:text-pink-500 transition-colors self-start md:self-center\"
                  >
                    {selectedShows.includes(show.id) ? (
                      <CheckSquare className=\"w-5 h-5\" />
                    ) : (
                      <Square className=\"w-5 h-5\" />
                    )}
                  </button>

                  {/* Thumbnail */}
                  <img
                    src={show.thumbnail}
                    alt={show.title}
                    className=\"w-full md:w-32 h-32 md:h-20 object-cover rounded-lg\"
                  />

                  {/* Details */}
                  <div className=\"flex-1 min-w-0\">
                    <h3 className=\"text-white text-lg font-semibold mb-2 truncate\">{show.title}</h3>
                    <div className=\"flex flex-wrap items-center gap-2 mb-3\">
                      <Badge variant=\"secondary\" className=\"bg-pink-500/20 text-pink-400 border-pink-500/50\">
                        {show.category}
                      </Badge>
                      <span className=\"text-gray-400 text-sm\">★ {show.rating}</span>
                      <span className=\"text-gray-400 text-sm\">•</span>
                      <span className=\"text-gray-400 text-sm\">{show.total_episodes} Episodes</span>
                      <span className=\"text-gray-400 text-sm\">•</span>
                      <span className=\"text-gray-400 text-sm\">{show.views} Views</span>
                      {show.is_exclusive && (
                        <Badge className=\"bg-yellow-500/20 text-yellow-400 border-yellow-500/50\">
                          Exclusive
                        </Badge>
                      )}
                    </div>
                    <p className=\"text-gray-400 text-sm line-clamp-2\">{show.description}</p>
                  </div>

                  {/* Actions */}
                  <div className=\"flex md:flex-col gap-2 justify-end\">
                    <Button
                      onClick={() => navigate(`/admin/shows/${show.id}/edit`)}
                      variant=\"outline\"
                      size=\"sm\"
                      className=\"border-gray-700 text-white hover:bg-gray-800 flex-1 md:flex-none\"
                    >
                      <Edit className=\"w-4 h-4 md:mr-2\" />
                      <span className=\"hidden md:inline\">Edit</span>
                    </Button>
                    <Button
                      onClick={() => setDeleteShow(show)}
                      variant=\"outline\"
                      size=\"sm\"
                      className=\"border-red-900 text-red-500 hover:bg-red-950 flex-1 md:flex-none\"
                    >
                      <Trash2 className=\"w-4 h-4 md:mr-2\" />
                      <span className=\"hidden md:inline\">Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredShows.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No shows found</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteShow} onOpenChange={() => setDeleteShow(null)}>
        <AlertDialogContent className=\"bg-gray-900 border-gray-800\">
          <AlertDialogHeader>
            <AlertDialogTitle className=\"text-white\">Delete Show</AlertDialogTitle>
            <AlertDialogDescription className=\"text-gray-400\">
              Are you sure you want to delete \"{deleteShow?.title}\"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className=\"bg-gray-800 border-gray-700 text-white hover:bg-gray-700\">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className=\"bg-red-600 hover:bg-red-700 text-white\"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShowsManagementImproved;
