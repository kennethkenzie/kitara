-- Admin Dashboard Schema Updates (Clean Version)
-- This version drops existing policies first to avoid conflicts

-- Add is_admin column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_admin') THEN
        ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create admin_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at DESC);

-- Enable RLS
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Admins can view admin logs" ON admin_logs;
DROP POLICY IF EXISTS "Admins can insert admin logs" ON admin_logs;
DROP POLICY IF EXISTS "Admins can insert shows" ON shows;
DROP POLICY IF EXISTS "Admins can update shows" ON shows;
DROP POLICY IF EXISTS "Admins can delete shows" ON shows;
DROP POLICY IF EXISTS "Admins can insert episodes" ON episodes;
DROP POLICY IF EXISTS "Admins can update episodes" ON episodes;
DROP POLICY IF EXISTS "Admins can delete episodes" ON episodes;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;

-- Recreate policies for admin_logs
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

-- Recreate policies for shows
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

-- Recreate policies for episodes
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

-- Recreate policies for users table
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

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON shows TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON episodes TO authenticated;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'Admin schema setup complete!';
    RAISE NOTICE 'Next step: UPDATE users SET is_admin = TRUE WHERE email = ''your-email@example.com'';';
END $$;
