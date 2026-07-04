const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith('http')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase client initialized successfully');
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error.message);
  }
} else {
  console.warn('Supabase credentials not configured. Database features will be disabled.');
  console.warn('Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file');
}

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
