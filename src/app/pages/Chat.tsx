'use client';
// Temporary localStorage connection-based chat demo for presentation.
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
// @ts-ignore
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
// @ts-ignore
import Users from 'lucide-react/dist/esm/icons/users';
// @ts-ignore
import Plus from 'lucide-react/dist/esm/icons/plus';
// @ts-ignore
import Send from 'lucide-react/dist/esm/icons/send';
// @ts-ignore
import X from 'lucide-react/dist/esm/icons/x';
// @ts-ignore
import Check from 'lucide-react/dist/esm/icons/check';
// @ts-ignore
import CheckCheck from 'lucide-react/dist/esm/icons/check-check';
// @ts-ignore
import Loader from 'lucide-react/dist/esm/icons/loader';
// @ts-ignore
import MoreVertical from 'lucide-react/dist/esm/icons/more-vertical';
// @ts-ignore
import Flag from 'lucide-react/dist/esm/icons/flag';
// @ts-ignore
import Ban from 'lucide-react/dist/esm/icons/ban';
// @ts-ignore
import Search from 'lucide-react/dist/esm/icons/search';
// @ts-ignore
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
// @ts-ignore
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import { Toast, showGlobalToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

// Types
interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'offline';
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  readAt?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  otherUser: User;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  blockedBy?: string;
}

interface ConnectionRequest {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  senderAvatar?: string;
  status: 'pending' | 'accepted' | 'declined';
}

interface ChatProps {
  theme?: 'dark' | 'light';
}

const DEMO_USERS: User[] = [
  { id: 'demo-alumni-1', name: 'Rahul Sharma', role: 'Alumni', avatar: '', status: 'online' },
  { id: 'demo-faculty-1', name: 'Dr. Priya Patel', role: 'Faculty', avatar: '', status: 'online' },
  { id: 'demo-student-1', name: 'Ananya Singh', role: 'Student', avatar: '', status: 'offline' },
  { id: 'demo-alumni-2', name: 'Vikram Joshi', role: 'Alumni', avatar: '', status: 'online' },
  { id: 'demo-faculty-2', name: 'Prof. Amit Kumar', role: 'Faculty', avatar: '', status: 'offline' },
];

const AUTO_REPLIES = [
  'Thanks for your message. I will get back to you soon.',
  'Sure, we can discuss this.',
  'Please share more details.',
  'That sounds great! Let me know more.',
  'I appreciate you reaching out. Let me check and get back to you.',
];

const STORAGE_KEYS = {
  conversations: 'chat_demo_conversations',
  messages: 'chat_demo_messages',
  blockedUsers: 'chat_demo_blocked_users',
  reportedUsers: 'chat_demo_reported_users',
  connectionRequests: 'chat_demo_connection_requests',
  acceptedConnections: 'chat_demo_accepted_connections',
};

