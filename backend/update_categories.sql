-- Update categories to match the new structure: Fantasy, Drama, Comedy, Action, Mystery, Horror

-- Update Fantasy & Adventure to Fantasy
UPDATE shows SET category = 'Fantasy' WHERE category = 'Fantasy & Adventure';

-- Update Thriller & Mystery to Mystery
UPDATE shows SET category = 'Mystery' WHERE category = 'Thriller & Mystery';

-- Update Romance shows to Drama
UPDATE shows SET category = 'Drama' WHERE category = 'Romance';

-- Update Sci-Fi to Action
UPDATE shows SET category = 'Action' WHERE category = 'Sci-Fi';

-- Update Documentary to Drama
UPDATE shows SET category = 'Drama' WHERE category = 'Documentary';

-- Update Reality to Comedy
UPDATE shows SET category = 'Comedy' WHERE category = 'Reality';

-- Update Thriller to Mystery
UPDATE shows SET category = 'Mystery' WHERE category = 'Thriller';

-- Add new Action shows
INSERT INTO shows (title, thumbnail, category, rating, views, total_episodes, is_exclusive, description, duration, is_featured) VALUES
('Thunder Strike', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80', 'Action', 4.8, '3.2M', 16, true, 'An elite special forces team takes on dangerous missions across the continent to stop international criminals.', '48 min', true),
('Street Warriors', 'https://images.unsplash.com/photo-1517344800994-a0e8f8579d9c?w=800&q=80', 'Action', 4.6, '2.7M', 14, false, 'Underground fighters compete in high-stakes tournaments while battling organized crime.', '45 min', true),
('The Heist', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80', 'Action', 4.7, '2.9M', 12, true, 'A master thief assembles a crew for the most ambitious heist in African history.', '50 min', false),
('Rapid Force', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80', 'Action', 4.5, '2.4M', 15, false, 'A rapid response police unit takes on the most dangerous criminals in the city.', '43 min', false),
('Explosive Justice', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=800&q=80', 'Action', 4.9, '3.4M', 18, true, 'An ex-military operative seeks justice and revenge against those who betrayed him.', '52 min', true),
('Black Ops', 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80', 'Action', 4.7, '3.0M', 13, true, 'Secret agents conduct covert operations to protect national security and prevent global threats.', '46 min', false),
('Adrenaline Rush', 'https://images.unsplash.com/photo-1542740348-39501cd6e2b4?w=800&q=80', 'Action', 4.4, '2.1M', 11, false, 'Extreme sports athletes push their limits while uncovering a dangerous conspiracy.', '40 min', false),

-- Add more Comedy shows
('Laugh Riots', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80', 'Comedy', 4.5, '2.0M', 12, false, 'A comedy troupe navigates the ups and downs of showbiz while creating hilarious sketches.', '30 min', true),
('The Roommates', 'https://images.unsplash.com/photo-1560439513-74b037a25d84?w=800&q=80', 'Comedy', 4.6, '2.2M', 14, false, 'Four unlikely roommates share an apartment and get into absurd situations daily.', '28 min', false),
('Office Shenanigans', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80', 'Comedy', 4.3, '1.8M', 16, false, 'The hilarious daily lives of employees at a dysfunctional tech startup.', '32 min', false),
('Family Chaos', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80', 'Comedy', 4.7, '2.5M', 15, true, 'A chaotic family tries to run a restaurant while dealing with their eccentric relatives.', '35 min', true),

-- Add more Horror shows
('Nightmare Alley', 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&q=80', 'Horror', 4.6, '2.3M', 10, true, 'A street where residents experience their worst nightmares coming to life every night.', '42 min', true),
('The Cursed Village', 'https://images.unsplash.com/photo-1603152277539-2f484a22ca1d?w=800&q=80', 'Horror', 4.8, '2.8M', 12, true, 'A journalist investigates mysterious deaths in a remote village plagued by an ancient curse.', '45 min', true),
('Dark Spirits', 'https://images.unsplash.com/photo-1574073829517-e076e0c26699?w=800&q=80', 'Horror', 4.5, '2.1M', 11, false, 'A paranormal investigator battles malevolent spirits haunting families across the country.', '40 min', false),
('The Haunting Hour', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80', 'Horror', 4.7, '2.6M', 13, true, 'Anthology series featuring different terrifying tales of supernatural encounters.', '38 min', false);

-- Generate episodes for all new shows
DO $$
DECLARE
    show_rec RECORD;
    i INTEGER;
BEGIN
    FOR show_rec IN 
        SELECT s.id, s.total_episodes 
        FROM shows s
        LEFT JOIN episodes e ON s.id = e.show_id
        WHERE e.id IS NULL
        GROUP BY s.id, s.total_episodes
    LOOP
        FOR i IN 1..show_rec.total_episodes LOOP
            INSERT INTO episodes (show_id, episode_number, title, duration, is_locked, thumbnail, coins_required)
            VALUES (
                show_rec.id,
                i,
                'Episode ' || i,
                CASE 
                    WHEN i <= 3 THEN 2400
                    ELSE 2700
                END,
                CASE 
                    WHEN i <= 2 THEN false
                    ELSE true
                END,
                'https://images.unsplash.com/photo-1574267432644-f610f6733e3d?w=800&q=80',
                CASE 
                    WHEN i <= 2 THEN 0
                    ELSE 10
                END
            );
        END LOOP;
    END LOOP;
END $$;
