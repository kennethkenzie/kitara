import React, { useState } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { Input } from '../components/ui/input';
import ShowCard from '../components/ShowCard';
import { shows } from '../mockData';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = shows.filter(
      (show) =>
        show.title.toLowerCase().includes(query.toLowerCase()) ||
        show.category.toLowerCase().includes(query.toLowerCase()) ||
        show.description.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(results);
  };

  const recentSearches = ['Romance', 'Thriller', 'Billionaire', 'Alpha', 'CEO'];
  const trendingSearches = ['Betrayed Alpha Queen', 'Flash Marriage', 'Hidden Identity', 'Mother Warrior'];

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold text-white mb-6">Search</h1>
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search shows, categories, or keywords..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-900 border-gray-800 text-white pl-12 pr-12 py-6 text-lg rounded-full focus:ring-2 focus:ring-pink-500"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {searchQuery === '' ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Recent Searches */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Recent Searches</h2>
            <div className="flex flex-wrap gap-3">
              {recentSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(term)}
                  className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-full text-gray-300 hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Searches */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Trending Searches</h2>
            <div className="flex flex-wrap gap-3">
              {trendingSearches.map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(term)}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500/20 to-rose-600/20 hover:from-pink-500/30 hover:to-rose-600/30 border border-pink-500/50 rounded-full text-pink-400 hover:text-pink-300 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Shows */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Popular Shows</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {shows.slice(0, 10).map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl text-gray-300 mb-6">
            {searchResults.length} results for "{searchQuery}"
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {searchResults.map((show) => (
                <ShowCard key={show.id} show={show} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <SearchIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No shows found matching "{searchQuery}"</p>
              <p className="text-gray-500 mt-2">Try different keywords or browse our categories</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
