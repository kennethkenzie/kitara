-- Admin Dashboard Schema Updates
-- Run this SQL in your Supabase SQL Editor

-- Add is_admin column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create admin_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for admin logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- Enable RLS for admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy for admin_logs (only admins can view)
CREATE POLICY "Admins can view admin logs" ON admin_logs 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can insert admin logs" ON admin_logs 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

-- Update RLS policies for shows and episodes to allow admin modifications
CREATE POLICY "Admins can insert shows" ON shows 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update shows" ON shows 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can delete shows" ON shows 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can insert episodes" ON episodes 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update episodes" ON episodes 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can delete episodes" ON episodes 
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.is_admin = TRUE
        )
    );

-- RLS Policy for users table (admins can view all users)
CREATE POLICY "Admins can view all users" ON users 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM users AS admin_users
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update any user" ON users 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM users AS admin_users
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_admin = TRUE
        )
    );

-- Create a default admin user (UPDATE EMAIL/PASSWORD AS NEEDED)
-- This will set the first user as admin, or you can manually set is_admin = true for specific users
-- UPDATE users SET is_admin = TRUE WHERE email = 'admin@kitaracinema.com';

-- Create analytics views for admin dashboard
CREATE OR REPLACE VIEW admin_stats AS
SELECT
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM shows) as total_shows,
    (SELECT COUNT(*) FROM episodes) as total_episodes,
    (SELECT COUNT(*) FROM watchlist) as total_watchlist_items,
    (SELECT COUNT(*) FROM watch_history) as total_views,
    (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
    (SELECT COUNT(*) FROM watch_history WHERE watched_at > NOW() - INTERVAL '30 days') as views_30d;

-- Grant access to the view
GRANT SELECT ON admin_stats TO authenticated;
