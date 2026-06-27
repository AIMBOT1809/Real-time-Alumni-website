# Instagram-Style Chat Feature Guide

## Overview
The Alumni Connect application now features a modern, Instagram-style real-time chat system that enables Alumni, Students, and Faculty to connect and communicate seamlessly.

## Features

### 1. Connection Requests
- Users can browse registered alumni/students and send connection requests
- Pending requests can be accepted or declined
- Real-time notifications using Socket.IO

### 2. Conversations & Messaging
- One-to-one messaging with connected users
- Real-time message delivery via Socket.IO
- Message read receipts (single ✓ for sent, double ✓✓ for read)
- Automatic message timestamps with relative time formatting (e.g., "5m ago")

### 3. User Interface
- **Inbox Tab**: View all active conversations
- **People Tab**: Browse available users to connect with
- **Requests Tab**: Manage pending connection requests with notification badge
- **Message Status**: Visual indicators for message delivery and read status
- Light/Dark theme support

## Architecture

### Frontend Components
- **Chat.tsx** - Main chat UI component
  - Tabs: Conversations, People, Requests
  - Message list with auto-scroll
  - Real-time Socket.IO integration
  - Search functionality for people/conversations

### Backend Routes (`backend/chatRoutes.js`)
- `POST /api/requests` - Send connection request
- `GET /api/requests/incoming` - Get pending requests
- `GET /api/requests/outgoing` - Get sent requests
- `PATCH /api/requests/:id` - Accept/decline request
- `GET /api/conversations` - List user conversations
- `GET /api/conversations/:id/messages` - Get message history (with pagination)
- `POST /api/conversations/:id/messages` - Send message
- `PATCH /api/conversations/:id/read` - Mark messages as read

### Database Tables
- `connection_requests` - Tracks connection requests between users
- `conversations` - Stores conversation metadata
- `conversation_participants` - Links users to conversations
- `messages` - Stores individual messages

### Real-Time Communication
- **Socket.IO Events**:
  - `join_user` - User joins their personal channel
  - `receive_message` - Broadcast new messages to conversation participants
  - `request_accepted` - Notify users when connection is accepted
  - `message_read` - Notify sender when message is read

## Setup Instructions

### 1. Database Setup
Execute the chat tables SQL file in Supabase:
```sql
-- Run backend/sql/chat_tables.sql in your Supabase database
```

This creates:
- connection_requests table with RLS policies
- conversations table
- conversation_participants table
- messages table with indexes for performance

### 2. Backend Configuration
The backend already has:
- Socket.IO server configured in `backend/server.js`
- Chat routes in `backend/chatRoutes.js`
- Authentication middleware for API routes

Ensure `backend/server.js` is running:
```bash
cd backend
npm install
npm start
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_SOCKET_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

### 4. Frontend Usage
The Chat component is accessible from:
- Dashboard navigation → Chat button
- Direct URL: `/dashboard/chat`
- Already integrated in MainDashboard.tsx

## User Workflows

### Sending a Connection Request
1. Navigate to Dashboard → Chat
2. Click "People" tab
3. Search or browse available users
4. Click the "+" button on a user card
5. Request is sent and user is removed from list

### Accepting/Declining Requests
1. Navigate to Dashboard → Chat
2. Click "Requests" tab
3. View pending requests with sender profile
4. Click "Accept" or "Decline"
5. Accepted requests create a conversation automatically

### Messaging
1. Click on a conversation in the "Inbox" tab
2. View message history (loads latest 50 messages)
3. Type message in the input field
4. Press Enter or click Send button
5. Messages appear in real-time for both users
6. Read receipts show when messages are seen

## Technical Details

### Message Flow
```
User A sends message
  ↓
REST API: POST /api/conversations/:id/messages
  ↓
Message saved to Supabase
  ↓
Socket.IO broadcasts to conversation participants
  ↓
User B receives via 'receive_message' event
  ↓
