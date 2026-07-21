const express = require('express');
const { authMiddleware, supabase } = require('./authMiddleware');

const router = express.Router();

// All routes below require authentication
router.use(authMiddleware);

// ──────────────────────────────────────
// CONNECTION REQUESTS
// ──────────────────────────────────────

// POST /api/requests — Send a connection request
router.post('/requests', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ error: 'receiverId is required' });

    // Check for existing request in either direction safely without string interpolation
    const { data: existing1 } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('sender_id', req.userId)
      .eq('receiver_id', receiverId)
      .in('status', ['pending', 'accepted']);

    const { data: existing2 } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('sender_id', receiverId)
      .eq('receiver_id', req.userId)
      .in('status', ['pending', 'accepted']);

    const existing = [...(existing1 || []), ...(existing2 || [])];

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Connection request already exists', existing: existing[0] });
    }

    // For testing: Auto-accept requests and immediately create a conversation
    const { data: request, error } = await supabase
      .from('connection_requests')
      .insert({ sender_id: req.userId, receiver_id: receiverId, status: 'accepted' })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Create conversation automatically
    const { data: convo, error: convoErr } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convoErr) return res.status(500).json({ error: convoErr.message });

    // Add both participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: convo.id, user_id: req.userId },
      { conversation_id: convo.id, user_id: receiverId },
    ]);

    // Emit socket event if io is available
    if (req.app.get('io')) {
      req.app.get('io').to(`user:${receiverId}`).emit('request_accepted', {
        request: request,
        conversation: convo,
      });
      req.app.get('io').to(`user:${req.userId}`).emit('request_accepted', {
        request: request,
        conversation: convo,
      });
    }

    return res.status(201).json({ request, conversation: convo });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/incoming — Pending requests for logged-in user
