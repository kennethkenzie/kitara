-- Additional shows for Romance, Fantasy & Adventure, Thriller & Mystery categories

-- Romance Shows
INSERT INTO shows (title, thumbnail, category, rating, views, total_episodes, is_exclusive, description, duration, is_featured) VALUES
('Hearts Entwined', 'https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800&q=80', 'Romance', 4.7, '2.3M', 14, false, 'Two souls from different worlds find unexpected love in the bustling streets of Nairobi.', '38 min', true),
('Sunset Boulevard', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80', 'Romance', 4.6, '1.9M', 12, true, 'A chance encounter at sunset changes the lives of two strangers forever.', '35 min', false),
('The Wedding Planner', 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80', 'Romance', 4.4, '1.7M', 10, false, 'A professional wedding planner finds herself falling for the groom of her biggest client.', '40 min', false),
('Forbidden Love', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80', 'Romance', 4.8, '2.6M', 16, true, 'Star-crossed lovers navigate family feuds and societal expectations in modern Africa.', '42 min', true),
('Second Chances', 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=800&q=80', 'Romance', 4.5, '1.8M', 11, false, 'After a painful breakup, two former lovers reunite years later and rediscover their connection.', '36 min', false),

-- Fantasy & Adventure Shows
('Quest for the Golden Crown', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80', 'Fantasy & Adventure', 4.9, '3.5M', 18, true, 'A young hero embarks on an epic journey across mystical African kingdoms to recover an ancient crown.', '52 min', true),
('Mystic Warriors', 'https://images.unsplash.com/photo-1589900544880-6d8070061a29?w=800&q=80', 'Fantasy & Adventure', 4.7, '2.9M', 15, true, 'Elite warriors with supernatural powers defend their realm from dark forces.', '48 min', true),
('The Lost Kingdom', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', 'Fantasy & Adventure', 4.6, '2.4M', 13, false, 'Explorers discover a hidden civilization deep in the heart of Africa with magical abilities.', '45 min', false),
('Dragon Riders', 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80', 'Fantasy & Adventure', 4.8, '3.1M', 16, true, 'In a world where dragons exist, chosen riders bond with these majestic creatures to protect their land.', '50 min', true),
('Portal Chronicles', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Fantasy & Adventure', 4.5, '2.2M', 12, false, 'A magical portal connects modern Africa to ancient realms, and only the chosen can pass through.', '44 min', false),
('Legends of the Ancestors', 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80', 'Fantasy & Adventure', 4.7, '2.7M', 14, false, 'Ancient spirits guide young warriors on quests to restore balance to their world.', '46 min', false),

-- Thriller & Mystery Shows
('Shadow Detective', 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=800&q=80', 'Thriller & Mystery', 4.8, '2.8M', 15, true, 'A brilliant detective hunts a serial killer who leaves cryptic clues at each crime scene.', '47 min', true),
('The Vanishing', 'https://images.unsplash.com/photo-1478030279564-93f8e48cb4e6?w=800&q=80', 'Thriller & Mystery', 4.6, '2.3M', 12, false, 'People mysteriously disappear without a trace, and one investigator is determined to find the truth.', '43 min', true),
('Conspiracy Theory', 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80', 'Thriller & Mystery', 4.5, '2.0M', 11, false, 'A journalist uncovers a web of lies and corruption at the highest levels of power.', '41 min', false),
('Night Stalker', 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&q=80', 'Thriller & Mystery', 4.7, '2.5M', 13, true, 'A detective races against time to catch a killer who only strikes at night.', '45 min', false),
('The Last Witness', 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?w=800&q=80', 'Thriller & Mystery', 4.9, '3.0M', 14, true, 'The only witness to a brutal crime must stay alive long enough to testify.', '49 min', true),
('Hidden Identity', 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800&q=80', 'Thriller & Mystery', 4.4, '1.8M', 10, false, 'An amnesiac must piece together their past while running from unknown enemies.', '40 min', false),
('Code Red', 'https://images.unsplash.com/photo-1516575150278-77136aed6920?w=800&q=80', 'Thriller & Mystery', 4.6, '2.2M', 12, false, 'A cybersecurity expert must stop a hacker from launching a devastating attack.', '42 min', false);

-- Generate episodes for all new shows
DO $$
DECLARE
    show_rec RECORD;
    i INTEGER;
BEGIN
    -- Add episodes for shows that don't have any yet
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
