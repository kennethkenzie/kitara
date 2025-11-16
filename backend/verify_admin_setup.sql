-- Verification Script - Check Admin Setup
-- Run this in Supabase SQL Editor to diagnose the issue

-- Check 1: Does the user exist?
SELECT 
    'User Check' as test,
    id, 
    email, 
    name, 
    is_admin, 
    coins,
    created_at
FROM users 
WHERE email = 'kennethkenzie48@gmail.com';

-- Check 2: Does is_admin column exist?
SELECT 
    'Column Check' as test,
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'is_admin';

-- Check 3: Check RLS policies on users table
SELECT 
    'RLS Policies' as test,
    schemaname, 
    tablename, 
    policyname, 
    cmd
FROM pg_policies 
WHERE tablename = 'users';

-- Check 4: If user doesn't exist, let's find the correct user ID
SELECT 
    'All Users Check' as test,
    id,
    email,
    COALESCE(is_admin, FALSE) as is_admin
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Fix: Create/Update the user with admin privileges
-- Uncomment and run this if the user doesn't exist or is_admin is false:

/*
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
    email = 'kennethkenzie48@gmail.com',
    is_admin = TRUE,
    updated_at = NOW();
*/
