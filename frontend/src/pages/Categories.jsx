import React, { useState, useEffect } from 'react';
import { showsAPI } from '../services/api';
import ShowCard from '../components/ShowCard';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Loader2 } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Shows' },
  { id: 'romance', name: 'Romance' },
  { id: 'thriller', name: 'Thriller' },
  { id: 'fantasy', name: 'Fantasy' },
  { id: 'drama', name: 'Drama' },
  { id: 'comedy', name: 'Comedy' },
  { id: 'action', name: 'Action' },
  { id: 'mystery', name: 'Mystery' },
  { id: 'horror', name: 'Horror' },
];

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShows();
  }, [selectedCategory]);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const data = await showsAPI.getAll(params);
      setShows(data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <h1 className="text-4xl font-bold text-white mb-8">Browse by Category</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800 p-1 mb-8 flex-wrap h-auto gap-2">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-300"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {shows.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>

            {shows.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg">No shows found in this category.</p>
              </div>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
};

export default Categories;
