# Chat System Developer Guide

## Quick Reference

### Frontend Location
- **Main Component**: `frontend/src/app/pages/Chat.tsx`
- **Styles**: Inline Tailwind CSS (dark mode aware)
- **Dependencies**: React, Supabase, Socket.io (via server.js)

### Backend Location
- **API Routes**: `backend/chatRoutes.js`
- **Database Setup**: `backend/sql/chat_tables.sql`
- **Real-time Server**: `backend/server.js` (Socket.io)
- **Auth Middleware**: `backend/authMiddleware.js`

### Database Tables
1. **connection_requests** - User connection requests
2. **conversations** - Chat conversations
3. **conversation_participants** - Users in conversations
4. **messages** - Chat messages

---

## API Endpoints

### Connection Requests
```
POST /api/requests
  Headers: { 'x-user-id': userId, 'Content-Type': 'application/json' }
  Body: { receiverId: 'uuid' }
  Returns: { request: {...}, conversation: {...} }

GET /api/requests/incoming
  Headers: { 'x-user-id': userId }
  Returns: Array<ConnectionRequest>

GET /api/requests/outgoing
  Headers: { 'x-user-id': userId }
  Returns: Array<ConnectionRequest>

PATCH /api/requests/:id
  Headers: { 'x-user-id': userId, 'Content-Type': 'application/json' }
  Body: { action: 'accept' | 'decline' }
  Returns: { request: {...}, conversation?: {...} }
```

### Conversations
```
GET /api/conversations
  Headers: { 'x-user-id': userId }
  Returns: Array<Conversation> with participants, lastMessage, unreadCount

GET /api/conversations/:id/messages
  Headers: { 'x-user-id': userId }
  Query: ?limit=50&before=timestamp (for cursor-based pagination)
  Returns: Array<Message> in chronological order

POST /api/conversations/:id/messages
  Headers: { 'x-user-id': userId, 'Content-Type': 'application/json' }
  Body: { text: string, attachmentUrl?: string }
  Returns: Message

PATCH /api/conversations/:id/read
  Headers: { 'x-user-id': userId, 'Content-Type': 'application/json' }
  Returns: { success: true }
```

---

## Socket.io Events

### Client → Server
```javascript
// Authentication
socket.emit('authenticate', userId);

// Conversation Management
socket.emit('join_conversation', conversationId);
socket.emit('leave_conversation', conversationId);

// Messaging
socket.emit('send_message', {
  conversationId: string,
  text: string,
  tempId: string  // for optimistic updates
});

// Typing Indicators
socket.emit('typing', { conversationId: string });
socket.emit('stop_typing', { conversationId: string });

// Message Status
socket.emit('message_read', { conversationId: string });
```

### Server → Client
```javascript
// Authentication Response
socket.on('online_users', (userIds: string[]) => {});

// Status Events
socket.on('user_online', ({ userId: string }) => {});
socket.on('user_offline', ({ userId: string }) => {});

// Messages
socket.on('receive_message', (message: Message) => {});
socket.on('message_error', ({ tempId: string, error: string }) => {});

// Status Indicators
socket.on('typing', ({ conversationId: string, userId: string }) => {});
socket.on('stop_typing', ({ conversationId: string, userId: string }) => {});
socket.on('message_read', ({ conversationId: string, readBy: string }) => {});

// Notifications
socket.on('request_accepted', ({ request, conversation }) => {});
```

---

## Data Types

### UserProfile
```typescript
interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'alumni' | 'faculty' | 'admin';
  avatar: string;
  email?: string;
  department?: string;
  year?: string;
  // ... other fields
}
```

### Message
```typescript
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  attachment_url?: string;
  created_at: string;
  read_at?: string;  // ISO timestamp or null
}
```

### ConnectionRequest
```typescript
interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  participants: string[];  // user IDs
  otherUserId: string;
  otherUser: UserProfile;
  lastMessage?: Message;
  unreadCount: number;
  created_at: string;
  updated_at: string;
}
```

---

## Frontend Hook Usage

### Loading Users
```typescript
const fetchAllUsers = async () => {
  const [studentRes, alumniRes, facultyRes] = await Promise.all([
    supabase.from('student_profiles').select('*'),
    supabase.from('alumni_profiles').select('*'),
    supabase.from('faculty_profiles').select('*'),
  ]);
  // Combine and filter results
};
```

