/*
  # Add Content Moderation and Recommendations Tables

  1. Content Moderation
    - `content_moderation_logs` - Track moderation decisions
    
  2. User Interactions
    - `user_interactions` - Track user behavior for recommendations
    
  3. Indexes for Performance
    - Add indexes for better query performance
*/

-- Content moderation logs table
CREATE TABLE IF NOT EXISTS content_moderation_logs (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    is_blocked BOOLEAN DEFAULT FALSE,
    reason TEXT,
    spam_score DECIMAL(3,2) DEFAULT 0,
    inappropriate_score DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User interactions table for recommendations
CREATE TABLE IF NOT EXISTS user_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'user', 'comment')),
    target_id INTEGER NOT NULL,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'view', 'follow')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_type, target_id, interaction_type)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_post_id ON content_moderation_logs(post_id);
CREATE INDEX IF NOT EXISTS idx_content_moderation_logs_created_at ON content_moderation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_target ON user_interactions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at DESC);

-- Add trending score calculation function
CREATE OR REPLACE FUNCTION calculate_trending_score(post_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- Calculate trending score based on recent engagement
    SELECT 
        (COUNT(CASE WHEN l.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) * 2) +
        (COUNT(CASE WHEN c.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) * 3)
    INTO score
    FROM posts p
    LEFT JOIN likes l ON p.id = l.post_id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.id = post_id;
    
    RETURN COALESCE(score, 0);
END;
$$ LANGUAGE plpgsql;