router.get('/requests/incoming', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('receiver_id', req.userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/outgoing — Sent requests for logged-in user
router.get('/requests/outgoing', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    const { data, error } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('sender_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id — Accept or decline
router.patch('/requests/:id', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    const { action } = req.body; // 'accept' or 'decline'
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({ error: 'action must be "accept" or "decline"' });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'declined';

    // Verify the request belongs to this user
    const { data: request, error: fetchErr } = await supabase
      .from('connection_requests')
      .select('*')
      .eq('id', req.params.id)
      .eq('receiver_id', req.userId)
      .single();

    if (fetchErr || !request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update status
    const { data: updated, error: updateErr } = await supabase
      .from('connection_requests')
      .update({ status: newStatus })
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateErr) return res.status(500).json({ error: updateErr.message });

    // If accepted, create a conversation
    if (action === 'accept') {
      // Create conversation
      const { data: convo, error: convoErr } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convoErr) return res.status(500).json({ error: convoErr.message });

      // Add both participants
      await supabase.from('conversation_participants').insert([
        { conversation_id: convo.id, user_id: request.sender_id },
        { conversation_id: convo.id, user_id: request.receiver_id },
      ]);

      // Notify the original sender that request was accepted
      if (req.app.get('io')) {
        req.app.get('io').to(`user:${request.sender_id}`).emit('request_accepted', {
          request: updated,
          conversation: convo,
        });
        req.app.get('io').to(`user:${req.userId}`).emit('request_accepted', {
          request: updated,
          conversation: convo,
        });
      }

      return res.json({ request: updated, conversation: convo });
    }

    return res.json({ request: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ──────────────────────────────────────
// CONVERSATIONS
// ──────────────────────────────────────

// GET /api/conversations — List all conversations for logged-in user
router.get('/conversations', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    // Get conversation IDs for this user
    const { data: participations, error: partErr } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', req.userId);

    if (partErr) return res.status(500).json({ error: partErr.message });
    if (!participations || participations.length === 0) return res.json([]);

    const convoIds = participations.map(p => p.conversation_id);

    // Get conversations with participants
    const { data: convos, error: convoErr } = await supabase
      .from('conversations')
      .select('*')
      .in('id', convoIds)
      .order('created_at', { ascending: false });

    if (convoErr) return res.status(500).json({ error: convoErr.message });

    // For each conversation, get participants and last message
    const result = await Promise.all((convos || []).map(async (convo) => {
      const { data: parts } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', convo.id);

      const { data: lastMsgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convo.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Count unread messages (not sent by me, not read yet)
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', convo.id)
        .neq('sender_id', req.userId)
        .is('read_at', null);

      return {
        ...convo,
        participants: (parts || []).map(p => p.user_id),
        lastMessage: lastMsgs && lastMsgs[0] ? lastMsgs[0] : null,
        unreadCount: unreadCount || 0,
      };
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations — Create a new conversation with another user
router.post('/conversations', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    
    const { otherUserId } = req.body;
    const currentUserId = req.userId;
    
    console.log('[POST /conversations] Current User ID:', currentUserId);
    console.log('[POST /conversations] Other User ID (otherUserId):', otherUserId);
    
    if (!otherUserId) {
      console.error('[POST /conversations] Missing otherUserId in request body');
      return res.status(400).json({ error: 'otherUserId is required' });
    }
    if (otherUserId === currentUserId) {
      console.error('[POST /conversations] User trying to message self:', currentUserId);
      return res.status(400).json({ error: 'Cannot create conversation with yourself' });
    }

    // Check if conversation already exists
    console.log('[POST /conversations] Checking for existing conversations for user:', currentUserId);
    const { data: existingConvo, error: existingErr } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (existingErr) {
      console.error('[POST /conversations] Error fetching existing conversations:', existingErr);
    } else {
      console.log('[POST /conversations] Found existing conversations:', existingConvo?.length || 0);
    }

    if (!existingErr && existingConvo && existingConvo.length > 0) {
      const convoIds = existingConvo.map(p => p.conversation_id);
      console.log('[POST /conversations] Checking if other user is in any of these conversations:', convoIds);
      
      // Check if other user is in any of these conversations
      const { data: sharedConvo, error: sharedErr } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', otherUserId)
        .in('conversation_id', convoIds)
        .limit(1);

      if (sharedErr) {
        console.error('[POST /conversations] Error checking shared conversations:', sharedErr);
      } else {
        console.log('[POST /conversations] Found shared conversations:', sharedConvo?.length || 0);
      }

      if (sharedConvo && sharedConvo.length > 0) {
        // Conversation already exists
        const convoId = sharedConvo[0].conversation_id;
        console.log('[POST /conversations] Conversation already exists with ID:', convoId);
        
        const { data: convo, error: convoErr } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', convoId)
          .single();

        if (convoErr) {
          console.error('[POST /conversations] Error fetching existing conversation:', convoErr);
          return res.status(500).json({ error: convoErr.message });
        }
        
        console.log('[POST /conversations] Returning existing conversation:', convo);
        return res.status(200).json(convo);
      }
    }

    // Create new conversation
    console.log('[POST /conversations] Creating new conversation');
    const { data: convo, error: convoErr } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convoErr) {
      console.error('[POST /conversations] Error inserting conversation:', convoErr);
      console.error('[POST /conversations] Error details:', {
        code: convoErr.code,
        message: convoErr.message,
        details: convoErr.details,
      });
      return res.status(500).json({ error: convoErr.message });
    }

    console.log('[POST /conversations] New conversation created with ID:', convo.id);

    // Add both participants
    console.log('[POST /conversations] Adding participants - User 1:', currentUserId, 'User 2:', otherUserId);
    const { data: partData, error: partErr } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: convo.id, user_id: currentUserId },
        { conversation_id: convo.id, user_id: otherUserId },
      ])
      .select();

    if (partErr) {
      console.error('[POST /conversations] Error inserting participants:', partErr);
      console.error('[POST /conversations] Error details:', {
        code: partErr.code,
        message: partErr.message,
        details: partErr.details,
      });
      return res.status(500).json({ error: partErr.message });
    }

    console.log('[POST /conversations] Participants added successfully:', partData);

    // Emit socket event if io is available
    if (req.app.get('io')) {
      console.log('[POST /conversations] Emitting socket events');
      req.app.get('io').to(`user:${otherUserId}`).emit('conversation_started', {
        conversation: convo,
        startedBy: currentUserId,
      });
      req.app.get('io').to(`user:${currentUserId}`).emit('conversation_started', {
        conversation: convo,
        startedWith: otherUserId,
      });
    } else {
      console.warn('[POST /conversations] Socket.io not available for events');
    }

    console.log('[POST /conversations] Returning created conversation:', convo);
    return res.status(201).json(convo);
  } catch (err) {
    console.error('[POST /conversations] Uncaught exception:', err);
    console.error('[POST /conversations] Exception message:', err.message);
    console.error('[POST /conversations] Exception stack:', err.stack);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/conversations/:id/messages — Paginated message history
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    const limit = parseInt(req.query.limit) || 50;
    const before = req.query.before; // ISO timestamp for cursor-based pagination

    let query = supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Return in chronological order
    return res.json((data || []).reverse());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations/:id/messages — Send message (REST fallback)
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    const { text, attachmentUrl } = req.body;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: req.params.id,
        sender_id: req.userId,
        text: text || '',
        attachment_url: attachmentUrl || null,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Broadcast via socket
    if (req.app.get('io')) {
      req.app.get('io').to(`convo:${req.params.id}`).emit('receive_message', data);
    }

    return res.status(201).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/conversations/:id/read — Mark messages as read
router.patch('/conversations/:id/read', async (req, res) => {
  try {
    if (!supabase) return res.status(503).json({ error: "Database not configured" });
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', req.params.id)
      .neq('sender_id', req.userId)
      .is('read_at', null);

    if (error) return res.status(500).json({ error: error.message });

    // Notify the other user
    if (req.app.get('io')) {
      req.app.get('io').to(`convo:${req.params.id}`).emit('message_read', {
        conversationId: req.params.id,
        readBy: req.userId,
      });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
