-- Seed data for Kitara Cinema
-- Run this AFTER creating the schema

-- Temporarily disable RLS for seeding
ALTER TABLE shows DISABLE ROW LEVEL SECURITY;
ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;

-- Insert shows
INSERT INTO shows (title, thumbnail, category, rating, views, total_episodes, is_exclusive, description, duration, is_featured) VALUES
('He Said the Baby Was Too Expensive', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&h=400&fit=crop', 'romance', 4.8, '2.5M', 45, true, 'A gripping tale of love, betrayal, and unexpected revelations.', '1-3 min per episode', false),
('Blood & Silver: Rise of the Alpha''s Rejected Mate', 'https://images.unsplash.com/photo-1534126511673-b6899657816a?w=300&h=400&fit=crop', 'fantasy', 4.9, '3.2M', 60, true, 'A werewolf romance filled with power, passion, and revenge.', '1-3 min per episode', false),
('Fated to Find You', 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=300&h=400&fit=crop', 'romance', 4.7, '1.8M', 38, false, 'Destiny brings two souls together in the most unexpected way.', '1-3 min per episode', false),
('Tell Me Not to Love You', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=400&fit=crop', 'romance', 4.8, '2.8M', 46, false, 'Sometimes love finds you when you least expect it.', '1-3 min per episode', true),
('The Secret Between US', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop', 'thriller', 4.8, '2.9M', 50, false, 'Dark secrets threaten to destroy everything they hold dear.', '1-3 min per episode', true),
('Betrayed Alpha Queen Rises from the Ashes', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&h=400&fit=crop', 'fantasy', 4.9, '3.5M', 55, true, 'A fallen queen rises to reclaim her throne and her destiny.', '1-3 min per episode', true),
('The Art of Letting Go', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop', 'drama', 4.5, '1.5M', 32, false, 'Learning to let go is the hardest lesson of all.', '1-3 min per episode', false),
('Country Gal to CEO''s Bride', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop', 'romance', 4.7, '2.3M', 40, true, 'From small town girl to the bride of a billionaire CEO.', '1-3 min per episode', false),
('Mother Warrior Unleashed', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop', 'action', 4.8, '2.7M', 48, false, 'A mother will do anything to protect her family.', '1-3 min per episode', false),
('Twilight Romance: Flash Marriage to Mature Tycoon', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop', 'romance', 4.6, '2.0M', 36, true, 'A whirlwind marriage leads to unexpected love.', '1-3 min per episode', false),
('My Billionaire Ever After', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop', 'romance', 4.9, '3.1M', 52, true, 'Finding true love with a billionaire changes everything.', '1-3 min per episode', false),
('Married In A Heartbeat', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300&h=400&fit=crop', 'romance', 4.7, '2.4M', 44, true, 'Love at first sight leads to a spontaneous marriage.', '1-3 min per episode', false),
('The Shadow Conspiracy', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&h=400&fit=crop', 'thriller', 4.9, '3.0M', 58, true, 'Uncover the truth before it''s too late.', '1-3 min per episode', false),
('Hidden Identity', 'https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?w=300&h=400&fit=crop', 'mystery', 4.7, '2.2M', 41, false, 'Who is she really? The truth will shock you.', '1-3 min per episode', false),
('Falling For My Ex''s General Dad', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=400&fit=crop', 'romance', 4.6, '2.1M', 42, true, 'A forbidden romance that defies all expectations.', '1-3 min per episode', false);

-- Insert episodes for first show (as example - repeat pattern for others)
-- This will create 10 episodes for each show
DO $$
DECLARE
    show_record RECORD;
    ep_num INTEGER;
BEGIN
    FOR show_record IN SELECT id, total_episodes FROM shows LOOP
        FOR ep_num IN 1..LEAST(10, show_record.total_episodes) LOOP
            INSERT INTO episodes (show_id, episode_number, title, duration, is_locked, thumbnail, coins_required)
            VALUES (
                show_record.id,
                ep_num,
                'Episode ' || ep_num,
                60 + (ep_num * 10),
                ep_num > 5,
                'https://images.unsplash.com/photo-' || (1500000000000 + ep_num) || '?w=200&h=120&fit=crop',
                CASE WHEN ep_num > 5 THEN (ep_num - 5) * 10 ELSE 0 END
            );
        END LOOP;
    END LOOP;
END $$;

-- Re-enable RLS
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
