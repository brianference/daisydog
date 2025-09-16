-- DaisyDog Database Schema
-- This file contains the complete database schema for the DaisyDog application
-- Run this in your Supabase SQL editor to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255),
    age_group VARCHAR(20) CHECK (age_group IN ('5-7', '8-10', '11-12')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'chat' CHECK (message_type IN ('chat', 'feeding', 'trick', 'game', 'joke', 'greeting')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    context JSONB DEFAULT '{}',
    sentiment VARCHAR(20) DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative'))
);

-- Game sessions table
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    score INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    game_data JSONB DEFAULT '{}',
    duration_seconds INTEGER
);

-- User statistics table
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    total_conversations INTEGER DEFAULT 0,
    treats_given INTEGER DEFAULT 0,
    tricks_performed INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    jokes_heard INTEGER DEFAULT 0,
    last_feeding TIMESTAMP WITH TIME ZONE,
    achievements JSONB DEFAULT '[]',
    favorite_activities JSONB DEFAULT '{}',
    session_count INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0 -- in seconds
);

-- Daisy's state table (global state for Daisy)
CREATE TABLE daisy_state (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    hunger_level INTEGER DEFAULT 3 CHECK (hunger_level >= 0 AND hunger_level <= 5),
    mood VARCHAR(20) DEFAULT 'happy' CHECK (mood IN ('happy', 'excited', 'hungry', 'sleepy', 'playful')),
    energy_level INTEGER DEFAULT 5 CHECK (energy_level >= 0 AND energy_level <= 5),
    last_fed TIMESTAMP WITH TIME ZONE,
    last_played TIMESTAMP WITH TIME ZONE,
    personality_traits JSONB DEFAULT '{"playfulness": 8, "friendliness": 10, "mischief": 6, "food_motivation": 9}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jokes table (pre-populated with dog jokes)
CREATE TABLE jokes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    joke_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    difficulty_level VARCHAR(20) DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    age_appropriate BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0
);

-- Tricks table (available tricks Daisy can perform)
CREATE TABLE tricks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trick_name VARCHAR(100) NOT NULL,
    trick_description TEXT,
    animation_data JSONB DEFAULT '{}',
    difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    energy_cost INTEGER DEFAULT 1 CHECK (energy_cost >= 1 AND energy_cost <= 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table (available games)
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_name VARCHAR(100) NOT NULL,
    game_description TEXT,
    game_rules JSONB DEFAULT '{}',
    min_age INTEGER DEFAULT 5,
    max_age INTEGER DEFAULT 12,
    estimated_duration INTEGER DEFAULT 300, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- Feedback table (for collecting user feedback)
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feedback_type VARCHAR(50) DEFAULT 'general',
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE
);

-- Create indexes for better performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_message_type ON conversations(message_type);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_type ON game_sessions(game_type);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_daisy_state_user_id ON daisy_state(user_id);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE daisy_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for conversations table
CREATE POLICY "Users can view own conversations" ON conversations
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for game_sessions table
CREATE POLICY "Users can view own game sessions" ON game_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own game sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own game sessions" ON game_sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for user_stats table
CREATE POLICY "Users can view own stats" ON user_stats
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own stats" ON user_stats
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- RLS Policies for daisy_state table
CREATE POLICY "Users can view own Daisy state" ON daisy_state
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own Daisy state" ON daisy_state
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Public read access for jokes, tricks, and games
CREATE POLICY "Anyone can read jokes" ON jokes FOR SELECT USING (true);
CREATE POLICY "Anyone can read tricks" ON tricks FOR SELECT USING (true);
CREATE POLICY "Anyone can read games" ON games FOR SELECT USING (true);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users SET last_active = NOW() WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user last_active when they send a message
CREATE TRIGGER trigger_update_user_last_active
    AFTER INSERT ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user stats
    INSERT INTO user_stats (user_id, total_conversations)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_conversations = user_stats.total_conversations + 1,
        treats_given = CASE 
            WHEN NEW.message_type = 'feeding' THEN user_stats.treats_given + 1
            ELSE user_stats.treats_given
        END,
        tricks_performed = CASE 
            WHEN NEW.message_type = 'trick' THEN user_stats.tricks_performed + 1
            ELSE user_stats.tricks_performed
        END,
        jokes_heard = CASE 
            WHEN NEW.message_type = 'joke' THEN user_stats.jokes_heard + 1
            ELSE user_stats.jokes_heard
        END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user stats
CREATE TRIGGER trigger_update_user_stats
    AFTER INSERT ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_user_stats();

