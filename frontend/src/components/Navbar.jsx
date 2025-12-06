import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Download, History, ChevronDown, User, LogOut, Settings, Heart, Menu, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hideNavbar, setHideNavbar] = useState(false);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  // Hide navbar on mobile home page (feed view)
  useEffect(() => {
    const checkPath = () => {
      const isMobile = window.innerWidth < 768;
      const isHomePage = window.location.pathname === '/';
      setHideNavbar(isMobile && isHomePage);
    };
    
    checkPath();
    window.addEventListener('resize', checkPath);
    window.addEventListener('popstate', checkPath);
    
    return () => {
      window.removeEventListener('resize', checkPath);
      window.removeEventListener('popstate', checkPath);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Don't render navbar on mobile feed
  if (hideNavbar) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center font-bold text-white text-lg md:text-xl transition-transform group-hover:scale-105">
            E
          </div>
          <span className="text-xl md:text-2xl font-bold text-white">Ekitara Cinema</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
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
          {profile?.is_admin && (
            <Link
              to="/admin"
              className="text-yellow-400 font-semibold hover:text-yellow-300 transition-colors"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Right Side Actions - Desktop */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {/* Search */}
          <button
            onClick={() => navigate('/search')}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors group"
          >
            <Search className="w-5 h-5" />
            <span className="text-xs hidden xl:block">Search</span>
          </button>

          {/* Download */}
          <button className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors group">
            <Download className="w-5 h-5" />
            <span className="text-xs hidden xl:block">Download</span>
          </button>

          {/* History */}
          <button
            onClick={() => navigate('/history')}
            className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors group"
          >
            <History className="w-5 h-5" />
            <span className="text-xs hidden xl:block">History</span>
          </button>

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors">
                <span className="text-sm">EN</span>
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
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="transition-transform hover:scale-105">
                  <Avatar className="w-9 h-9 border-2 border-pink-500">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="bg-pink-500 text-white">
                      {profile.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-900 border-gray-800 w-56">
                <div className="px-3 py-2 border-b border-gray-800">
                  <p className="text-white font-semibold">{profile.name}</p>
                  <p className="text-sm text-gray-400">{profile.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold">C</div>
                    <span className="text-yellow-400 font-semibold">{profile.coins} Coins</span>
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
                <DropdownMenuItem onClick={handleSignOut} className="text-pink-500 hover:bg-gray-800 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm px-4"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && profile ? (
            <Avatar className="w-8 h-8 border-2 border-pink-500" onClick={() => navigate('/profile')}>
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="bg-pink-500 text-white text-sm">
                {profile.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Button
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm px-3 py-1"
            >
              Sign In
            </Button>
          )}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/98 border-t border-gray-800">
          <div className="px-4 py-4 space-y-4">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-pink-500 font-semibold hover:text-pink-400 transition-colors py-2"
            >
              Home
            </Link>
            <Link
              to="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors py-2"
            >
              Categories
            </Link>
            <Link
              to="/fandom"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors py-2"
            >
              Fandom
            </Link>
            <Link
              to="/brand"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-gray-300 hover:text-white transition-colors py-2"
            >
              Brand
            </Link>
            {profile?.is_admin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-yellow-400 font-semibold hover:text-yellow-300 transition-colors py-2"
              >
                Admin
              </Link>
            )}
            <div className="border-t border-gray-800 pt-4 space-y-4">
              <button
                onClick={() => handleNavClick('/search')}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors py-2 w-full"
              >
                <Search className="w-5 h-5" />
                <span>Search</span>
              </button>
              <button
                onClick={() => handleNavClick('/history')}
                className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors py-2 w-full"
              >
                <History className="w-5 h-5" />
                <span>History</span>
              </button>
              {user && profile && (
                <>
                  <button
                    onClick={() => handleNavClick('/watchlist')}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors py-2 w-full"
                  >
                    <Heart className="w-5 h-5" />
                    <span>My Watchlist</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-pink-500 hover:text-pink-400 transition-colors py-2 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
