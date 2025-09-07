import pool from '../database/connection.js';

export class ContentModeration {
  // Simple spam detection using keyword filtering
  static async detectSpam(content) {
    const spamKeywords = [
      'buy now', 'click here', 'free money', 'get rich quick',
      'limited time', 'act now', 'guaranteed', 'no risk',
      'make money fast', 'work from home', 'earn $$$'
    ];
    
    const lowerContent = content.toLowerCase();
    const spamScore = spamKeywords.reduce((score, keyword) => {
      return score + (lowerContent.includes(keyword) ? 1 : 0);
    }, 0);
    
    return {
      isSpam: spamScore >= 2,
      confidence: Math.min(spamScore / 5, 1),
      keywords: spamKeywords.filter(keyword => lowerContent.includes(keyword))
    };
  }

  // Detect inappropriate content using basic pattern matching
  static async detectInappropriateContent(content) {
    const inappropriatePatterns = [
      /\b(hate|violence|harassment)\b/gi,
      /\b(offensive|abusive|toxic)\b/gi,
      /\b(discrimination|racism|sexism)\b/gi
    ];
    
    const matches = inappropriatePatterns.reduce((acc, pattern) => {
      const found = content.match(pattern);
      return acc.concat(found || []);
    }, []);
    
    return {
      isInappropriate: matches.length > 0,
      confidence: Math.min(matches.length / 3, 1),
      matches: matches
    };
  }

  // Moderate post content
  static async moderatePost(postId, content) {
    const spamResult = await this.detectSpam(content);
    const inappropriateResult = await this.detectInappropriateContent(content);
    
    const isBlocked = spamResult.isSpam || inappropriateResult.isInappropriate;
    const reason = [];
    
    if (spamResult.isSpam) reason.push('spam');
    if (inappropriateResult.isInappropriate) reason.push('inappropriate_content');
    
    // Log moderation result
    await pool.query(
      `INSERT INTO content_moderation_logs (post_id, is_blocked, reason, spam_score, inappropriate_score, created_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [postId, isBlocked, reason.join(','), spamResult.confidence, inappropriateResult.confidence]
    );
    
    return {
      isBlocked,
      reason: reason.join(', '),
      spamResult,
      inappropriateResult
    };
  }

  // Get moderation history
  static async getModerationHistory(limit = 50) {
    const query = `
      SELECT cml.*, p.content, u.username
      FROM content_moderation_logs cml
      JOIN posts p ON cml.post_id = p.id
      JOIN users u ON p.user_id = u.id
      ORDER BY cml.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }
}