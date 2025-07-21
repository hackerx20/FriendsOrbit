import pool from '../database/connection.js';
import bcrypt from 'bcryptjs';

export class User {
  static async create({ username, fullName, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (username, full_name, email, password_hash)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, full_name, email, profile_image, cover_image, bio, website_url, is_verified, created_at
    `;
    
    const result = await pool.query(query, [username, fullName, email, hashedPassword]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = `
      SELECT u.*, 
             (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
             (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count
      FROM users u 
      WHERE username = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT u.*, 
             (SELECT COUNT(*) FROM followers WHERE following_id = u.id) as followers_count,
             (SELECT COUNT(*) FROM followers WHERE follower_id = u.id) as following_count
      FROM users u 
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async updateProfile(userId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        const dbField = key === 'fullName' ? 'full_name' : 
                       key === 'profileImage' ? 'profile_image' :
                       key === 'coverImage' ? 'cover_image' :
                       key === 'websiteUrl' ? 'website_url' : key;
        
        fields.push(`${dbField} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, username, full_name, email, profile_image, cover_image, bio, website_url, is_verified
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getSuggestedUsers(userId, limit = 4) {
    const query = `
      SELECT u.id, u.username, u.full_name, u.profile_image, u.is_verified
      FROM users u
      WHERE u.id != $1 
        AND u.is_active = true
        AND u.id NOT IN (
          SELECT following_id FROM followers WHERE follower_id = $1
        )
      ORDER BY RANDOM()
      LIMIT $2
    `;
    
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}