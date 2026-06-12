const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gtnlvisbgevmihsmrbym.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bmx2aXNiZ2V2bWloc21yYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTA4OTIsImV4cCI6MjA5MzM2Njg5Mn0.80ALFQ5aYYtRIHCe6fkCTpQ_7Ku3Cpv219kHa3_qI8A';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Express middleware: extracts userId from the request.
 * Accepts either:
 *   - Authorization: Bearer <supabase-jwt>
 *   - x-user-id: <userId>  (dev fallback)
 */
async function authMiddleware(req, res, next) {
  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        // Fall through to x-user-id check
      } else {
        req.userId = user.id;
        return next();
      }
    } catch (err) {
      // Fall through
    }
  }

  // Dev fallback: x-user-id header
  const userId = req.headers['x-user-id'];
  if (userId) {
    req.userId = userId;
    return next();
  }

  return res.status(401).json({ error: 'Authentication required' });
}

module.exports = { authMiddleware, supabase };
