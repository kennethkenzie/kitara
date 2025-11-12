import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye } from 'lucide-react';
import { Badge } from './ui/badge';

const ShowCard = ({ show }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/show/${show.id}`)}
      className="group cursor-pointer flex-shrink-0 w-[240px] transition-transform hover:scale-105 duration-300"
    >
      <div className="relative overflow-hidden rounded-lg aspect-[3/4] bg-gray-800">
        <img
          src={show.thumbnail}
          alt={show.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
        />
        {show.isExclusive && (
          <Badge className="absolute top-2 left-2 bg-pink-500 text-white border-none text-xs font-bold">
            EXCLUSIVE
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Eye className="w-3 h-3" />
            <span>{show.views}</span>
            <span>•</span>
            <span>{show.episodes} episodes</span>
          </div>
        </div>
      </div>
      <h3 className="mt-2 text-white font-semibold text-sm line-clamp-2 group-hover:text-pink-400 transition-colors">
        {show.title}
      </h3>
    </div>
  );
};

export default ShowCard;
