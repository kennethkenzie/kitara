import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { showsAPI, adminShowsAPI } from '../../services/api';
import { toast } from '../../hooks/use-toast';

const ShowForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    thumbnail: '',
    category: 'romance',
    rating: 4.5,
    views: '0',
    total_episodes: 0,
    is_exclusive: false,
    description: '',
    duration: '1-3 min per episode',
    is_featured: false,
  });

  useEffect(() => {
    if (id) {
      fetchShow();
    }
  }, [id]);

  const fetchShow = async () => {
    try {
      const data = await showsAPI.getById(id);
      setFormData(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load show',
        variant: 'destructive',
      });
      navigate('/admin/shows');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await adminShowsAPI.update(id, formData);
        toast({
          title: 'Success',
          description: 'Show updated successfully',
        });
      } else {
        await adminShowsAPI.create(formData);
        toast({
          title: 'Success',
          description: 'Show created successfully',
        });
      }
      navigate('/admin/shows');
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${id ? 'update' : 'create'} show`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = ['romance', 'thriller', 'fantasy', 'drama', 'comedy', 'action', 'mystery', 'horror'];

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/admin/shows')}
            variant="outline"
            size="icon"
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-white">{id ? 'Edit Show' : 'Add New Show'}</h1>
            <p className="text-gray-400">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Show Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">
                  Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  required
                />
              </div>

              {/* Thumbnail URL */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-gray-300">
                  Thumbnail URL *
                </Label>
                <Input
                  id="thumbnail"
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="https://example.com/image.jpg"
                  required
                />
                {formData.thumbnail && (
                  <img
                    src={formData.thumbnail}
                    alt="Preview"
                    className="w-40 h-56 object-cover rounded mt-2"
                  />
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">
                  Category *
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-white">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white min-h-24"
                  required
                />
              </div>

              {/* Grid Layout for Small Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating */}
                <div className="space-y-2">
                  <Label htmlFor="rating" className="text-gray-300">
                    Rating (0-5)
                  </Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Total Episodes */}
                <div className="space-y-2">
                  <Label htmlFor="total_episodes" className="text-gray-300">
                    Total Episodes
                  </Label>
                  <Input
                    id="total_episodes"
                    type="number"
                    min="0"
                    value={formData.total_episodes}
                    onChange={(e) => setFormData({ ...formData, total_episodes: parseInt(e.target.value) })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                {/* Views */}
                <div className="space-y-2">
                  <Label htmlFor="views" className="text-gray-300">
                    Views Display
                  </Label>
                  <Input
                    id="views"
                    value={formData.views}
                    onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="e.g., 2.5M"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-300">
                    Duration
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <Label className="text-white font-medium">Exclusive Content</Label>
                    <p className="text-sm text-gray-400">Mark this show as exclusive</p>
                  </div>
                  <Switch
                    checked={formData.is_exclusive}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_exclusive: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                  <div>
                    <Label className="text-white font-medium">Featured Show</Label>
                    <p className="text-sm text-gray-400">Display in featured carousel</p>
                  </div>
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      {id ? 'Update Show' : 'Create Show'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/shows')}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default ShowForm;