-- Function to update game stats
CREATE OR REPLACE FUNCTION update_game_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user stats for games played
    INSERT INTO user_stats (user_id, games_played)
    VALUES (NEW.user_id, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET games_played = user_stats.games_played + 1;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update game stats
CREATE TRIGGER trigger_update_game_stats
    AFTER INSERT ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_game_stats();

-- Insert initial data

-- Insert some dog jokes
INSERT INTO jokes (joke_text, category) VALUES
('Why don''t dogs make good DJs? Because they have such ruff beats!', 'puns'),
('What do you call a sleeping bull dog? A bull-dozer!', 'puns'),
('Why did the dog go to the bank? To make a de-paws-it!', 'puns'),
('What happens when it rains cats and dogs? You might step in a poodle!', 'puns'),
('Why do dogs run in circles? Because they''re round hounds!', 'puns'),
('What did the dog say when it sat on sandpaper? "Ruff!"', 'puns'),
('Why don''t dogs make good comedians? Their jokes are too ruff!', 'puns'),
('What do you call a dog magician? A labra-cadabra-dor!', 'puns'),
('Why did the dog wear white socks? Because it couldn''t find any that matched its fur!', 'silly'),
('What''s a dog''s favorite type of pizza? Pupperoni!', 'food');

-- Insert available tricks
INSERT INTO tricks (trick_name, trick_description, difficulty, energy_cost) VALUES
('Sit', 'Daisy sits down like a good girl', 1, 1),
('Stay', 'Daisy stays in place patiently', 2, 1),
('Roll Over', 'Daisy rolls over showing her belly', 3, 2),
('Play Dead', 'Daisy lies down and plays dead (but peeks with one eye)', 3, 2),
('Spin', 'Daisy spins in a happy circle', 2, 2),
('High Five', 'Daisy gives you a high five with her paw', 2, 1),
('Bow', 'Daisy does a playful bow', 2, 1),
('Dance', 'Daisy does a little dance on her hind legs', 4, 3);

-- Insert available games
INSERT INTO games (game_name, game_description, game_rules, estimated_duration) VALUES
('Fetch', 'Play fetch with Daisy using a virtual ball', '{"objective": "Throw the ball and Daisy will bring it back", "scoring": "Points for successful catches"}', 180),
('Hide and Seek', 'Hide from Daisy and let her find you', '{"objective": "Hide in different locations", "scoring": "Points for how long you stay hidden"}', 300),
('Guessing Game', 'Daisy thinks of something and you try to guess what it is', '{"objective": "Guess what Daisy is thinking about", "scoring": "Points for correct guesses"}', 240),
('Memory Game', 'Remember the sequence of Daisy''s actions', '{"objective": "Repeat the sequence Daisy shows you", "scoring": "Points for correct sequences"}', 200),
('Tug of War', 'Play tug of war with Daisy using a virtual rope', '{"objective": "Pull the rope back and forth", "scoring": "Points for successful tugs"}', 150);

-- Create a view for user dashboard data
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.username,
    u.created_at,
    u.last_active,
    us.total_conversations,
    us.treats_given,
    us.tricks_performed,
    us.games_played,
    us.jokes_heard,
    ds.hunger_level,
    ds.mood,
    ds.energy_level,
    ds.last_fed
FROM users u
LEFT JOIN user_stats us ON u.id = us.user_id
LEFT JOIN daisy_state ds ON u.id = ds.user_id;

-- Create a function to initialize user data
CREATE OR REPLACE FUNCTION initialize_user_data(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
    -- Insert initial user stats
    INSERT INTO user_stats (user_id) VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert initial Daisy state
    INSERT INTO daisy_state (user_id) VALUES (user_uuid)
    ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user account information and preferences';
COMMENT ON TABLE conversations IS 'Stores all chat messages between users and Daisy';
COMMENT ON TABLE game_sessions IS 'Tracks individual game sessions and scores';
COMMENT ON TABLE user_stats IS 'Aggregated statistics for each user';
COMMENT ON TABLE daisy_state IS 'Current state of Daisy for each user (hunger, mood, etc.)';
COMMENT ON TABLE jokes IS 'Collection of dog jokes that Daisy can tell';
COMMENT ON TABLE tricks IS 'Available tricks that Daisy can perform';
COMMENT ON TABLE games IS 'Available games that users can play with Daisy';
COMMENT ON TABLE user_achievements IS 'Achievements earned by users';
COMMENT ON TABLE feedback IS 'User feedback and ratings';

-- Grant necessary permissions (adjust based on your Supabase setup)
-- These would typically be handled by Supabase's authentication system
