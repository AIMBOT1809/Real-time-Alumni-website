# Chat Feature Testing Guide

## Prerequisites
- Backend running: `cd backend && npm start`
- Frontend running: `npm run dev`
- Two test user accounts created in the application
- Supabase database properly configured with chat tables

## Manual Testing Checklist

### 1. Initial Setup
- [ ] Chat component loads without errors
- [ ] Socket.IO connection established (check browser console)
- [ ] User authenticated and profile loaded
- [ ] Chat interface displays with three tabs

### 2. People Tab Testing

#### Browse People
- [ ] Navigate to Chat → People tab
- [ ] List of available users displays (excluding current user)
- [ ] User cards show: avatar, name, and role
- [ ] Search box filters users by name
- [ ] Clear search results when query is empty

#### Send Connection Request
- [ ] Click "+" button on a user card
- [ ] Request sent successfully (no error in console)
- [ ] User is removed from people list
- [ ] Multiple requests can be sent to different people
- [ ] Sending request to same person again shows error gracefully

### 3. Requests Tab Testing

#### View Pending Requests
- [ ] Switch to Requests tab
- [ ] Shows count badge with number of pending requests
- [ ] Each request displays: sender avatar, name, "wants to connect" text
- [ ] Accept and Decline buttons visible and clickable

#### Accept Request
- [ ] Click "Accept" on a request
- [ ] Request disappears from list
- [ ] Conversation appears in Inbox tab
- [ ] Conversation shows sender as the other participant
- [ ] Can immediately send messages to accepted user

#### Decline Request
- [ ] Click "Decline" on a request
- [ ] Request disappears from list
- [ ] No conversation created
- [ ] Sender can send another request if needed

### 4. Inbox Tab Testing

#### View Conversations
- [ ] Navigate to Inbox tab
- [ ] List of active conversations displays
- [ ] Each conversation shows: other user's avatar, name, last message
- [ ] Empty state displays when no conversations exist
- [ ] Conversations ordered by most recent first

#### Select Conversation
- [ ] Click on a conversation
- [ ] Chat area loads on right side
- [ ] Other user's name and status ("Active now") displays
- [ ] Message history loads (up to 50 messages)
- [ ] Previous messages visible in chronological order

### 5. Messaging Testing

#### Send Messages
- [ ] Type text in message input
- [ ] Press Enter or click Send button
- [ ] Message appears in chat immediately
- [ ] Message shows correct timestamp
- [ ] Message aligned to right with gold background
- [ ] Input field clears after sending
- [ ] Multiple messages can be sent in sequence

#### Receive Messages
- [ ] Open chat in two different browser windows/tabs
- [ ] Send message from User A
- [ ] Message appears immediately in User B's chat
- [ ] Message shows in correct position chronologically
- [ ] Message aligned to left with dark/light background

#### Message Status Indicators
- [ ] Sent messages show single checkmark (✓)
- [ ] Read messages show double checkmark (✓✓)
- [ ] Read status updates when recipient views message
- [ ] Timestamps display relative times ("5m ago", "2h ago")
- [ ] Old messages show date format ("Jan 15, 2025")

#### Empty Chat State
- [ ] Select conversation with no messages
- [ ] No error displayed
- [ ] Can type and send first message
- [ ] Conversation updates immediately

### 6. User Interface Testing

#### Responsiveness
- [ ] Chat works on desktop (1920x1080)
- [ ] Layout adapts on smaller screens
- [ ] Sidebar doesn't overflow
- [ ] Message text wraps properly
- [ ] Input area always visible and accessible

#### Theme Support
- [ ] Toggle between dark and light themes
- [ ] Colors adjust appropriately
- [ ] Text remains readable
- [ ] All elements visible in both themes
- [ ] Transitions smooth

#### Search Functionality
- [ ] Search in People tab filters correctly
- [ ] Search in Inbox filters conversations
- [ ] Case-insensitive search works
- [ ] Search clears with empty input
- [ ] No results message shows when nothing matches

### 7. Real-Time Updates Testing

#### Socket.IO Connection
- [ ] Connection established on load (console log)
- [ ] Reconnects automatically after disconnect
- [ ] User joins personal channel on connect
- [ ] No duplicate messages from multiple connections

#### Live Message Broadcasting
- [ ] Open same conversation in two windows
- [ ] Send message from one window
- [ ] Message appears instantly in other window
- [ ] Order is consistent in both windows
- [ ] Timestamps match between clients

