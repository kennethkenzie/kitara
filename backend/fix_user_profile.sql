-- Complete Fix for User Profile Issues
-- Run this entire script in Supabase SQL Editor

-- Step 1: Drop the problematic RLS policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;

-- Step 2: Create better RLS policies
-- Allow users to view their own profile OR admins to view all
CREATE POLICY "Users can view own profile or admins view all" ON users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM users AS admin_users
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_admin = TRUE
        )
    );

-- Allow users to update their own profile OR admins to update any
CREATE POLICY "Users can update own profile or admins update any" ON users
    FOR UPDATE
    USING (
        auth.uid() = id 
        OR 
        EXISTS (
            SELECT 1 FROM users AS admin_users
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_admin = TRUE
        )
    );

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Step 3: Insert/Update your user profile
INSERT INTO public.users (id, email, name, avatar, coins, is_admin, created_at, updated_at)
VALUES (
  '76ea9a89-c98a-4d0d-8a8a-a04686f7d14b',
  'kennethkenzie48@gmail.com',
  'Kenneth',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  150,
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE 
SET 
    email = EXCLUDED.email,
    is_admin = EXCLUDED.is_admin,
    updated_at = NOW();

-- Step 4: Verify the user exists
SELECT id, email, name, is_admin, coins FROM users WHERE id = '76ea9a89-c98a-4d0d-8a8a-a04686f7d14b';

-- Step 5: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✓ User profile fix complete!';
    RAISE NOTICE '✓ Email: kennethkenzie48@gmail.com is now an admin';
    RAISE NOTICE '✓ Refresh your browser to see changes';
END $$;