UI updates automatically
```

### Connection Request Flow
```
User A sends request to User B
  ↓
Request saved to connection_requests table
  ↓
User B receives notification via Socket.IO
  ↓
User B accepts/declines
  ↓
If accepted: conversation + participants created
  ↓
Both users notified via 'request_accepted' event
  ↓
Conversation appears in inbox
```

## API Request Examples

### Send Connection Request
```javascript
fetch('http://localhost:3000/api/requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userId}`,
  },
  body: JSON.stringify({ receiverId: targetUserId })
})
```

### Send Message
```javascript
fetch(`http://localhost:3000/api/conversations/${conversationId}/messages`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userId}`,
  },
  body: JSON.stringify({ text: 'Hello!' })
})
```

### Get Conversations
```javascript
fetch('http://localhost:3000/api/conversations', {
  headers: { 'Authorization': `Bearer ${userId}` }
})
```

## Customization

### Theme Support
The Chat component accepts a `theme` prop:
```typescript
<Chat theme="dark" />  // or "light"
```

### Styling
- Primary color: `#FFD700` (gold/yellow)
- Built with Tailwind CSS
- Dark mode colors: blacks, grays
- Light mode colors: whites, light grays

### Custom Colors
Modify these values in Chat.tsx:
```typescript
const bgClass = isDark ? 'bg-black' : 'bg-white';
const hoverBgClass = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';
```

## Performance Optimizations

1. **Paginated Message Loading** - Loads 50 messages at a time
2. **Indexed Database Columns** - Fast queries on conversation/user IDs
3. **Row Level Security** - Prevents unauthorized data access
4. **Socket.IO Rooms** - Efficient message broadcasting
5. **Auto-scroll** - Smooth scroll to latest messages

## Security Features

1. **Authentication Required** - All API routes require Bearer token
2. **Row Level Security (RLS)** - Supabase RLS policies enforce data access
3. **User Verification** - Users can only see their own conversations
4. **Message Encryption Ready** - Can be added for future versions

## Troubleshooting

### Messages Not Sending
- Check backend server is running: `npm start` in backend folder
- Verify Socket.IO connection in browser console
- Check user authentication token

### Connection Requests Not Appearing
- Ensure recipient ID is correct
- Check that both users exist in profiles table
- Verify RLS policies allow request creation

### Real-Time Updates Not Working
- Verify Socket.IO server is accessible at `http://localhost:3000`
- Check browser console for connection errors
- Ensure CORS is properly configured in backend

### Messages Not Marked as Read
- Verify message belongs to conversation user is in
- Check auth token includes user ID
- Ensure PATCH endpoint is being called

## Future Enhancements

- [ ] Message search functionality
- [ ] Group conversations
- [ ] Message attachments (images, files)
- [ ] Typing indicators
- [ ] Message reactions/emojis
- [ ] Voice/video calls
- [ ] Message encryption
- [ ] Message starring/bookmarking
- [ ] Conversation pinning
- [ ] User online status
- [ ] Last seen timestamps

## File Structure
```
src/app/
├── pages/
│   └── Chat.tsx                    # Main chat UI component
├── hooks/
│   └── useChat.ts                  # Socket.IO connection hook
└── context/
    └── AuthContext.tsx             # Contains user authentication

backend/
├── chatRoutes.js                   # Chat API endpoints
├── server.js                       # Socket.IO server setup
├── authMiddleware.js               # Authentication middleware
└── sql/
    └── chat_tables.sql             # Database schema
```

## Support & Debugging

Enable debug logging:
```javascript
// In Chat.tsx or useChat.ts
console.log('[Chat] Debug message');
console.error('[Chat] Error message');
```

Check Socket.IO connection:
```javascript
console.log(socketRef.current?.connected)
```

Verify API endpoints are responding:
```bash
curl http://localhost:3000/api/conversations
```

## License
This chat feature is part of the Alumni Connect project and follows the same license.