#### Read Receipts
- [ ] Open conversation in Window A (don't read)
- [ ] Send message from Window B
- [ ] Message shows single checkmark in B
- [ ] Switch to Window A (read message)
- [ ] Message shows double checkmark in Window B
- [ ] Notification sends to other user

### 8. Edge Cases Testing

#### No Participants
- [ ] Conversation with only one participant handled gracefully
- [ ] Error messages display appropriately
- [ ] App doesn't crash

#### Large Message Content
- [ ] Send very long message (1000+ characters)
- [ ] Message wraps correctly
- [ ] Scrollbar appears if needed
- [ ] No display glitches

#### Special Characters
- [ ] Send message with emojis
- [ ] Send message with line breaks
- [ ] Send message with special characters (@, #, $, etc.)
- [ ] All render correctly

#### Network Issues
- [ ] Disconnect internet
- [ ] Reconnection dialog may appear
- [ ] Try to send message - queued or error shown
- [ ] Reconnect internet
- [ ] Message sends successfully
- [ ] Previous messages still visible

#### Session Timeout
- [ ] Session expires
- [ ] User logged out automatically
- [ ] Redirected to login page
- [ ] Conversation data cleared

### 9. Database Testing

#### Verify Data Persistence
```sql
-- Check connection requests created
SELECT * FROM connection_requests WHERE sender_id = 'user_id';

-- Check conversations created
SELECT * FROM conversations LIMIT 10;

-- Check messages stored
SELECT * FROM messages WHERE conversation_id = 'convo_id' ORDER BY created_at;

-- Check read_at field updates
SELECT * FROM messages WHERE read_at IS NOT NULL LIMIT 5;
```

#### Verify RLS Policies
- [ ] User cannot see other users' messages (test in DB directly)
- [ ] User cannot update others' messages
- [ ] User can only create requests as sender
- [ ] User cannot bypass RLS with API calls

### 10. Performance Testing

#### Message Load Time
- [ ] Loading 50 messages takes < 2 seconds
- [ ] Pagination works for older messages
- [ ] No UI freezing during load

#### Conversation List Load
- [ ] Loading 20+ conversations instant
- [ ] Scrolling smooth
- [ ] No lag when switching conversations

#### Search Performance
- [ ] Search 100+ users returns results in < 1 second
- [ ] Search doesn't block UI
- [ ] Debouncing prevents excessive queries

### 11. Cross-Browser Testing
- [ ] Chrome/Edge: ✓
- [ ] Firefox: ✓
- [ ] Safari: ✓
- [ ] Mobile browsers: ✓

### 12. Integration Testing

#### With Authentication
- [ ] Login required to access chat
- [ ] User data matches authenticated user
- [ ] Logout clears chat data
- [ ] Login as different user shows different conversations

#### With Dashboard Navigation
- [ ] Chat link in navigation works
- [ ] Returning from chat preserves state
- [ ] Chat icon shows unread count
- [ ] Navigation to other pages works

#### With User Profiles
- [ ] User avatars display from profiles table
- [ ] User names match profiles
- [ ] User roles display correctly
- [ ] Profile link integration (if implemented)

## Automated Test Examples

### Unit Tests
```typescript
// useChat.ts
describe('useChat', () => {
  it('should establish socket connection', () => {
    // Test socket initialization
  });

  it('should emit join_user event on connect', () => {
    // Test user channel join
  });
});
```

### Integration Tests
```typescript
// Chat.tsx
describe('Chat Component', () => {
  it('should load conversations on mount', async () => {
    // Test conversation loading
  });

  it('should send and receive messages', async () => {
    // Test message flow
  });
});
```

## Performance Benchmarks

### Target Metrics
- Page load time: < 2 seconds
- Message send time: < 500ms
- Message receive time: < 100ms (real-time)
- Search response: < 300ms
- UI responsiveness: 60 FPS

### Monitoring
Enable performance monitoring:
```javascript
const start = performance.now();
// operation
const duration = performance.now() - start;
console.log(`Operation took ${duration}ms`);
```

## Bug Report Template

When reporting bugs, include:
```
Title: [Brief description]

Environment:
- Browser: Chrome 120
- OS: Windows 11
- Screen size: 1920x1080

Steps to Reproduce:
1. Login as user A
2. Navigate to Chat
3. Select a conversation

Expected Behavior:
Messages should load

Actual Behavior:
Shows loading spinner indefinitely

Screenshots: [if applicable]

Console Errors:
[paste console errors]

Network Activity:
[any failed requests]
```

## Test Data Setup

### Create Test Users
```javascript
// In browser console after login
const testUsers = [
  { name: 'Alice Alumni', role: 'alumni' },
  { name: 'Bob Student', role: 'student' },
  { name: 'Carol Faculty', role: 'faculty' }
];
```

### Create Test Conversations
```sql
-- Insert test data
INSERT INTO connection_requests (sender_id, receiver_id, status)
VALUES (user_id_1, user_id_2, 'accepted');

INSERT INTO conversations DEFAULT VALUES RETURNING id;
-- Use returned id for participants
```

## Success Criteria

### Functional Requirements
- ✓ Users can send connection requests
- ✓ Users can accept/decline requests
- ✓ Users can send and receive messages
- ✓ Messages display in real-time
- ✓ Read receipts work
- ✓ Search functionality works
- ✓ UI is responsive

### Non-Functional Requirements
- ✓ Performance meets benchmarks
- ✓ No security vulnerabilities
- ✓ Data properly secured with RLS
- ✓ Error handling is graceful
- ✓ Application doesn't crash

## Notes
- Test with fresh database between major test runs
- Clear browser cache if UI looks wrong
- Check network tab for failed API calls
- Monitor database for orphaned records
