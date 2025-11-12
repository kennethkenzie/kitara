import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Download, History, ChevronDown, User, LogOut, Settings, Heart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { user } from '../mockData';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-[1920px] mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center font-bold text-white text-xl transition-transform group-hover:scale-105">
            K
          </div>
          <span className="text-2xl font-bold text-white">Kitara Cinema</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-pink-500 font-semibold hover:text-pink-400 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/categories"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Categories
          </Link>
          <Link
            to="/fandom"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Fandom
          </Link>
          <Link
            to="/brand"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Brand
          </Link>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors group"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs">Search</span>
          </button>

          {/* Download */}
          <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors group">
            <Download className="w-5 h-5" />
            <span className="text-xs">Download</span>
          </button>

          {/* History */}
          <button
            onClick={() => navigate('/history')}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors group"
          >
            <History className="w-5 h-5" />
            <span className="text-xs">History</span>
          </button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
                <span className="text-sm">English</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-800">
              <DropdownMenuItem className="text-white hover:bg-gray-800">English</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-800">Español</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-800">Français</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="transition-transform hover:scale-105">
                <Avatar className="w-9 h-9 border-2 border-pink-500">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-pink-500 text-white">GU</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-800 w-56">
              <div className="px-3 py-2 border-b border-gray-800">
                <p className="text-white font-semibold">{user.name}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">C</div>
                  <span className="text-yellow-400 font-semibold">{user.coins} Coins</span>
                </div>
              </div>
              <DropdownMenuItem onClick={() => navigate('/profile')} className="text-white hover:bg-gray-800 cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/watchlist')} className="text-white hover:bg-gray-800 cursor-pointer">
                <Heart className="w-4 h-4 mr-2" />
                My Watchlist
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-gray-800 cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem className="text-pink-500 hover:bg-gray-800 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
