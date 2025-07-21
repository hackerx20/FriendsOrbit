import pool from '../database/connection.js';

export class Post {
  static async create({ userId, content, imageUrl }) {
    const query = `
      INSERT INTO posts (user_id, content, image_url)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, content, imageUrl]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT p.*, u.username, u.full_name, u.profile_image, u.is_verified,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = $1 AND p.is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAllPosts(limit = 20, offset = 0) {
    const query = `
      SELECT p.*, u.username, u.full_name, u.profile_image, u.is_verified,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  static async getFollowingPosts(userId, limit = 20, offset = 0) {
    const query = `
      SELECT p.*, u.username, u.full_name, u.profile_image, u.is_verified,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      JOIN followers f ON p.user_id = f.following_id
      WHERE f.follower_id = $1 AND p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async getUserPosts(userId, limit = 20, offset = 0) {
    const query = `
      SELECT p.*, u.username, u.full_name, u.profile_image, u.is_verified,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1 AND p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async delete(postId, userId) {
    const query = `
      UPDATE posts 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [postId, userId]);
    return result.rows[0];
  }

  static async toggleLike(postId, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if already liked
      const existingLike = await client.query(
        'SELECT id FROM likes WHERE post_id = $1 AND user_id = $2',
        [postId, userId]
      );
      
      if (existingLike.rows.length > 0) {
        // Unlike
        await client.query(
          'DELETE FROM likes WHERE post_id = $1 AND user_id = $2',
          [postId, userId]
        );
        
        await client.query(
          'UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1',
          [postId]
        );
        
        await client.query('COMMIT');
        return { liked: false };
      } else {
        // Like
        await client.query(
          'INSERT INTO likes (post_id, user_id) VALUES ($1, $2)',
          [postId, userId]
        );
        
        await client.query(
          'UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1',
          [postId]
        );
        
        await client.query('COMMIT');
        return { liked: true };
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async addComment(postId, userId, content) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const commentResult = await client.query(
        'INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
        [postId, userId, content]
      );
      
      await client.query(
        'UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1',
        [postId]
      );
      
      await client.query('COMMIT');
      return commentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getComments(postId) {
    const query = `
      SELECT c.*, u.username, u.full_name, u.profile_image, u.is_verified
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `;
    
    const result = await pool.query(query, [postId]);
    return result.rows;
  }
}