import pool from '../database/connection.js';

export class Recommendations {
  // Get personalized post recommendations based on user interactions
  static async getPersonalizedPosts(userId, limit = 10) {
    const query = `
      WITH user_interests AS (
        -- Get users that the current user follows
        SELECT following_id as interest_user_id, 3 as weight
        FROM followers 
        WHERE follower_id = $1
        
        UNION ALL
        
        -- Get users whose posts the current user has liked
        SELECT p.user_id as interest_user_id, 2 as weight
        FROM likes l
        JOIN posts p ON l.post_id = p.id
        WHERE l.user_id = $1
        
        UNION ALL
        
        -- Get users whose posts the current user has commented on
        SELECT p.user_id as interest_user_id, 1 as weight
        FROM comments c
        JOIN posts p ON c.post_id = p.id
        WHERE c.user_id = $1
      ),
      weighted_interests AS (
        SELECT interest_user_id, SUM(weight) as total_weight
        FROM user_interests
        GROUP BY interest_user_id
      ),
      recommended_posts AS (
        SELECT DISTINCT p.*, u.username, u.full_name, u.profile_image, u.is_verified,
               wi.total_weight,
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
               -- Boost recent posts
               CASE 
                 WHEN p.created_at > CURRENT_TIMESTAMP - INTERVAL '1 day' THEN 2
                 WHEN p.created_at > CURRENT_TIMESTAMP - INTERVAL '3 days' THEN 1.5
                 ELSE 1
               END as recency_boost,
               -- Boost popular posts
               CASE 
                 WHEN (SELECT COUNT(*) FROM likes WHERE post_id = p.id) > 10 THEN 1.5
                 WHEN (SELECT COUNT(*) FROM likes WHERE post_id = p.id) > 5 THEN 1.2
                 ELSE 1
               END as popularity_boost
        FROM posts p
        JOIN users u ON p.user_id = u.id
        JOIN weighted_interests wi ON p.user_id = wi.interest_user_id
        WHERE p.user_id != $1 
          AND p.is_active = true
          AND p.id NOT IN (
            -- Exclude posts user has already interacted with
            SELECT post_id FROM likes WHERE user_id = $1
            UNION
            SELECT post_id FROM comments WHERE user_id = $1
          )
      )
      SELECT *,
             (total_weight * recency_boost * popularity_boost) as recommendation_score
      FROM recommended_posts
      ORDER BY recommendation_score DESC, created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  // Get trending posts based on recent engagement
  static async getTrendingPosts(limit = 10) {
    const query = `
      SELECT p.*, u.username, u.full_name, u.profile_image, u.is_verified,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
             -- Calculate trending score based on recent engagement
             (
               (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours') * 2 +
               (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours') * 3
             ) as trending_score
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_active = true
        AND p.created_at > CURRENT_TIMESTAMP - INTERVAL '7 days'
      ORDER BY trending_score DESC, p.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // Get suggested users to follow
  static async getSuggestedUsers(userId, limit = 5) {
    const query = `
      WITH user_network AS (
        -- Get users followed by people I follow (friends of friends)
        SELECT f2.following_id as suggested_user_id, COUNT(*) as mutual_connections
        FROM followers f1
        JOIN followers f2 ON f1.following_id = f2.follower_id
        WHERE f1.follower_id = $1
          AND f2.following_id != $1
          AND f2.following_id NOT IN (
            SELECT following_id FROM followers WHERE follower_id = $1
          )
        GROUP BY f2.following_id
      ),
      popular_users AS (
        -- Get users with high follower count
        SELECT u.id as suggested_user_id, 
               COUNT(f.follower_id) as follower_count,
               0 as mutual_connections
        FROM users u
        LEFT JOIN followers f ON u.id = f.following_id
        WHERE u.id != $1
          AND u.is_active = true
          AND u.id NOT IN (
            SELECT following_id FROM followers WHERE follower_id = $1
          )
        GROUP BY u.id
        HAVING COUNT(f.follower_id) > 5
      )
      SELECT u.id, u.username, u.full_name, u.profile_image, u.is_verified,
             COALESCE(un.mutual_connections, pu.mutual_connections, 0) as mutual_connections,
             COALESCE(pu.follower_count, 0) as follower_count,
             -- Calculate suggestion score
             (COALESCE(un.mutual_connections, 0) * 3 + COALESCE(pu.follower_count, 0) * 0.1) as suggestion_score
      FROM users u
      LEFT JOIN user_network un ON u.id = un.suggested_user_id
      LEFT JOIN popular_users pu ON u.id = pu.suggested_user_id
      WHERE (un.suggested_user_id IS NOT NULL OR pu.suggested_user_id IS NOT NULL)
      ORDER BY suggestion_score DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  // Log user interaction for improving recommendations
  static async logInteraction(userId, targetType, targetId, interactionType) {
    await pool.query(
      `INSERT INTO user_interactions (user_id, target_type, target_id, interaction_type, created_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id, target_type, target_id, interaction_type) 
       DO UPDATE SET created_at = CURRENT_TIMESTAMP`,
      [userId, targetType, targetId, interactionType]
    );
  }
}