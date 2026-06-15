import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Edit, Phone, Video, Info, Smile, Image, Send, MessageCircle,
  Heart, ChevronLeft, X, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '../services/socketClient';
import {
  getConversations, getMessages, markConversationRead,
  getIncomingRequests, getOutgoingRequests, sendConnectionRequest, respondToRequest
} from '../services/chatApi';

interface Message {
  id: string;
  sender_id: string;
  text: string;
  attachment_url?: string;
  created_at: string;
  read_at?: string;
  tempId?: string;
  conversation_id?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message | null;
  unreadCount: number;
}

interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
}

function Avatar({ src, name, size = 36, online = false }: { src?: string; name?: string; size?: number; online?: boolean }) {
  const initials = (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #FFD700, #f59e0b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: size * 0.35, fontWeight: 700, color: '#111827'
        }}>
          {initials}
        </div>
      )}
      {online && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.27, height: size * 0.27,
          background: '#22c55e', border: `2px solid #000`, borderRadius: '50%'
        }} />
      )}
    </div>
  );
}

export function Chat() {
  const { user, getAlumniById, alumni } = useAuth();

  const [activeTab, setActiveTab] = useState<'messages' | 'people'>('messages');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionRequest[]>([]);
  const [showMobilePeople, setShowMobilePeople] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Setup Socket & Initial Data
  useEffect(() => {
    if (!user) return;
    const socket = connectSocket(user.id);

    const loadData = async () => {
      try {
        const [convos, reqs, outReqs] = await Promise.all([
          getConversations(user.id),
          getIncomingRequests(user.id),
          getOutgoingRequests(user.id),
        ]);
        const safeConvos = Array.isArray(convos) ? convos : [];
        setConversations(safeConvos);
        setRequests(Array.isArray(reqs) ? reqs : []);
        setOutgoingRequests(Array.isArray(outReqs) ? outReqs : []);
        if (safeConvos.length > 0 && !activeConvoId) {
          setActiveConvoId(safeConvos[0].id);
        }
      } catch (err) {
        console.error('Failed to load chat data:', err);
      }
    };
    loadData();

    socket.on('online_users', (users: string[]) => setOnlineUsers(new Set(users)));
    socket.on('user_online', ({ userId }: { userId: string }) => setOnlineUsers(prev => new Set(prev).add(userId)));
    socket.on('user_offline', ({ userId }: { userId: string }) => {
      setOnlineUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
    });
    socket.on('connection_request_received', (req: ConnectionRequest) => {
      setRequests(prev => [req, ...prev]);
    });
    socket.on('request_accepted', ({ conversation }: { conversation: Conversation }) => {
      setConversations(prev => {
        if (prev.find(c => c.id === conversation.id)) return prev;
        return [{ ...conversation, lastMessage: null, unreadCount: 0 }, ...prev];
      });
    });
    socket.on('receive_message', (msg: Message & { conversation_id: string }) => {
      setMessages(prev => {
        if (msg.conversation_id !== activeConvoId) return prev;
        if (msg.sender_id === user.id && msg.tempId) {
          return prev.map(m => m.tempId === msg.tempId ? msg : m);
        }
        return [...prev, msg];
      });
      if (msg.sender_id !== user.id && msg.conversation_id === activeConvoId) {
        socket.emit('message_read', { conversationId: msg.conversation_id });
        markConversationRead(user.id, msg.conversation_id);
      }
      setConversations(prev => prev.map(c => {
        if (c.id === msg.conversation_id) {
          return {
            ...c, lastMessage: msg,
            unreadCount: (msg.conversation_id !== activeConvoId && msg.sender_id !== user.id) ? c.unreadCount + 1 : 0
          };
        }
        return c;
      }));
    });
    socket.on('typing', ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (conversationId === activeConvoId && userId !== user.id) {
        setTypingUsers(prev => new Set(prev).add(userId));
      }
    });
    socket.on('stop_typing', ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (conversationId === activeConvoId) {
        setTypingUsers(prev => { const n = new Set(prev); n.delete(userId); return n; });
      }
    });
    socket.on('message_read', ({ conversationId }: { conversationId: string }) => {
      if (conversationId === activeConvoId) {
        setMessages(prev => prev.map(m => (!m.read_at ? { ...m, read_at: new Date().toISOString() } : m)));
      }
    });

    return () => { disconnectSocket(); };
  }, [user]);

  // 2. Load Messages when Active Conversation Changes
  useEffect(() => {
    if (!user || !activeConvoId) return;
    const socket = getSocket();
    socket.emit('join_conversation', activeConvoId);
    const load = async () => {
      try {
        const msgs = await getMessages(user.id, activeConvoId);
        setMessages(Array.isArray(msgs) ? msgs : []);
        socket.emit('message_read', { conversationId: activeConvoId });
        await markConversationRead(user.id, activeConvoId);
        setConversations(prev => prev.map(c => c.id === activeConvoId ? { ...c, unreadCount: 0 } : c));
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    };
    load();
    return () => { socket.emit('leave_conversation', activeConvoId); setTypingUsers(new Set()); };
  }, [activeConvoId, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = () => {
    if (!input.trim() || !user || !activeConvoId) return;
    const socket = getSocket();
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId, sender_id: user.id, text: input.trim(),
      created_at: new Date().toISOString(), tempId,
    };
    setMessages(prev => [...prev, newMsg]);
    setConversations(prev => prev.map(c => c.id === activeConvoId ? { ...c, lastMessage: newMsg } : c));
    socket.emit('send_message', { conversationId: activeConvoId, text: input.trim(), tempId });
    socket.emit('stop_typing', { conversationId: activeConvoId });
    setInput('');
    inputRef.current?.focus();
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!user || !activeConvoId) return;
    const socket = getSocket();
    socket.emit('typing', { conversationId: activeConvoId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { conversationId: activeConvoId });
    }, 2000);
  };

  const handleStartChat = async (targetId: string) => {
    if (!user || isSendingRequest) return;
    const existingConvo = conversations.find(c => c.participants.includes(targetId));
    if (existingConvo) {
      setActiveConvoId(existingConvo.id);
      setActiveTab('messages');
      setShowMobilePeople(false);
      return;
    }
    setIsSendingRequest(true);
    try {
      const result: any = await sendConnectionRequest(user.id, targetId);
      if (result && result.conversation) {
        const newConvo: Conversation = { ...result.conversation, participants: [user.id, targetId], lastMessage: null, unreadCount: 0 };
        setConversations(prev => [newConvo, ...prev]);
        setActiveConvoId(result.conversation.id);
        setActiveTab('messages');
        setShowMobilePeople(false);
      }
    } catch (err) {
      console.error('Failed to start chat:', err);
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleRequestResponse = async (reqId: string, action: 'accept' | 'decline') => {
    if (!user) return;
    try {
      const result: any = await respondToRequest(user.id, reqId, action);
      setRequests(prev => prev.filter(r => r.id !== reqId));
      if (action === 'accept' && result?.conversation) {
        const convo: Conversation = { ...result.conversation, participants: result.conversation.participants || [], lastMessage: null, unreadCount: 0 };
        setConversations(prev => [convo, ...prev]);
        setActiveConvoId(result.conversation.id);
      }
    } catch (err) {
      console.error('Failed to respond to request:', err);
    }
  };

  if (!user) return null;

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const filteredPeople = alumni
    .filter(u => u.id !== user.id)
    .filter(u => searchQuery ? u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.department || '').toLowerCase().includes(searchQuery.toLowerCase()) : true);

  const activeConvo = conversations.find(c => c.id === activeConvoId);
  const otherUserId = activeConvo?.participants.find(p => p !== user.id);
  const otherUser = otherUserId ? getAlumniById(otherUserId) : null;
  const isTyping = otherUserId ? typingUsers.has(otherUserId) : false;

  return (
    <>
      <style>{`
        :root {
          --ig-bg: #000;
          --ig-sidebar-bg: #000;
          --ig-border: #262626;
          --ig-text: #f5f5f5;
          --ig-muted: #737373;
          --ig-accent: #1a1a1a;
          --ig-hover: #161616;
          --ig-active: #1c1c1c;
          --ig-bubble-me: #0095f6;
          --ig-bubble-them: #262626;
          --ig-gold: #FFD700;
          --ig-online: #22c55e;
        }
        .ig-root { display:flex; height:calc(100vh - 64px); background:var(--ig-bg); color:var(--ig-text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow:hidden; }
        
        /* Sidebar */
        .ig-sidebar { width:360px; flex-shrink:0; display:flex; flex-direction:column; border-right:1px solid var(--ig-border); height:100%; background:var(--ig-sidebar-bg); }
        .ig-sidebar-header { padding:16px 20px 12px; display:flex; align-items:center; justify-content:space-between; }
        .ig-sidebar-title { font-size:16px; font-weight:700; color:var(--ig-text); display:flex; align-items:center; gap:8px; }
        .ig-tab-bar { display:flex; border-bottom:1px solid var(--ig-border); }
        .ig-tab { flex:1; padding:14px 0; background:none; border:none; border-bottom:2px solid transparent; color:var(--ig-muted); font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .ig-tab.active { color:var(--ig-text); border-bottom-color:var(--ig-text); }
        .ig-search-wrap { padding:8px 16px; }
        .ig-search-box { display:flex; align-items:center; gap:8px; background:#1a1a1a; border-radius:10px; padding:8px 12px; }
        .ig-search-input { flex:1; background:none; border:none; outline:none; color:var(--ig-text); font-size:14px; }
        .ig-search-input::placeholder { color:var(--ig-muted); }
        
        /* Conversation list */
        .ig-list { flex:1; overflow-y:auto; }
        .ig-list::-webkit-scrollbar { width:0; }
        .ig-convo-row { width:100%; display:flex; align-items:center; gap:12px; padding:10px 16px; background:transparent; border:none; cursor:pointer; text-align:left; transition:background 0.15s; }
        .ig-convo-row:hover { background:var(--ig-hover); }
        .ig-convo-row.active { background:var(--ig-active); }
        .ig-convo-info { flex:1; min-width:0; }
        .ig-convo-name { font-size:14px; color:var(--ig-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ig-convo-name.bold { font-weight:700; }
        .ig-convo-sub { font-size:13px; color:var(--ig-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
        .ig-convo-sub.bold { color:#f5f5f5; font-weight:500; }
        .ig-convo-time { font-size:12px; color:var(--ig-muted); flex-shrink:0; }
        .ig-unread-dot { width:8px; height:8px; border-radius:50%; background:#0095f6; flex-shrink:0; }
        
        /* People section */
        .ig-section-header { padding:10px 16px 6px; font-size:12px; font-weight:700; color:var(--ig-muted); text-transform:uppercase; letter-spacing:0.08em; }
        .ig-people-row { width:100%; display:flex; align-items:center; gap:12px; padding:10px 16px; background:transparent; border:none; cursor:pointer; text-align:left; transition:background 0.15s; }
        .ig-people-row:hover { background:var(--ig-hover); }
        .ig-person-name { font-size:14px; color:var(--ig-text); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ig-person-sub { font-size:12px; color:var(--ig-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
        .ig-chat-btn { padding:5px 14px; background:#0095f6; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; flex-shrink:0; transition:background 0.2s; }
        .ig-chat-btn:hover { background:#1aa0f8; }
        .ig-chat-btn.connected { background:transparent; color:#0095f6; border:1px solid #0095f6; }
        
        /* Chat Pane */
        .ig-chat-pane { flex:1; display:flex; flex-direction:column; height:100%; min-width:0; background:var(--ig-bg); }
        .ig-chat-header { height:60px; padding:0 16px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--ig-border); flex-shrink:0; }
        .ig-chat-header-left { display:flex; align-items:center; gap:12px; }
        .ig-chat-header-name { font-size:15px; font-weight:700; color:var(--ig-text); }
        .ig-chat-header-status { font-size:12px; color:var(--ig-muted); margin-top:1px; }
        .ig-chat-actions { display:flex; gap:4px; }
        .ig-icon-btn { background:none; border:none; cursor:pointer; color:var(--ig-text); display:flex; align-items:center; justify-content:center; padding:8px; border-radius:50%; transition:background 0.15s; }
        .ig-icon-btn:hover { background:var(--ig-hover); }
        
        /* Messages */
        .ig-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:4px; }
        .ig-messages::-webkit-scrollbar { width:4px; }
        .ig-messages::-webkit-scrollbar-thumb { background:#333; border-radius:4px; }
        .ig-msg-row { display:flex; align-items:flex-end; gap:8px; }
        .ig-msg-me { justify-content:flex-end; }
        .ig-msg-them { justify-content:flex-start; }
        .ig-bubble { padding:10px 14px; font-size:14px; line-height:1.5; word-wrap:break-word; max-width:320px; }
        .ig-bubble-me { background:var(--ig-bubble-me); color:#fff; border-radius:22px 22px 4px 22px; }
        .ig-bubble-them { background:var(--ig-bubble-them); color:var(--ig-text); border-radius:22px 22px 22px 4px; }
        .ig-msg-time { font-size:11px; color:var(--ig-muted); margin-top:2px; }
        .ig-time-right { text-align:right; }
        .ig-time-left { text-align:left; }
        .ig-read-tick { font-size:11px; color:var(--ig-muted); text-align:right; margin-top:1px; }
        
        /* Typing indicator */
        .ig-typing-dots { display:flex; gap:4px; align-items:center; padding:2px 4px; }
        .ig-dot { width:7px; height:7px; border-radius:50%; background:var(--ig-muted); animation:igDot 1.2s infinite; }
        .ig-dot:nth-child(2) { animation-delay:0.2s; }
        .ig-dot:nth-child(3) { animation-delay:0.4s; }
        @keyframes igDot { 0%,60%,100% { transform:translateY(0); opacity:0.4; } 30% { transform:translateY(-4px); opacity:1; } }
        
        /* Input */
        .ig-input-area { padding:12px 16px; border-top:1px solid var(--ig-border); flex-shrink:0; }
        .ig-input-box { display:flex; align-items:center; gap:10px; background:#1a1a1a; border-radius:24px; padding:8px 8px 8px 16px; border:1px solid var(--ig-border); transition:border-color 0.2s; }
        .ig-input-box:focus-within { border-color:#555; }
        .ig-msg-input { flex:1; background:none; border:none; outline:none; color:var(--ig-text); font-size:15px; }
        .ig-msg-input::placeholder { color:var(--ig-muted); }
        .ig-send-btn { background:none; border:none; cursor:pointer; color:#0095f6; font-size:14px; font-weight:700; padding:0 8px; }
        
        /* Empty state */
        .ig-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--ig-muted); gap:12px; padding:20px; }
        .ig-empty-icon { width:96px; height:96px; border:2px solid #333; border-radius:50%; display:flex; align-items:center; justify-content:center; }
        .ig-empty-title { font-size:20px; font-weight:500; color:var(--ig-text); }
        
        /* Request row */
        .ig-req-row { display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:1px solid var(--ig-border); }
        .ig-req-actions { display:flex; gap:8px; }
        .ig-req-accept { padding:6px 14px; background:#0095f6; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
        .ig-req-decline { padding:6px 14px; background:#262626; color:var(--ig-text); border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
        
        @media (max-width: 768px) {
          .ig-sidebar { width:100%; position:absolute; z-index:10; }
          .ig-chat-pane { position:absolute; width:100%; left:100%; transition:left 0.3s ease; }
          .ig-chat-pane.mobile-open { left:0; }
        }
      `}</style>

      <div className="ig-root">
        {/* ── Sidebar ── */}
        <div className="ig-sidebar">
          <div className="ig-sidebar-header">
            <div className="ig-sidebar-title">
              <span>{user.name}</span>
            </div>
            <button className="ig-icon-btn" onClick={() => setActiveTab('people')} title="New message">
              <Edit size={20} />
            </button>
          </div>

          <div className="ig-tab-bar">
            <button className={`ig-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
              Messages {totalUnread > 0 && <span style={{ background: '#0095f6', color: '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 4 }}>{totalUnread}</span>}
            </button>
            <button className={`ig-tab ${activeTab === 'people' ? 'active' : ''}`} onClick={() => setActiveTab('people')}>
              People
            </button>
          </div>

          <div className="ig-search-wrap">
            <div className="ig-search-box">
              <Search size={14} color="#737373" />
              <input
                className="ig-search-input"
                placeholder={activeTab === 'messages' ? 'Search messages' : 'Search people'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737373' }}><X size={14} /></button>}
            </div>
          </div>

          <div className="ig-list">
            {/* ── Messages Tab ── */}
            {activeTab === 'messages' && (
              <>
                {/* Pending Requests Banner */}
                {requests.length > 0 && (
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--ig-border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0095f6', marginBottom: 8 }}>
                      Message Requests ({requests.length})
                    </div>
                    {requests.map(req => {
                      const sender = getAlumniById(req.sender_id);
                      return (
                        <div key={req.id} className="ig-req-row" style={{ padding: '8px 0' }}>
                          <Avatar src={sender?.avatar} name={sender?.name} size={44} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="ig-convo-name bold">{sender?.name || 'Unknown'}</div>
                            <div className="ig-convo-sub">{sender?.department || 'Alumni'}</div>
                          </div>
                          <div className="ig-req-actions">
                            <button className="ig-req-accept" onClick={() => handleRequestResponse(req.id, 'accept')}>Accept</button>
                            <button className="ig-req-decline" onClick={() => handleRequestResponse(req.id, 'decline')}>Decline</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Conversations */}
                {conversations
                  .filter(c => {
                    if (!searchQuery) return true;
                    const otherId = c.participants.find(p => p !== user.id);
                    const other = otherId ? getAlumniById(otherId) : null;
                    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map(convo => {
                    const otherId = convo.participants.find(p => p !== user.id) || user.id;
                    const other = getAlumniById(otherId);
                    if (!other) return null;
                    const isUnread = convo.unreadCount > 0;
                    const lastText = convo.lastMessage?.text || 'Start a conversation';
                    const lastSentByMe = convo.lastMessage?.sender_id === user.id;
                    const time = convo.lastMessage
                      ? (() => {
                          const d = new Date(convo.lastMessage.created_at);
                          const now = new Date();
                          const diffMs = now.getTime() - d.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          if (diffMins < 1) return 'now';
                          if (diffMins < 60) return `${diffMins}m`;
                          const diffH = Math.floor(diffMins / 60);
                          if (diffH < 24) return `${diffH}h`;
                          return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                        })()
                      : '';
                    return (
                      <button
                        key={convo.id}
                        className={`ig-convo-row ${activeConvoId === convo.id ? 'active' : ''}`}
                        onClick={() => setActiveConvoId(convo.id)}
                      >
                        <Avatar src={other.avatar} name={other.name} size={56} online={onlineUsers.has(other.id)} />
                        <div className="ig-convo-info">
                          <div className={`ig-convo-name ${isUnread ? 'bold' : ''}`}>{other.name}</div>
                          <div className={`ig-convo-sub ${isUnread ? 'bold' : ''}`}>
                            {lastSentByMe ? 'You: ' : ''}{lastText}
                            {time && <span style={{ color: '#737373', marginLeft: 4 }}>· {time}</span>}
                          </div>
                        </div>
                        {isUnread && <span className="ig-unread-dot" />}
                      </button>
                    );
                  })}

                {conversations.length === 0 && (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: '#737373' }}>
                    <MessageCircle size={36} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 600, color: '#f5f5f5', marginBottom: 4 }}>No messages yet</div>
                    <div style={{ fontSize: 13 }}>Go to "People" tab to start chatting!</div>
                  </div>
                )}
              </>
            )}

            {/* ── People Tab ── */}
            {activeTab === 'people' && (
              <>
                {/* Online People */}
                {filteredPeople.filter(u => onlineUsers.has(u.id)).length > 0 && (
                  <>
                    <div className="ig-section-header">Online Now</div>
                    {filteredPeople.filter(u => onlineUsers.has(u.id)).map(person => {
                      const hasConvo = conversations.some(c => c.participants.includes(person.id));
                      return (
                        <button
                          key={person.id}
                          className="ig-people-row"
                          onClick={() => handleStartChat(person.id)}
                          disabled={isSendingRequest}
                        >
                          <Avatar src={person.avatar} name={person.name} size={52} online />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="ig-person-name">{person.name}</div>
                            <div className="ig-person-sub">{person.department || 'Alumni'} {person.year ? `• ${person.year}` : ''}</div>
                          </div>
                          <button
                            className={`ig-chat-btn ${hasConvo ? 'connected' : ''}`}
                            onClick={e => { e.stopPropagation(); handleStartChat(person.id); }}
                            disabled={isSendingRequest}
                          >
                            {hasConvo ? 'Open' : 'Message'}
                          </button>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* All People */}
                <div className="ig-section-header">All Registered Members</div>
                {filteredPeople.length === 0 && (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#737373', fontSize: 14 }}>
                    No people found
                  </div>
                )}
                {filteredPeople.map(person => {
                  const hasConvo = conversations.some(c => c.participants.includes(person.id));
                  const isOnline = onlineUsers.has(person.id);
                  return (
                    <button
                      key={person.id}
                      className="ig-people-row"
                      onClick={() => handleStartChat(person.id)}
                      disabled={isSendingRequest}
                    >
                      <Avatar src={person.avatar} name={person.name} size={52} online={isOnline} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ig-person-name">{person.name}</div>
                        <div className="ig-person-sub">
                          {person.department || 'Alumni'}
                          {person.collegeName ? ` • ${person.collegeName}` : ''}
                          {person.year ? ` • ${person.year}` : ''}
                        </div>
                        {isOnline && <div style={{ fontSize: 11, color: 'var(--ig-online)', marginTop: 2 }}>● Active now</div>}
                      </div>
                      <button
                        className={`ig-chat-btn ${hasConvo ? 'connected' : ''}`}
                        onClick={e => { e.stopPropagation(); handleStartChat(person.id); }}
                        disabled={isSendingRequest}
                      >
                        {hasConvo ? 'Open' : 'Message'}
                      </button>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* ── Chat Pane ── */}
        <div className={`ig-chat-pane${activeConvoId ? ' mobile-open' : ''}`}>
          {activeConvoId && activeConvo ? (
            <>
              {/* Header */}
              <div className="ig-chat-header">
                <div className="ig-chat-header-left">
                  <button className="ig-icon-btn" style={{ marginRight: 4 }} onClick={() => setActiveConvoId(null)}>
                    <ArrowLeft size={20} />
                  </button>
                  <Avatar src={otherUser?.avatar} name={otherUser?.name} size={40} online={otherUserId ? onlineUsers.has(otherUserId) : false} />
                  <div>
                    <div className="ig-chat-header-name">{otherUser?.name || 'Unknown User'}</div>
                    <div className="ig-chat-header-status">
                      {otherUserId && onlineUsers.has(otherUserId) ? (
                        <span style={{ color: 'var(--ig-online)' }}>● Active now</span>
                      ) : (
                        otherUser?.department || 'Offline'
                      )}
                    </div>
                  </div>
                </div>
                <div className="ig-chat-actions">
                  <button className="ig-icon-btn"><Phone size={20} /></button>
                  <button className="ig-icon-btn"><Video size={20} /></button>
                  <button className="ig-icon-btn"><Info size={20} /></button>
                </div>
              </div>

              {/* Profile mini-card at top of chat */}
              {messages.length === 0 && (
                <div style={{ padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--ig-border)' }}>
                  <Avatar src={otherUser?.avatar} name={otherUser?.name} size={80} online={otherUserId ? onlineUsers.has(otherUserId) : false} />
                  <div style={{ marginTop: 12, fontWeight: 700, fontSize: 18, color: '#f5f5f5' }}>{otherUser?.name}</div>
                  {otherUser?.department && <div style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>{otherUser.department}{otherUser.year ? ` · ${otherUser.year}` : ''}</div>}
                  {otherUser?.collegeName && <div style={{ fontSize: 13, color: '#737373' }}>{otherUser.collegeName}</div>}
                  <div style={{ fontSize: 13, color: '#737373', marginTop: 8 }}>
                    Connected via Alumni Network
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="ig-messages">
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === user.id;
                  const showAvatar = !isMe && (i === messages.length - 1 || messages[i + 1]?.sender_id !== msg.sender_id);
                  const showTime = i === messages.length - 1 ||
                    (messages[i + 1] && (new Date(messages[i + 1].created_at).getTime() - new Date(msg.created_at).getTime()) > 5 * 60 * 1000);
                  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={msg.id}>
                      <div className={`ig-msg-row ${isMe ? 'ig-msg-me' : 'ig-msg-them'}`}>
                        {!isMe && (
                          <div style={{ width: 28, flexShrink: 0 }}>
                            {showAvatar && <Avatar src={otherUser?.avatar} name={otherUser?.name} size={24} />}
                          </div>
                        )}
                        <div>
                          <div className={`ig-bubble ${isMe ? 'ig-bubble-me' : 'ig-bubble-them'}`}>
                            {msg.text}
                          </div>
                          {showTime && (
                            <div className={`ig-msg-time ${isMe ? 'ig-time-right' : 'ig-time-left'}`}>{time}</div>
                          )}
                          {isMe && i === messages.length - 1 && (
                            <div className="ig-read-tick">{msg.read_at ? '✓✓ Seen' : '✓ Sent'}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="ig-msg-row ig-msg-them">
                    <div style={{ width: 28, flexShrink: 0 }}><Avatar src={otherUser?.avatar} name={otherUser?.name} size={24} /></div>
                    <div className="ig-bubble ig-bubble-them" style={{ padding: '10px 14px' }}>
                      <div className="ig-typing-dots">
                        <span className="ig-dot" />
                        <span className="ig-dot" />
                        <span className="ig-dot" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="ig-input-area">
                <div className="ig-input-box">
                  <button className="ig-icon-btn" style={{ padding: 4 }}><Smile size={22} /></button>
                  <input
                    ref={inputRef}
                    className="ig-msg-input"
                    value={input}
                    onChange={handleTyping}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Message..."
                  />
                  {input.trim() ? (
                    <button onClick={handleSend} className="ig-send-btn">Send</button>
                  ) : (
                    <div style={{ display: 'flex', gap: 2 }}>
                      <button className="ig-icon-btn" style={{ padding: 4 }}><Image size={20} /></button>
                      <button className="ig-icon-btn" style={{ padding: 4 }}><Heart size={20} /></button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="ig-empty">
              <div className="ig-empty-icon">
                <MessageCircle size={48} />
              </div>
              <div className="ig-empty-title">Your Messages</div>
              <p style={{ fontSize: 14, textAlign: 'center', maxWidth: 280 }}>
                Send private messages to anyone registered in the alumni network.
              </p>
              <button
                onClick={() => setActiveTab('people')}
                style={{ marginTop: 8, padding: '10px 24px', background: '#0095f6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
              >
                Find People
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}