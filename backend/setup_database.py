"""
Script to set up Supabase database schema and seed initial data
Run this once to initialize the database
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_KEY = os.environ['SUPABASE_KEY']

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# SQL to create tables
CREATE_TABLES_SQL = """
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create shows table
CREATE TABLE IF NOT EXISTS shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    category TEXT NOT NULL,
    rating DECIMAL(2,1) NOT NULL,
    views TEXT NOT NULL,
    total_episodes INTEGER NOT NULL,
    is_exclusive BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS episodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    duration INTEGER NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    thumbnail TEXT NOT NULL,
    coins_required INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(show_id, episode_number)
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar TEXT,
    coins INTEGER DEFAULT 150,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, show_id)
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    watched_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shows_category ON shows(category);
CREATE INDEX IF NOT EXISTS idx_shows_featured ON shows(is_featured);
CREATE INDEX IF NOT EXISTS idx_episodes_show_id ON episodes(show_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shows and episodes (public read)
CREATE POLICY "Shows are viewable by everyone" ON shows FOR SELECT USING (true);
CREATE POLICY "Episodes are viewable by everyone" ON episodes FOR SELECT USING (true);

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for watchlist
CREATE POLICY "Users can view their own watchlist" ON watchlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own watchlist" ON watchlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete from their own watchlist" ON watchlist FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for watch_history
CREATE POLICY "Users can view their own watch history" ON watch_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert into their own watch history" ON watch_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own watch history" ON watch_history FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Guest User'),
        COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
"""

# Seed data for shows
SHOWS_DATA = [
    {
        "title": "He Said the Baby Was Too Expensive",
        "thumbnail": "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&h=400&fit=crop",
        "category": "romance",
        "rating": 4.8,
        "views": "2.5M",
        "total_episodes": 45,
        "is_exclusive": True,
        "description": "A gripping tale of love, betrayal, and unexpected revelations.",
        "duration": "1-3 min per episode",
        "is_featured": False
    },
    {
        "title": "Blood & Silver: Rise of the Alpha's Rejected Mate",
        "thumbnail": "https://images.unsplash.com/photo-1534126511673-b6899657816a?w=300&h=400&fit=crop",
        "category": "fantasy",
        "rating": 4.9,
        "views": "3.2M",
        "total_episodes": 60,
        "is_exclusive": True,
        "description": "A werewolf romance filled with power, passion, and revenge.",
        "duration": "1-3 min per episode",
        "is_featured": False
    },
    {
        "title": "Fated to Find You",
        "thumbnail": "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=300&h=400&fit=crop",
        "category": "romance",
        "rating": 4.7,
        "views": "1.8M",
        "total_episodes": 38,
        "is_exclusive": False,
        "description": "Destiny brings two souls together in the most unexpected way.",
        "duration": "1-3 min per episode",
        "is_featured": False
    },
    {
        "title": "Tell Me Not to Love You",
        "thumbnail": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop",
        "category": "romance",
        "rating": 4.8,
        "views": "2.8M",
        "total_episodes": 46,
        "is_exclusive": False,
        "description": "Sometimes love finds you when you least expect it.",
        "duration": "1-3 min per episode",
        "is_featured": True
    },
    {
        "title": "The Secret Between US",
        "thumbnail": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
        "category": "thriller",
        "rating": 4.8,
        "views": "2.9M",
        "total_episodes": 50,
        "is_exclusive": False,
        "description": "Dark secrets threaten to destroy everything they hold dear.",
        "duration": "1-3 min per episode",
        "is_featured": True
    },
    {
        "title": "Betrayed Alpha Queen Rises from the Ashes",
        "thumbnail": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop",
        "category": "fantasy",
        "rating": 4.9,
        "views": "3.5M",
        "total_episodes": 55,
        "is_exclusive": True,
        "description": "A fallen queen rises to reclaim her throne and her destiny.",
        "duration": "1-3 min per episode",
        "is_featured": True
    },
]

def setup_database():
    print("="*60)
    print("Kitara Cinema - Database Seeding Script")
    print("="*60)
    
    # Try to seed shows data
    try:
        print("\nChecking existing data...")
        response = supabase.table('shows').select('id').execute()
        
        # Check if table exists and has data
        if response.data is not None:
            existing_count = len(response.data)
            if existing_count > 0:
                print(f"✓ Database already has {existing_count} shows. Skipping seed.")
                return
            
            print("\nSeeding shows and episodes...")
            print("Note: If you get RLS policy errors, run the SQL below in Supabase SQL Editor:")
            print("\n-- Temporarily disable RLS for seeding")
            print("ALTER TABLE shows DISABLE ROW LEVEL SECURITY;")
            print("ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;")
            print("\nThen run this script again, and re-enable RLS after:\n")
            print("ALTER TABLE shows ENABLE ROW LEVEL SECURITY;")
            print("ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;")
            print("\n" + "="*60 + "\n")
            
            # Insert shows
            for show_data in SHOWS_DATA:
                result = supabase.table('shows').insert(show_data).execute()
                if result.data:
                    print(f"✓ Inserted: {show_data['title']}")
                    
                    # Create episodes for this show
                    show_id = result.data[0]['id']
                    total_eps = show_data['total_episodes']
                    
                    # Create first 10 episodes as sample
                    for ep_num in range(1, min(11, total_eps + 1)):
                        episode_data = {
                            "show_id": show_id,
                            "episode_number": ep_num,
                            "title": f"Episode {ep_num}",
                            "duration": 60 + (ep_num * 10),  # 70-160 seconds
                            "is_locked": ep_num > 5,  # First 5 free
                            "thumbnail": f"https://images.unsplash.com/photo-{1500000000000 + ep_num}?w=200&h=120&fit=crop",
                            "coins_required": (ep_num - 5) * 10 if ep_num > 5 else 0
                        }
                        supabase.table('episodes').insert(episode_data).execute()
                    
                    print(f"  Created {min(10, total_eps)} episodes")
            
            print("\n✓ Database seeded successfully!")
            print("\nDon't forget to re-enable RLS if you disabled it!")
            
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        print("\nTo fix RLS policy errors, run this SQL in Supabase SQL Editor:")
        print("\nALTER TABLE shows DISABLE ROW LEVEL SECURITY;")
        print("ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;")
        print("\nThen run this script again.")

if __name__ == "__main__":
    setup_database()
