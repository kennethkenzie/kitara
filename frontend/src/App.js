import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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
            <Route path="/player/:showId/:episodeNumber" element={<VideoPlayer />} />
            <Route path="/search" element={<Search />} />
            <Route path="/history" element={<History />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/fandom" element={<Fandom />} />
            <Route path="/brand" element={<Brand />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
