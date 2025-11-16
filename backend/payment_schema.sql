-- Payment System Schema Update
-- Replace coins with real payment tracking

-- Add payment-related columns to users table
ALTER TABLE users DROP COLUMN IF EXISTS coins;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_type TEXT DEFAULT 'free'; -- 'free', 'monthly', 'annual'
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_episodes_purchased INTEGER DEFAULT 0;

-- Update episodes table
ALTER TABLE episodes DROP COLUMN IF EXISTS coins_required;
ALTER TABLE episodes ADD COLUMN IF NOT EXISTS price_ugx INTEGER DEFAULT 200;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_type TEXT NOT NULL, -- 'episode', 'subscription'
    payment_method TEXT NOT NULL, -- 'mtn', 'airtel'
    amount_ugx INTEGER NOT NULL,
    phone_number TEXT NOT NULL,
    transaction_id TEXT UNIQUE,
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    reference TEXT, -- Episode ID or subscription plan
    provider_response JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_episode_purchases table
CREATE TABLE IF NOT EXISTS user_episode_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    purchased_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, episode_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_user_episode_purchases_user_id ON user_episode_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_episode_purchases_episode_id ON user_episode_purchases(episode_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_episode_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
        )
    );

CREATE POLICY "System can update payments" ON payments
    FOR UPDATE USING (true);

-- RLS Policies for user_episode_purchases
CREATE POLICY "Users can view their own purchases" ON user_episode_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON user_episode_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON user_episode_purchases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = TRUE
        )
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON payments TO authenticated;
GRANT SELECT, INSERT ON user_episode_purchases TO authenticated;

-- Function to check if user has access to episode
CREATE OR REPLACE FUNCTION user_has_episode_access(p_user_id UUID, p_episode_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_episode_number INTEGER;
    v_subscription_expires TIMESTAMP;
    v_has_purchased BOOLEAN;
BEGIN
    -- Get episode number
    SELECT episode_number INTO v_episode_number
    FROM episodes
    WHERE id = p_episode_id;
    
    -- First 5 episodes are free
    IF v_episode_number <= 5 THEN
        RETURN TRUE;
    END IF;
    
    -- Check subscription
    SELECT subscription_expires_at INTO v_subscription_expires
    FROM users
    WHERE id = p_user_id;
    
    IF v_subscription_expires IS NOT NULL AND v_subscription_expires > NOW() THEN
        RETURN TRUE;
    END IF;
    
    -- Check individual purchase
    SELECT EXISTS(
        SELECT 1
        FROM user_episode_purchases
        WHERE user_id = p_user_id
        AND episode_id = p_episode_id
    ) INTO v_has_purchased;
    
    RETURN v_has_purchased;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Payment system schema created!';
    RAISE NOTICE '✓ Coins system removed';
    RAISE NOTICE '✓ Episodes now cost 200 UGX each (first 5 free)';
    RAISE NOTICE '✓ Subscription support added';
END $$;
