import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import ShowDetails from "./pages/ShowDetails";
import VideoPlayer from "./pages/VideoPlayer";
import Search from "./pages/Search";
import History from "./pages/History";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";
import Fandom from "./pages/Fandom";
import Brand from "./pages/Brand";
import Auth from "./pages/Auth";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/show/:id" element={<ShowDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/fandom" element={<Fandom />} />
            <Route path="/brand" element={<Brand />} />
            
            {/* Protected Routes - Require Authentication */}
            <Route path="/player/:showId/:episodeNumber" element={
              <ProtectedRoute>
                <VideoPlayer />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <Watchlist />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
