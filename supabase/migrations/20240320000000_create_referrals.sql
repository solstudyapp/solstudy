-- Create referral_codes table
CREATE TABLE referral_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create referrals table (for completed referrals)
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
    referee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'expired')),
    points_earned INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_referee UNIQUE (referee_id)
);

-- Create indexes for faster lookups
CREATE INDEX referral_codes_referrer_id_idx ON referral_codes(referrer_id);
CREATE INDEX referral_codes_code_idx ON referral_codes(code);
CREATE INDEX referral_codes_is_active_idx ON referral_codes(is_active);
CREATE INDEX referrals_referral_code_id_idx ON referrals(referral_code_id);
CREATE INDEX referrals_referee_id_idx ON referrals(referee_id);
CREATE INDEX referrals_status_idx ON referrals(status);

-- Enable Row Level Security
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for referral_codes
CREATE POLICY "Users can view their own referral codes"
    ON referral_codes FOR SELECT
    USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create their own referral codes"
    ON referral_codes FOR INSERT
    WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referral codes"
    ON referral_codes FOR UPDATE
    USING (auth.uid() = referrer_id);

-- Create policies for referrals
CREATE POLICY "Users can view referrals they created"
    ON referrals FOR SELECT
    USING (auth.uid() IN (
        SELECT referrer_id FROM referral_codes WHERE id = referral_code_id
    ));

CREATE POLICY "Users can view referrals where they are the referee"
    ON referrals FOR SELECT
    USING (auth.uid() = referee_id);

CREATE POLICY "System can create referrals"
    ON referrals FOR INSERT
    WITH CHECK (true);

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
            SELECT 1 FROM referral_codes WHERE code = new_code
        ) INTO exists;
        
        -- If code doesn't exist, return it
        IF NOT exists THEN
            RETURN new_code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create function to handle referral completion
CREATE OR REPLACE FUNCTION handle_referral_creation()
RETURNS TRIGGER AS $$
BEGIN
    -- Add points to referrer's profile
    UPDATE profiles
    SET total_points = total_points + NEW.points_earned
    WHERE id = (
        SELECT referrer_id 
        FROM referral_codes 
        WHERE id = NEW.referral_code_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for referral creation
CREATE TRIGGER referral_creation_trigger
    AFTER INSERT ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION handle_referral_creation(); 