### Realtime Subscriptions
```typescript
// Subscribe to new messages
const subscription = supabase
  .channel(`messages:${conversationId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`,
  }, (payload) => {
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## Common Tasks

### Task: Add a new message field
1. Add column to `messages` table in Supabase
2. Update `Message` interface in types.ts
3. Update message rendering in Chat.tsx
4. Update POST /api/conversations/:id/messages to handle new field

### Task: Add typing indicators UI
1. Add `typingUsers` state in Chat.tsx
2. Handle `socket.on('typing')` event
3. Add UI below message input showing "User is typing..."

### Task: Implement message search
1. Add search input in conversation header
2. Query messages with `.ilike('text', '%query%')`
3. Filter client-side or add API endpoint

### Task: Add message reactions
1. Create `message_reactions` table
2. Add reaction endpoints (POST, DELETE)
3. Render emoji reactions below messages

### Task: Add message editing/deletion
1. Create `is_edited` and `deleted_at` fields
2. Add PATCH/DELETE endpoints
3. Check sender_id matches current user
4. Emit socket event for realtime update

---

## Row Level Security (RLS) Policies

All tables have RLS enabled. Policies enforce:

### connection_requests
- Users can only view requests where they are sender or receiver
- Only sender can create requests
- Only receiver can update request status

### conversations
- Users can only view conversations they're a participant in

### conversation_participants
- Users can see participants if they're in the conversation
- Any authenticated user can insert (checked by conversation RLS)

### messages
- Users can only view messages in conversations they're a participant in
- Users can only send messages if they're a participant
- Users can update read_at for messages in their conversations

---

## Troubleshooting

### Problem: Messages not appearing
**Check**:
1. Is user authenticated? (x-user-id header set?)
2. Is user a participant in the conversation?
3. Are RLS policies allowing read access?
4. Is realtime subscription active?

### Problem: Connection request fails
**Check**:
1. Receiver ID is valid?
2. Request doesn't already exist?
3. User is authenticated?

### Problem: Realtime not updating
**Check**:
1. Is subscription still active? (not unsubscribed?)
2. Is channel name correct?
3. Is filter correct?
4. Are RLS policies allowing reads?
5. Check browser console for errors

### Problem: CORS errors
**Check**:
1. Backend CORS_ORIGIN environment variable includes frontend URL
2. Frontend is on allowed origin
3. Check backend server.js cors configuration

---

## Performance Considerations

### Message Pagination
- Default limit: 50 messages
- Use `?before=timestamp` for older messages
- Reduces initial load time

### User List Caching
- Consider caching all users for 5 minutes
- Re-fetch when opening People tab if cache stale
- Reduces database hits

### Realtime Subscriptions
- Subscribe only when conversation selected
- Unsubscribe when component unmounts
- Don't create multiple subscriptions for same channel

### Indexes
- Conversation messages: `idx_messages_conversation`
- Sender lookup: `idx_messages_sender`
- Timestamp sorting: `idx_messages_created_at`
- User lookups: Various indices on IDs

---

## Testing

### Manual Testing Checklist
- [ ] Send connection request
- [ ] Receive and accept request
- [ ] See conversation appear in inbox
- [ ] Send message and see on screen
- [ ] Refresh page and see message persists
- [ ] Log out and back in, conversation still there
- [ ] Real-time: second browser receives message instantly
- [ ] Unread count updates in real-time
- [ ] Search users by name
- [ ] View user profile info (role, department)

### Automated Testing
```bash
# Backend tests
npm test

# Frontend tests
npm run test:frontend

# Integration tests
npm run test:integration
```

---

## Deployment

1. Run Supabase migrations: `chat_tables.sql`
2. Set environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)
3. Deploy backend (chatRoutes.js, server.js)
4. Deploy frontend (Chat.tsx, updated components)
5. Test all flows in production
6. Monitor logs for errors

---

## Future Enhancements

Priority 1 (High Value):
- [ ] Message search with filters
- [ ] Block/Unblock users
- [ ] Conversation pinning
- [ ] Message reactions

Priority 2 (Nice to Have):
- [ ] Voice messages
- [ ] Image preview in messages
- [ ] Message forwarding
- [ ] Conversation archiving

Priority 3 (Advanced):
- [ ] Video calls (Twilio/Agora integration)
- [ ] Group chats (n-way conversations)
- [ ] Message encryption
- [ ] Conversation backups

---

## Documentation Links

- [Supabase Docs](https://supabase.com/docs)
- [Socket.io Docs](https://socket.io/docs/)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

