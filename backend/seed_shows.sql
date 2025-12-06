-- Seed data for Kitara Cinema

-- Insert sample shows
INSERT INTO shows (title, thumbnail, category, rating, views, total_episodes, is_exclusive, description, duration, is_featured) VALUES
('The Last Kingdom', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80', 'Drama', 4.8, '2.5M', 12, true, 'Epic historical drama following the adventures of a warrior torn between two worlds.', '45 min', true),
('Cyber Warriors', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80', 'Sci-Fi', 4.5, '1.8M', 10, false, 'In a dystopian future, a group of hackers fights against a corrupt AI system.', '50 min', true),
('African Tales', 'https://images.unsplash.com/photo-1516535794938-1fd1584f5b90?w=800&q=80', 'Documentary', 4.9, '3.2M', 8, true, 'Breathtaking documentary series exploring the diverse cultures and landscapes of Africa.', '42 min', true),
('Love in Lagos', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80', 'Romance', 4.3, '1.5M', 15, false, 'A romantic comedy series set in the bustling city of Lagos, Nigeria.', '35 min', false),
('Mystery Manor', 'https://images.unsplash.com/photo-1580654712603-eb43273aff33?w=800&q=80', 'Thriller', 4.6, '2.1M', 10, true, 'A detective investigates strange occurrences in an old mansion with dark secrets.', '48 min', false),
('Comedy Central', 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&q=80', 'Comedy', 4.4, '1.9M', 20, false, 'Stand-up comedy specials from the best African comedians.', '30 min', true),
('Savanna Chronicles', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80', 'Documentary', 4.7, '2.8M', 6, false, 'Wildlife documentary showcasing the incredible biodiversity of the African savanna.', '52 min', false),
('Tech Titans', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', 'Drama', 4.5, '1.7M', 12, true, 'Inside the world of African tech startups and the entrepreneurs building them.', '44 min', false),
('Dance Revolution', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80', 'Reality', 4.2, '1.3M', 16, false, 'Talented dancers from across Africa compete for the ultimate prize.', '40 min', false),
('Urban Legends', 'https://images.unsplash.com/photo-1494376877685-d3d2559d4f82?w=800&q=80', 'Horror', 4.6, '2.2M', 8, true, 'Spine-chilling anthology series based on African urban legends and folklore.', '38 min', true);

-- Get show IDs for inserting episodes
DO $$
DECLARE
    show_rec RECORD;
    i INTEGER;
BEGIN
    -- Add episodes for each show
    FOR show_rec IN SELECT id, total_episodes FROM shows LOOP
        FOR i IN 1..show_rec.total_episodes LOOP
            INSERT INTO episodes (show_id, episode_number, title, duration, is_locked, thumbnail, coins_required)
            VALUES (
                show_rec.id,
                i,
                'Episode ' || i,
                CASE 
                    WHEN i <= 3 THEN 2400  -- First 3 episodes ~40 minutes
                    ELSE 2700              -- Rest ~45 minutes
                END,
                CASE 
                    WHEN i <= 2 THEN false  -- First 2 episodes are free
                    ELSE true               -- Rest are locked
                END,
                'https://images.unsplash.com/photo-1574267432644-f610f6733e3d?w=800&q=80',
                CASE 
                    WHEN i <= 2 THEN 0      -- Free episodes
                    ELSE 10                 -- Locked episodes cost 10 coins
                END
            );
        END LOOP;
    END LOOP;
END $$;