export function Chat({ theme = 'dark' }: ChatProps) {
  const { user } = useAuth();
  const [view, setView] = useState<'conversations' | 'people' | 'requests'>('conversations');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [people, setPeople] = useState<User[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [acceptedConnections, setAcceptedConnections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-black' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-black';
  const borderClass = isDark ? 'border-[#262626]' : 'border-gray-200';
  const hoverBgClass = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';
  const inputBgClass = isDark ? 'bg-[#262626] text-white placeholder-gray-500' : 'bg-gray-100 text-black placeholder-gray-400';

  // Load data from localStorage on mount
  useEffect(() => {
    if (!user?.id) return;
    loadFromStorage();
  }, [user?.id]);

  // Refresh conversations when view changes to inbox
  useEffect(() => {
    if (view === 'conversations') {
      loadFromStorage();
    }
  }, [view]);

  // Load people when view changes to people
  useEffect(() => {
    if (view === 'people') {
      setPeople(DEMO_USERS);
    }
  }, [view]);

  // Load requests and accepted connections when view changes to requests
  useEffect(() => {
    if (view === 'requests') {
      const stored = localStorage.getItem(STORAGE_KEYS.connectionRequests);
      if (stored) {
        setRequests(JSON.parse(stored));
      } else {
        // Seed demo requests (incoming)
        const demoRequests: ConnectionRequest[] = [
          { id: 'req-1', senderId: 'demo-alumni-1', receiverId: user?.id || '', senderName: 'Rahul Sharma', senderAvatar: '', status: 'pending' },
          { id: 'req-2', senderId: 'demo-student-1', receiverId: user?.id || '', senderName: 'Ananya Singh', senderAvatar: '', status: 'pending' },
        ];
        setRequests(demoRequests);
        localStorage.setItem(STORAGE_KEYS.connectionRequests, JSON.stringify(demoRequests));
      }
      // Load accepted connections
      const acceptedStored = localStorage.getItem(STORAGE_KEYS.acceptedConnections);
      if (acceptedStored) {
        setAcceptedConnections(JSON.parse(acceptedStored));
      }
    }
  }, [view, user?.id]);

  // Load accepted connections when view changes to conversations (inbox)
  useEffect(() => {
    if (view === 'conversations') {
      const acceptedStored = localStorage.getItem(STORAGE_KEYS.acceptedConnections);
      if (acceptedStored) {
        setAcceptedConnections(JSON.parse(acceptedStored));
      }
    }
  }, [view]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConversation?.id) return;
    const stored = localStorage.getItem(STORAGE_KEYS.messages);
    if (stored) {
      const allMessages: Message[] = JSON.parse(stored);
      const convoMessages = allMessages.filter(m => m.conversationId === selectedConversation.id);
      setMessages(convoMessages);
    } else {
      setMessages([]);
    }
    // Mark as read
    setConversations(prev => prev.map(c =>
      c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
    ));
  }, [selectedConversation?.id]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadFromStorage = () => {
    const storedConvos = localStorage.getItem(STORAGE_KEYS.conversations);
    if (storedConvos) {
      const parsed: Conversation[] = JSON.parse(storedConvos);
      // Sort by lastMessageTime descending, conversations with messages first
      parsed.sort((a: Conversation, b: Conversation) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
      setConversations(parsed);
    } else {
      setConversations([]);
    }
  };

  const saveConversations = (convos: Conversation[]) => {
    localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(convos));
    setConversations(convos);
  };

  const saveMessages = (msgs: Message[]) => {
    localStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(msgs));
  };

  const getBlockedUsers = (): string[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.blockedUsers);
    return stored ? JSON.parse(stored) : [];
  };

  const saveBlockedUsers = (blocked: string[]) => {
    localStorage.setItem(STORAGE_KEYS.blockedUsers, JSON.stringify(blocked));
  };

  const getReportedUsers = (): string[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.reportedUsers);
    return stored ? JSON.parse(stored) : [];
  };

  const saveReportedUsers = (reported: string[]) => {
    localStorage.setItem(STORAGE_KEYS.reportedUsers, JSON.stringify(reported));
  };

  const getAcceptedConnections = (): string[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.acceptedConnections);
    return stored ? JSON.parse(stored) : [];
  };

  const saveAcceptedConnections = (connections: string[]) => {
    localStorage.setItem(STORAGE_KEYS.acceptedConnections, JSON.stringify(connections));
    setAcceptedConnections(connections);
  };

  const getOrCreateConversation = (otherUser: User): Conversation => {
    const existing = conversations.find(c => c.otherUser.id === otherUser.id);
    if (existing) return existing;

    const newConvo: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      participants: [user!.id, otherUser.id],
      otherUser,
      unreadCount: 0,
    };

    const updated = [...conversations, newConvo];
    saveConversations(updated);
    return newConvo;
  };

  const updateConversationLastMessage = (conversationId: string, messageText: string, messageTime: string) => {
    // Update the conversations state directly
    setConversations(prev => {
      const updated = [...prev];
      const convoIndex = updated.findIndex(c => c.id === conversationId);
      
      if (convoIndex !== -1) {
        updated[convoIndex] = {
          ...updated[convoIndex],
          lastMessage: messageText,
          lastMessageTime: messageTime,
        };
      } else if (selectedConversation && selectedConversation.id === conversationId) {
        // If conversation not found in array but we have it selected, add it
        updated.push({
          ...selectedConversation,
          lastMessage: messageText,
          lastMessageTime: messageTime,
        });
      }

      // Sort by lastMessageTime descending
      updated.sort((a: Conversation, b: Conversation) => {
        if (!a.lastMessageTime && !b.lastMessageTime) return 0;
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(updated));
      
      return updated;
    });
  };

  const handlePersonClick = (person: User) => {
    // Check if there's an accepted connection with this person
    const accepted = getAcceptedConnections();
    if (accepted.includes(person.id)) {
      // Open chat directly if accepted
      const convo = getOrCreateConversation(person);
      setSelectedConversation(convo);
      setView('conversations');
      setTimeout(() => loadFromStorage(), 0);
    } else {
      // Check if request is pending
      const allRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.connectionRequests) || '[]') as ConnectionRequest[];
      const pendingRequest = allRequests.find(r => 
        (r.senderId === user?.id && r.receiverId === person.id) ||
        (r.senderId === person.id && r.receiverId === user?.id)
      );
      
      if (pendingRequest && pendingRequest.status === 'pending') {
        showGlobalToast('Chat will be enabled after request is accepted.', 'info');
      } else if (pendingRequest && pendingRequest.status === 'declined') {
        showGlobalToast('Request was rejected. You cannot chat with this user.', 'warning');
      } else {
        showGlobalToast('Send a connection request first to enable chat.', 'info');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation?.id || !user?.id) return;

    const blockedUsers = getBlockedUsers();
    if (blockedUsers.includes(selectedConversation.otherUser.id)) {
      showGlobalToast('You blocked this user. Unblock to send messages.', 'warning');
      return;
    }

    // Check if connection is accepted
    const accepted = getAcceptedConnections();
    if (!accepted.includes(selectedConversation.otherUser.id)) {
      showGlobalToast('Chat will be enabled after request is accepted.', 'info');
      return;
    }

    setSendingMessage(true);

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId: selectedConversation.id,
      senderId: user.id,
      text: messageText.trim(),
      createdAt: new Date().toISOString(),
    };

    const stored = localStorage.getItem(STORAGE_KEYS.messages);
    const allMessages: Message[] = stored ? JSON.parse(stored) : [];
    const updatedMessages = [...allMessages, newMessage];
    saveMessages(updatedMessages);
    setMessages(prev => [...prev, newMessage]);
    setMessageText('');
    showGlobalToast('Message sent.', 'success');

    // Update conversation with last message
    updateConversationLastMessage(selectedConversation.id, messageText.trim(), newMessage.createdAt);

    // Auto-reply after 1 second
    setTimeout(() => {
      const autoReply: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        conversationId: selectedConversation.id,
        senderId: selectedConversation.otherUser.id,
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        createdAt: new Date().toISOString(),
      };
      const currentStored = localStorage.getItem(STORAGE_KEYS.messages);
      const currentMessages: Message[] = currentStored ? JSON.parse(currentStored) : [];
      const newAll = [...currentMessages, autoReply];
      saveMessages(newAll);
      setMessages(prev => [...prev, autoReply]);
      
      // Update conversation with auto-reply as last message
      updateConversationLastMessage(selectedConversation.id, autoReply.text, autoReply.createdAt);
    }, 1000);

    setSendingMessage(false);
  };

  const handleReport = () => {
    if (!selectedConversation) return;
    if (!reportReason) {
      showGlobalToast('Please select a reason.', 'warning');
      return;
    }
    const reported = getReportedUsers();
    if (!reported.includes(selectedConversation.otherUser.id)) {
      reported.push(selectedConversation.otherUser.id);
      saveReportedUsers(reported);
    }
    setShowReportModal(false);
    setReportReason('');
    showGlobalToast('Report submitted successfully.', 'success');
  };

  const handleBlock = () => {
    if (!selectedConversation) return;
    const blocked = getBlockedUsers();
    if (!blocked.includes(selectedConversation.otherUser.id)) {
      blocked.push(selectedConversation.otherUser.id);
      saveBlockedUsers(blocked);
    }
    setShowBlockModal(false);
    showGlobalToast('User blocked.', 'success');
    // Refresh conversation to show blocked state
    loadFromStorage();
    if (selectedConversation) {
      const updated = conversations.find(c => c.id === selectedConversation.id);
      if (updated) setSelectedConversation(updated);
    }
  };

  const handleUnblock = () => {
    if (!selectedConversation) return;
    const blocked = getBlockedUsers();
    const updated = blocked.filter(id => id !== selectedConversation.otherUser.id);
    saveBlockedUsers(updated);
    showGlobalToast('User unblocked.', 'success');
    loadFromStorage();
    if (selectedConversation) {
      const updatedConvo = conversations.find(c => c.id === selectedConversation.id);
      if (updatedConvo) setSelectedConversation(updatedConvo);
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Remove from requests
    const updatedRequests = requests.filter(r => r.id !== requestId);
    setRequests(updatedRequests);
    localStorage.setItem(STORAGE_KEYS.connectionRequests, JSON.stringify(updatedRequests));

    // Add to accepted connections
    const accepted = getAcceptedConnections();
    const newAccepted = [...accepted];
    // Add both directions
    if (!newAccepted.includes(request.senderId)) {
      newAccepted.push(request.senderId);
    }
    if (!newAccepted.includes(request.receiverId)) {
      newAccepted.push(request.receiverId);
    }
    saveAcceptedConnections(newAccepted);

    // Create conversation for the accepted user
    const otherUser: User = {
      id: request.senderId,
      name: request.senderName,
      avatar: request.senderAvatar || '',
      role: 'User',
      status: 'offline',
    };
    getOrCreateConversation(otherUser);

    showGlobalToast('Request accepted. Chat enabled.', 'success');
  };

  const handleDeclineRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    // Mark as declined
    const updated = requests.map(r => 
      r.id === requestId ? { ...r, status: 'declined' as const } : r
    );
    setRequests(updated);
    localStorage.setItem(STORAGE_KEYS.connectionRequests, JSON.stringify(updated));

    showGlobalToast('Request rejected.', 'info');
  };

  const handleSendConnectionRequest = (person: User) => {
    if (!user?.id) return;

    // Check if request already exists
    const allRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.connectionRequests) || '[]') as ConnectionRequest[];
    const existingRequest = allRequests.find(r => 
      (r.senderId === user.id && r.receiverId === person.id) ||
      (r.senderId === person.id && r.receiverId === user.id)
    );

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        showGlobalToast('Request already sent.', 'info');
      } else if (existingRequest.status === 'accepted') {
        showGlobalToast('You are already connected.', 'info');
      } else if (existingRequest.status === 'declined') {
        showGlobalToast('Request was declined.', 'warning');
      }
      return;
    }

    const newReq: ConnectionRequest = {
      id: `req-${Date.now()}`,
      senderId: user.id,
      receiverId: person.id,
      senderName: user?.name || 'You',
      senderAvatar: '',
      status: 'pending',
    };
    const stored = localStorage.getItem(STORAGE_KEYS.connectionRequests);
    const existing: ConnectionRequest[] = stored ? JSON.parse(stored) : [];
    const updated = [...existing, newReq];
    localStorage.setItem(STORAGE_KEYS.connectionRequests, JSON.stringify(updated));
    
    // Update local state
    setRequests(prev => [...prev, newReq]);
    
    showGlobalToast('Request sent.', 'success');
  };

  const getRequestStatus = (personId: string): 'none' | 'pending' | 'accepted' | 'declined' => {
    if (!user?.id) return 'none';
    const allRequests = JSON.parse(localStorage.getItem(STORAGE_KEYS.connectionRequests) || '[]') as ConnectionRequest[];
    const request = allRequests.find(r => 
      (r.senderId === user.id && r.receiverId === personId) ||
      (r.senderId === personId && r.receiverId === user.id)
    );
    if (!request) return 'none';
    return request.status;
  };

  const isBlocked = selectedConversation ? getBlockedUsers().includes(selectedConversation.otherUser.id) : false;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredPeople = people.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Inbox: show only conversations with accepted connections
  const acceptedConversations = conversations.filter(c => acceptedConnections.includes(c.otherUser.id));
  const filteredConversations = acceptedConversations.filter(c =>
    c.otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Requests: show incoming and outgoing pending requests
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const incomingRequests = pendingRequests.filter(r => r.receiverId === user?.id);
  const outgoingRequests = pendingRequests.filter(r => r.senderId === user?.id);

  if (!user?.id) {
    return <div className={`${bgClass} ${textClass} p-4`}>Please log in to use chat</div>;
  }

  return (
    <div className={`${bgClass} h-full flex flex-col`}>
      {/* Header */}
      <div className={`border-b ${borderClass} p-4 flex items-center justify-between`}>
        <h2 className={`text-xl font-bold ${textClass}`}>Messages</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`w-80 border-r ${borderClass} flex flex-col`}>
          {/* Tabs */}
          <div className={`flex gap-4 p-4 border-b ${borderClass}`}>
            <button
              onClick={() => setView('conversations')}
              className={`pb-2 px-2 font-semibold transition-colors ${
                view === 'conversations'
                  ? `text-[#FFD700] border-b-2 border-[#FFD700]`
                  : `${textClass} opacity-60 hover:opacity-100`
              }`}
            >
              Inbox
            </button>
            <button
              onClick={() => setView('people')}
              className={`pb-2 px-2 font-semibold transition-colors ${
                view === 'people'
                  ? `text-[#FFD700] border-b-2 border-[#FFD700]`
                  : `${textClass} opacity-60 hover:opacity-100`
              }`}
            >
              People
            </button>
            <button
              onClick={() => setView('requests')}
              className={`pb-2 px-2 font-semibold transition-colors relative ${
                view === 'requests'
                  ? `text-[#FFD700] border-b-2 border-[#FFD700]`
                  : `${textClass} opacity-60 hover:opacity-100`
              }`}
            >
              Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-full pl-9 pr-4 py-2 text-sm transition-colors focus:outline-none ${inputBgClass}`}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {view === 'conversations' && (
              <>
                {filteredConversations.length === 0 ? (
                  <div className={`p-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <MessageCircle className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Go to People tab to send connection requests</p>
                  </div>
                ) : (
                  filteredConversations.map((convo) => {
                    const connectionStatus = getRequestStatus(convo.otherUser.id);
                    const isAccepted = acceptedConnections.includes(convo.otherUser.id);
                    
                    return (
                      <div
                        key={convo.id}
                        onClick={() => {
                          if (isAccepted) {
                            setSelectedConversation(convo);
                          } else {
                            showGlobalToast('Chat will be enabled after request is accepted.', 'info');
                          }
                        }}
                        className={`p-3 border-b ${borderClass} cursor-pointer transition-colors ${
                          selectedConversation?.id === convo.id
                            ? isDark ? 'bg-[#262626]' : 'bg-gray-100'
                            : hoverBgClass
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-[#333] text-white' : 'bg-gray-200 text-black'}`}>
                              {convo.otherUser.avatar ? (
                                <img src={convo.otherUser.avatar} alt={convo.otherUser.name} className="w-12 h-12 rounded-full object-cover" />
                              ) : (
                                convo.otherUser.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            {convo.otherUser.status === 'online' && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className={`font-semibold ${textClass} truncate`}>{convo.otherUser.name}</p>
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {convo.lastMessageTime ? formatTime(convo.lastMessageTime) : ''}
                              </span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{convo.otherUser.role}</p>
                            <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {convo.lastMessage || 'No messages yet'}
                            </p>
                          </div>
                          {convo.unreadCount > 0 && (
                            <span className="bg-[#FFD700] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {convo.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {view === 'people' && (
              <>
                {filteredPeople.length === 0 ? (
                  <div className={`p-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Users className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-sm">{searchQuery ? 'No results found' : 'No people available'}</p>
                  </div>
                ) : (
                  filteredPeople.map((person) => {
                    const requestStatus = getRequestStatus(person.id);
                    const isAccepted = acceptedConnections.includes(person.id);
                    
                    return (
                      <div
                        key={person.id}
                        className={`p-3 border-b ${borderClass} flex items-center justify-between transition-colors ${isAccepted ? '' : hoverBgClass}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-[#333] text-white' : 'bg-gray-200 text-black'}`}>
                            {person.avatar ? (
                              <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              person.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold ${textClass} truncate`}>{person.name}</p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {person.role || 'User'}
                            </p>
                            {requestStatus === 'pending' && (
                              <p className="text-xs text-yellow-500 mt-1">Request Sent</p>
                            )}
                            {requestStatus === 'accepted' && (
                              <p className="text-xs text-green-500 mt-1">Connected</p>
                            )}
                            {requestStatus === 'declined' && (
                              <p className="text-xs text-red-500 mt-1">Declined</p>
                            )}
                          </div>
                        </div>
                        {isAccepted ? (
                          <button
                            onClick={() => handlePersonClick(person)}
                            className="ml-2 p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                            title="Open chat"
                          >
                            <MessageCircle size={18} />
                          </button>
                        ) : requestStatus === 'pending' ? (
                          <span className="ml-2 px-3 py-1.5 rounded-full bg-yellow-600/20 text-yellow-500 text-xs font-semibold">
                            Pending
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendConnectionRequest(person);
                            }}
                            className="ml-2 p-2 rounded-full bg-[#FFD700] text-black hover:bg-yellow-500 transition-colors"
                            title="Send connection request"
                          >
                            <UserPlus size={18} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </>
            )}

            {view === 'requests' && (
              <>
                {requests.length === 0 ? (
                  <div className={`p-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Users className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-sm">No pending requests</p>
                  </div>
                ) : (
                  <div className="p-3 space-y-4">
                    {/* Incoming Requests */}
                    {incomingRequests.length > 0 && (
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Incoming Requests
                        </p>
                        <div className="space-y-2">
                          {incomingRequests.map((request) => (
                            <div
                              key={request.id}
                              className={`p-3 rounded-lg border ${borderClass} ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-[#333] text-white' : 'bg-gray-200 text-black'}`}>
                                  {request.senderAvatar ? (
                                    <img src={request.senderAvatar} alt={request.senderName} className="w-12 h-12 rounded-full object-cover" />
                                  ) : (
                                    request.senderName.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`font-semibold ${textClass}`}>{request.senderName}</p>
                                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    wants to connect with you
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptRequest(request.id)}
                                  className="flex-1 px-3 py-2 bg-[#FFD700] text-black rounded-lg font-semibold text-sm hover:bg-yellow-500 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDeclineRequest(request.id)}
                                  className={`flex-1 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                    isDark ? 'bg-[#262626] text-white hover:bg-[#1a1a1a]' : 'bg-gray-200 text-black hover:bg-gray-300'
                                  }`}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Outgoing Requests */}
                    {outgoingRequests.length > 0 && (
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Sent Requests
                        </p>
                        <div className="space-y-2">
                          {outgoingRequests.map((request) => (
                            <div
                              key={request.id}
                              className={`p-3 rounded-lg border ${borderClass} ${isDark ? 'bg-[#1a1a1a]' : 'bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-[#333] text-white' : 'bg-gray-200 text-black'}`}>
                                  {request.senderAvatar ? (
                                    <img src={request.senderAvatar} alt={request.senderName} className="w-12 h-12 rounded-full object-cover" />
                                  ) : (
                                    request.senderName.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className={`font-semibold ${textClass}`}>{request.senderName}</p>
                                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Request sent
                                  </p>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-yellow-600/20 text-yellow-500 text-xs font-semibold">
                                  Pending
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation?.otherUser ? (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className={`border-b ${borderClass} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-[#333] text-white' : 'bg-gray-200 text-black'}`}>
                  {selectedConversation.otherUser.avatar ? (
                    <img src={selectedConversation.otherUser.avatar} alt={selectedConversation.otherUser.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    selectedConversation.otherUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className={`font-semibold ${textClass}`}>{selectedConversation.otherUser.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {selectedConversation.otherUser.role}
                    {isBlocked && ' • Blocked'}
                  </p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowChatMenu(!showChatMenu)}
                  className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-[#262626]' : 'hover:bg-gray-100'}`}
                >
                  <MoreVertical size={20} className={textClass} />
                </button>
                {showChatMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowChatMenu(false)} />
                    <div className={`absolute right-0 top-10 w-48 rounded-lg shadow-lg border ${borderClass} ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} z-20`}>
                      <button
                        onClick={() => { setShowReportModal(true); setShowChatMenu(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-3 text-sm ${textClass} hover:bg-[#262626] transition-colors`}
                      >
                        <Flag size={16} />
                        Report
                      </button>
                      {!isBlocked ? (
                        <button
                          onClick={() => { setShowBlockModal(true); setShowChatMenu(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-[#262626] transition-colors`}
                        >
                          <Ban size={16} />
                          Block
                        </button>
                      ) : (
                        <button
                          onClick={() => { handleUnblock(); setShowChatMenu(false); }}
                          className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-green-400 hover:bg-[#262626] transition-colors`}
                        >
                          <Ban size={16} />
                          Unblock
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className={`text-center py-12 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <MessageCircle className="mx-auto mb-4 opacity-30" size={48} />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        msg.senderId === user?.id
                          ? 'bg-[#FFD700] text-black rounded-br-none'
                          : isDark ? 'bg-[#262626] text-white rounded-bl-none' : 'bg-gray-200 text-black rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-xs opacity-70">
                        <span>{formatTime(msg.createdAt)}</span>
                        {msg.senderId === user?.id && (
                          msg.readAt ? <CheckCheck size={12} /> : <Check size={12} />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={`border-t ${borderClass} p-4 flex gap-2`}>
              {isBlocked ? (
                <div className={`flex-1 text-center py-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <p className="text-sm">You blocked this user.</p>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className={`flex-1 rounded-full px-4 py-2 text-sm transition-colors focus:outline-none ${inputBgClass}`}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                    className="p-2 rounded-full bg-[#FFD700] text-black hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    <Send size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${bgClass}`}>
            <div className={`text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <MessageCircle className="mx-auto mb-4 opacity-30" size={64} />
              <p className="text-lg font-semibold">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ConfirmModal
        isOpen={showReportModal}
        onClose={() => { setShowReportModal(false); setReportReason(''); }}
        onConfirm={handleReport}
        title="Report User"
        message="Why are you reporting this user?"
        confirmText="Submit Report"
        type="warning"
      >
        <div className="mt-4 space-y-2">
          {['Spam', 'Inappropriate message', 'Fake profile', 'Harassment', 'Other'].map((reason) => (
            <label key={reason} className={`flex items-center gap-2 p-3 rounded-lg border ${borderClass} cursor-pointer ${isDark ? 'hover:bg-[#262626]' : 'hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="reportReason"
                value={reason}
                checked={reportReason === reason}
                onChange={(e) => setReportReason(e.target.value)}
                className="accent-[#FFD700]"
              />
              <span className={`text-sm ${textClass}`}>{reason}</span>
            </label>
          ))}
        </div>
      </ConfirmModal>

      {/* Block Modal */}
      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
        title="Block User"
        message={`Are you sure you want to block ${selectedConversation?.otherUser.name}? You won't be able to send or receive messages from this user.`}
        confirmText="Block"
        cancelText="Cancel"
        type="danger"
      />

      {/* Toast Container */}
      <Toast />
    </div>
  );
}

export default Chat;