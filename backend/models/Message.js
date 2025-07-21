import pool from '../database/connection.js';

export class Message {
  static async create({ senderId, receiverId, content, messageType = 'text' }) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create message
      const messageResult = await client.query(
        `INSERT INTO messages (sender_id, receiver_id, content, message_type)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [senderId, receiverId, content, messageType]
      );
      
      const message = messageResult.rows[0];
      
      // Create or update conversation
      const conversationResult = await client.query(
        `INSERT INTO conversations (user1_id, user2_id, last_message_id, updated_at)
         VALUES (LEAST($1, $2), GREATEST($1, $2), $3, CURRENT_TIMESTAMP)
         ON CONFLICT (user1_id, user2_id)
         DO UPDATE SET last_message_id = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [senderId, receiverId, message.id]
      );
      
      await client.query('COMMIT');
      return message;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getConversation(user1Id, user2Id, limit = 50, offset = 0) {
    const query = `
      SELECT m.*, 
             s.username as sender_username, s.full_name as sender_name, s.profile_image as sender_image,
             r.username as receiver_username, r.full_name as receiver_name, r.profile_image as receiver_image
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.receiver_id = r.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at DESC
      LIMIT $3 OFFSET $4
    `;
    
    const result = await pool.query(query, [user1Id, user2Id, limit, offset]);
    return result.rows.reverse(); // Return in chronological order
  }

  static async getUserConversations(userId) {
    const query = `
      SELECT c.*, 
             u1.id as user1_id, u1.username as user1_username, u1.full_name as user1_name, u1.profile_image as user1_image,
             u2.id as user2_id, u2.username as user2_username, u2.full_name as user2_name, u2.profile_image as user2_image,
             m.content as last_message, m.created_at as last_message_time,
             (SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND sender_id = CASE WHEN c.user1_id = $1 THEN c.user2_id ELSE c.user1_id END AND is_read = false) as unread_count
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN messages m ON c.last_message_id = m.id
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.updated_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows.map(row => ({
      ...row,
      other_user: row.user1_id === userId ? {
        id: row.user2_id,
        username: row.user2_username,
        full_name: row.user2_name,
        profile_image: row.user2_image
      } : {
        id: row.user1_id,
        username: row.user1_username,
        full_name: row.user1_name,
        profile_image: row.user1_image
      }
    }));
  }

  static async markAsRead(senderId, receiverId) {
    const query = `
      UPDATE messages 
      SET is_read = true 
      WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false
    `;
    
    await pool.query(query, [senderId, receiverId]);
  }
}