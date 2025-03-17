-- Create referrals table
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referral_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days',
    CONSTRAINT unique_referral_code UNIQUE (referral_code),
    CONSTRAINT unique_referee UNIQUE (referee_id)
);

-- Create index for faster lookups
CREATE INDEX referrals_referrer_id_idx ON referrals(referrer_id);
CREATE INDEX referrals_referral_code_idx ON referrals(referral_code);
CREATE INDEX referrals_status_idx ON referrals(status);

-- Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own referrals"
    ON referrals FOR SELECT
    USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals where they are the referee"
    ON referrals FOR SELECT
    USING (auth.uid() = referee_id);

CREATE POLICY "Users can create referrals"
    ON referrals FOR INSERT
    WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referrals"
    ON referrals FOR UPDATE
    USING (auth.uid() = referrer_id);

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 8-character code
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Check if code exists
        SELECT EXISTS (
            SELECT 1 FROM referrals WHERE referral_code = new_code
        ) INTO exists;
        
        -- If code doesn't exist, return it
        IF NOT exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle referral completion
CREATE OR REPLACE FUNCTION handle_referral_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if status changed to completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Set completed_at timestamp
        NEW.completed_at = NOW();
        
        -- Add points to referrer's profile
        UPDATE profiles
        SET total_points = total_points + NEW.points_earned
        WHERE id = NEW.referrer_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral completion
CREATE TRIGGER referral_completion_trigger
    BEFORE UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION handle_referral_completion();

-- Create function to check and expire old referrals
CREATE OR REPLACE FUNCTION expire_old_referrals()
RETURNS void AS $$
BEGIN
    UPDATE referrals
    SET status = 'expired'
    WHERE status = 'pending' AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to expire old referrals (runs daily)
SELECT cron.schedule(
    'expire-old-referrals',
    '0 0 * * *', -- Run at midnight every day
    $$
    SELECT expire_old_referrals();
    $$
); 