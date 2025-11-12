import React from 'react';
import { MessageCircle, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

const Fandom = () => {
  const discussions = [
    {
      id: 1,
      title: 'Who else is obsessed with Betrayed Alpha Queen?',
      author: 'Emma Stone',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      replies: 234,
      likes: 1203,
      time: '2 hours ago',
    },
    {
      id: 2,
      title: 'Plot twist in Episode 45 of Tell Me Not to Love You!!!',
      author: 'James Wilson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      replies: 189,
      likes: 892,
      time: '5 hours ago',
    },
    {
      id: 3,
      title: 'Best romance series recommendations?',
      author: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      replies: 156,
      likes: 645,
      time: '1 day ago',
    },
  ];

  const trendingTopics = [
    { tag: '#BetrayedAlphaQueen', posts: 15234 },
    { tag: '#FlashMarriage', posts: 12456 },
    { tag: '#BillionaireRomance', posts: 10987 },
    { tag: '#HiddenIdentity', posts: 8765 },
    { tag: '#CEOBride', posts: 7543 },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Fandom Community</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Discussion Feed */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Popular Discussions</h2>
            {discussions.map((discussion) => (
              <Card key={discussion.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Avatar className="w-12 h-12 border-2 border-pink-500">
                      <AvatarImage src={discussion.avatar} />
                      <AvatarFallback className="bg-pink-500 text-white">
                        {discussion.author[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{discussion.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">
                        Posted by {discussion.author} • {discussion.time}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          {discussion.replies} replies
                        </span>
                        <span className="flex items-center gap-1 hover:text-pink-500 transition-colors">
                          <TrendingUp className="w-4 h-4" />
                          {discussion.likes} likes
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <Card className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-3xl font-bold text-white">2.5M+</p>
                    <p className="text-sm text-pink-300">Active Members</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">15K+</p>
                    <p className="text-sm text-pink-300">Discussions Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trending Topics */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-pink-500" />
                  Trending Topics
                </CardTitle>
                <CardDescription className="text-gray-400">Popular hashtags today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trendingTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <span className="text-pink-400 font-semibold">{topic.tag}</span>
                      <span className="text-sm text-gray-400">{topic.posts.toLocaleString()} posts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fandom;
