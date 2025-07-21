import pool from '../database/connection.js';

export class AIChat {
  static async createSession(userId, sessionName = 'New Chat') {
    const query = `
      INSERT INTO ai_chat_sessions (user_id, session_name)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, sessionName]);
    return result.rows[0];
  }

  static async getUserSessions(userId) {
    const query = `
      SELECT s.*, 
             (SELECT content FROM ai_chat_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT COUNT(*) FROM ai_chat_messages WHERE session_id = s.id) as message_count
      FROM ai_chat_sessions s
      WHERE s.user_id = $1
      ORDER BY s.updated_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async addMessage(sessionId, role, content) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Add message
      const messageResult = await client.query(
        `INSERT INTO ai_chat_messages (session_id, role, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [sessionId, role, content]
      );
      
      // Update session timestamp
      await client.query(
        `UPDATE ai_chat_sessions 
         SET updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [sessionId]
      );
      
      await client.query('COMMIT');
      return messageResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getSessionMessages(sessionId, limit = 50, offset = 0) {
    const query = `
      SELECT * FROM ai_chat_messages
      WHERE session_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [sessionId, limit, offset]);
    return result.rows;
  }

  static async deleteSession(sessionId, userId) {
    const query = `
      DELETE FROM ai_chat_sessions
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [sessionId, userId]);
    return result.rows[0];
  }

  static async updateSessionName(sessionId, userId, sessionName) {
    const query = `
      UPDATE ai_chat_sessions
      SET session_name = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [sessionName, sessionId, userId]);
    return result.rows[0];
  }
}