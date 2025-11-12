import React, { useState } from 'react';
import { categories, shows } from '../mockData';
import ShowCard from '../components/ShowCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredShows =
    selectedCategory === 'all'
      ? shows
      : shows.filter((show) => show.category === selectedCategory);

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <h1 className="text-4xl font-bold text-white mb-8">Browse by Category</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-gray-900 border border-gray-800 p-1 mb-8 flex-wrap h-auto gap-2">
          <TabsTrigger
            value="all"
            onClick={() => setSelectedCategory('all')}
            className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-300"
          >
            All Shows
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.slug}
              onClick={() => setSelectedCategory(category.slug)}
              className="data-[state=active]:bg-pink-500 data-[state=active]:text-white text-gray-300"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {filteredShows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>

        {filteredShows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No shows found in this category.</p>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default Categories;
