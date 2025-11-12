import React from 'react';
import { Sparkles, Film, Users, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const Brand = () => {
  const partnerships = [
    {
      name: 'Premium Studios',
      logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
      description: 'Exclusive drama series and original content',
    },
    {
      name: 'Creative Productions',
      logo: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=200&h=200&fit=crop',
      description: 'Award-winning storytelling and cinematography',
    },
    {
      name: 'Digital Entertainment',
      logo: 'https://images.unsplash.com/photo-1611162618479-ee3d24aaef0b?w=200&h=200&fit=crop',
      description: 'Leading digital content distribution',
    },
  ];

  return (
    <div className="min-h-screen bg-black pt-24 px-12 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-block p-3 bg-pink-500/20 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-pink-500" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">ReelShort Brand</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Revolutionizing short-form entertainment with bite-sized dramatic content that captivates millions of viewers worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-500/50 text-center">
            <CardContent className="pt-6">
              <Film className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">500+</p>
              <p className="text-sm text-pink-300">Original Series</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-500/50 text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">10M+</p>
              <p className="text-sm text-pink-300">Active Users</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-500/50 text-center">
            <CardContent className="pt-6">
              <Award className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">50+</p>
              <p className="text-sm text-pink-300">Industry Awards</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-500/50 text-center">
            <CardContent className="pt-6">
              <Sparkles className="w-8 h-8 text-pink-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-1">1B+</p>
              <p className="text-sm text-pink-300">Total Views</p>
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <Card className="bg-gray-900 border-gray-800 mb-16">
          <CardHeader>
            <CardTitle className="text-white text-3xl">About ReelShort</CardTitle>
            <CardDescription className="text-gray-400 text-lg">The future of entertainment</CardDescription>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-4">
            <p>
              ReelShort is a next-generation streaming platform that delivers premium short-form dramatic content. Our mission is to revolutionize how people consume entertainment by offering bite-sized episodes that fit perfectly into modern lifestyles.
            </p>
            <p>
              With a focus on high-quality storytelling, diverse genres, and engaging narratives, ReelShort has become the go-to platform for millions of viewers seeking quick entertainment that doesn't compromise on quality.
            </p>
            <p>
              Our innovative coin-based system allows viewers to unlock premium content while supporting creators, fostering a sustainable ecosystem for digital entertainment.
            </p>
          </CardContent>
        </Card>

        {/* Partnerships */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Partners</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {partnerships.map((partner, idx) => (
              <Card key={idx} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
                <CardContent className="p-6 text-center">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-bold text-white mb-2">{partner.name}</h3>
                  <p className="text-gray-400">{partner.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-pink-500 to-rose-600 border-none text-center">
          <CardContent className="p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Partner With Us</h2>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              Join the ReelShort family and reach millions of engaged viewers. We're always looking for innovative content creators and strategic partners.
            </p>
            <Button
              size="lg"
              className="bg-white text-pink-600 hover:bg-gray-100 font-bold text-lg px-8"
            >
              Contact Us
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Brand;
