'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabaseClient';
// @ts-ignore
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
// @ts-ignore
import Users from 'lucide-react/dist/esm/icons/users';
// @ts-ignore
import Send from 'lucide-react/dist/esm/icons/send';
// @ts-ignore
import Check from 'lucide-react/dist/esm/icons/check';
// @ts-ignore
import CheckCheck from 'lucide-react/dist/esm/icons/check-check';
// @ts-ignore
import MoreVertical from 'lucide-react/dist/esm/icons/more-vertical';
// @ts-ignore
import Flag from 'lucide-react/dist/esm/icons/flag';
// @ts-ignore
import Ban from 'lucide-react/dist/esm/icons/ban';
// @ts-ignore
import Search from 'lucide-react/dist/esm/icons/search';
// @ts-ignore
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
// @ts-ignore
import Home from 'lucide-react/dist/esm/icons/home';
// @ts-ignore
import Network from 'lucide-react/dist/esm/icons/users';
// @ts-ignore
import GraduationCap from 'lucide-react/dist/esm/icons/graduation-cap';
import { Toast, showGlobalToast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { UserProfile } from '../data/types';

// Types
interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: string;
  read_at?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  otherUser: UserProfile;
  otherUserId: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

interface ChatProps {
  theme?: 'dark' | 'light';
}

export function Chat({ theme = 'dark' }: ChatProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);

  const isDark = theme === 'dark';
  const bgClass = isDark ? 'bg-slate-900' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-black';
  const borderClass = isDark ? 'border-slate-700' : 'border-gray-200';
  const hoverBgClass = isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-50';
  const inputBgClass = isDark ? 'bg-slate-800 text-white placeholder-gray-400' : 'bg-gray-100 text-black placeholder-gray-400';


  // Fetch conversations from Supabase
  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: { 'x-user-id': user.id },
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData: any;
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error('Failed to fetch conversations - HTTP Error:', response.status, text);
          errorData = { error: `HTTP ${response.status}: ${text || response.statusText}` };
        }
        
        console.error('Failed to fetch conversations:', errorData);
        return;
      }
      
      const data = await response.json();

      // Enrich conversations with user profiles
      const enriched: Conversation[] = await Promise.all(
        (data || []).map(async (convo: any) => {
          const otherUserId = convo.participants.find((p: string) => p !== user.id);
          if (!otherUserId) return null;

          // Fetch other user's profile
          const otherUser = await fetchUserProfile(otherUserId);
          if (!otherUser) return null;

          return {
            id: convo.id,
            participants: convo.participants,
            otherUserId: otherUserId,
            otherUser: otherUser,
            lastMessage: convo.lastMessage?.text || '',
            lastMessageTime: convo.lastMessage?.created_at || '',
            unreadCount: convo.unreadCount || 0,
          };
        })
      );

      setConversations(enriched.filter((c) => c !== null));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Create or find existing conversation with another user
  const createOrFindConversation = async (otherUserId: string): Promise<Conversation | null> => {
    if (!user?.id) return null;

    try {
      // First, check if conversation already exists
      const existingConvo = conversations.find(c => c.otherUserId === otherUserId);
      if (existingConvo) {
        setSelectedConversation(existingConvo);
        return existingConvo;
      }

      // If not, create a new conversation
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const createResponse = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ otherUserId }),
      });

      if (!createResponse.ok) {
        const contentType = createResponse.headers.get('content-type');
        let errorData: any;
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await createResponse.json();
        } else {
          const text = await createResponse.text();
          console.error('Failed to create conversation - HTTP Error:', createResponse.status, text);
          errorData = { error: `HTTP ${createResponse.status}: ${text || createResponse.statusText}` };
        }
        
        showGlobalToast(errorData.error || 'Failed to create conversation', 'error');
        return null;
      }

      const convoData = await createResponse.json();

      // Fetch the new conversation's details
      const otherUser = await fetchUserProfile(otherUserId);
      if (!otherUser) {
        showGlobalToast('Failed to load other user profile', 'error');
        return null;
      }

      const newConvo: Conversation = {
        id: convoData.id,
        participants: convoData.participants || [user.id, otherUserId],
        otherUserId: otherUserId,
        otherUser: otherUser,
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0,
      };

      // Add to conversations list
      setConversations(prev => [newConvo, ...prev]);
      setSelectedConversation(newConvo);
      showGlobalToast('Conversation started!', 'success');
      
      return newConvo;
    } catch (error) {
      console.error('Error creating conversation:', error);
      showGlobalToast('Failed to create conversation', 'error');
      return null;
    }
  };

  // Fetch single user profile
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      // Try each profile type
      const [studentRes, alumniRes, facultyRes] = await Promise.all([
        supabase.from('student_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('alumni_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('faculty_profiles').select('*').eq('user_id', userId).maybeSingle(),
      ]);

      const profile = studentRes.data || alumniRes.data || facultyRes.data;
      if (!profile) return null;

      const role = studentRes.data ? 'student' : alumniRes.data ? 'alumni' : 'faculty';

      return {
        id: profile.user_id,
        name: `${profile.First_Name || profile.first_name || ''} ${profile.Last_name || profile.last_name || ''}`.trim(),
        role: role as any,
        avatar: profile.Photo_URL || profile.photo_url || '',
        email: profile.Email_Address || profile.email || '',
        department: profile.Department || profile.department || '',
        year: profile.Passed_Out_Year || profile.Year_of_Joining || profile.passed_out_year || profile.year_of_joining || '',
      };
    } catch (error) {
      console.error(`Error fetching profile for ${userId}:`, error);
      return null;
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversation?.id) return;

    const loadMessages = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/conversations/${selectedConversation.id}/messages`, {
          headers: { 'x-user-id': user?.id || '' },
        });
        
        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          let errorData: any;
          
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            const text = await response.text();
            console.error('Error loading messages - HTTP Error:', response.status, text);
            errorData = { error: `HTTP ${response.status}: ${text || response.statusText}` };
          }
          
          console.error('Failed to load messages:', errorData);
          return;
        }
        
        const data = await response.json();
        setMessages(data || []);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedConversation?.id, user?.id]);

  // Setup realtime listeners
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to conversation changes
    const conversationsSubscription = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      conversationsSubscription.unsubscribe();
    };
  }, [user?.id]);

  // Initial data load
  useEffect(() => {
    if (!user?.id) return;
    fetchConversations();
  }, [user?.id]);

  // Handle navigation from Alumni Directory
  useEffect(() => {
    if (!location.state?.conversationId || !conversations.length) return;
    
    const convo = conversations.find(c => c.id === location.state.conversationId);
    if (convo) {
      setSelectedConversation(convo);
    }
  }, [location.state, conversations]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation?.id || !user?.id) return;

    setSendingMessage(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ text: messageText.trim() }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData: any;
        
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          console.error('Error sending message - HTTP Error:', response.status, text);
          errorData = { error: `HTTP ${response.status}: ${text || response.statusText}` };
        }
        
        showGlobalToast(errorData.error || 'Failed to send message', 'error');
        return;
      }

      const data = await response.json();
      setMessageText('');
      showGlobalToast('Message sent.', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showGlobalToast('Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  // Report user
  const handleReport = () => {
    if (!selectedConversation || !reportReason) {
      showGlobalToast('Please select a reason.', 'warning');
      return;
    }
    setShowReportModal(false);
    setReportReason('');
    showGlobalToast('Report submitted successfully.', 'success');
  };

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

  const filteredConversations = conversations.filter((c) =>
    c.otherUser.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user?.id) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Please log in to access chat</div>
          <Link 
            to="/login"
            className="px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* App Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/network')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Network</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-yellow-500 p-1.5 rounded-md text-slate-900">
              <MessageCircle size={20} />
            </div>
            <h1 className="text-xl font-bold">Alumni Chat</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
            </div>
            <img
              src={user?.avatar || "https://ui-avatars.com/api/?name=User&background=random"}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-slate-600 object-cover"
            />
          </div>
          <Link 
            to="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Home size={20} />
          </Link>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Conversations */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-700 bg-slate-800">
          {/* Search */}
          <div className="p-4 border-b border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-slate-400">
                <MessageCircle className="mx-auto mb-3 opacity-50" size={32} />
                <p className="text-sm font-medium">No conversations yet</p>
                <p className="text-xs mt-1 text-slate-500">Go to Alumni Directory to start chatting</p>
                <Link 
                  to="/network"
                  className="inline-block mt-3 px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg text-sm font-medium hover:bg-yellow-400 transition-colors"
                >
                  Find Alumni
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredConversations.map((convo) => (
                  <div
                    key={convo.id}
                    onClick={() => setSelectedConversation(convo)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedConversation?.id === convo.id
                        ? 'bg-slate-700 border-r-2 border-yellow-500'
                        : 'hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600 flex items-center justify-center">
                          {convo.otherUser.avatar ? (
                            <img 
                              src={convo.otherUser.avatar} 
                              alt={convo.otherUser.name} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {convo.otherUser.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-white truncate">{convo.otherUser.name}</p>
                          <span className="text-xs text-slate-400">
                            {convo.lastMessageTime ? formatTime(convo.lastMessageTime) : ''}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-400 mb-1">{convo.otherUser.role}</p>
                        <p className="text-sm text-slate-400 truncate">
                          {convo.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      {convo.unreadCount > 0 && (
                        <span className="bg-yellow-500 text-slate-900 text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        {selectedConversation?.otherUser ? (
          <div className="flex-1 flex flex-col bg-slate-900">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600 flex items-center justify-center">
                  {selectedConversation.otherUser.avatar ? (
                    <img 
                      src={selectedConversation.otherUser.avatar} 
                      alt={selectedConversation.otherUser.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {selectedConversation.otherUser.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedConversation.otherUser.name}</p>
                  <p className="text-sm text-slate-400">{selectedConversation.otherUser.role}</p>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowChatMenu(!showChatMenu)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <MoreVertical size={20} />
                </button>
                {showChatMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowChatMenu(false)} />
                    <div className="absolute right-0 top-12 w-48 rounded-lg shadow-lg border border-slate-600 bg-slate-800 z-20">
                      <button
                        onClick={() => {
                          setShowReportModal(true);
                          setShowChatMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-slate-700 transition-colors rounded-lg"
                      >
                        <Flag size={16} />
                        Report User
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <MessageCircle className="mx-auto mb-4 opacity-30" size={48} />
                    <p className="text-lg font-medium">Start the conversation</p>
                    <p className="text-sm mt-1 text-slate-500">Say hello to {selectedConversation.otherUser.name}!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-sm lg:max-w-md px-4 py-3 rounded-2xl ${
                          msg.sender_id === user?.id
                            ? 'bg-yellow-500 text-slate-900 rounded-br-md'
                            : 'bg-slate-700 text-white rounded-bl-md'
                        }`}
                      >
                        <p className="break-words">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-2 text-xs opacity-70">
                          <span>{formatTime(msg.created_at)}</span>
                          {msg.sender_id === user?.id && (
                            <span className="ml-1">
                              {msg.read_at ? <CheckCheck size={14} /> : <Check size={14} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-800">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={`Message ${selectedConversation.otherUser.name}...`}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1 rounded-lg px-4 py-3 text-sm bg-slate-700 text-white placeholder-slate-400 border border-slate-600 focus:outline-none focus:border-yellow-500 transition-colors"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-900">
            <div className="text-center text-slate-400">
              <MessageCircle className="mx-auto mb-6 opacity-30" size={64} />
              <p className="text-xl font-semibold mb-2">Welcome to Alumni Chat</p>
              <p className="text-slate-500 mb-6">Select a conversation to start messaging</p>
              <Link 
                to="/network"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-slate-900 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
              >
                <Network size={18} />
                Find Alumni to Chat
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ConfirmModal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setReportReason('');
        }}
        onConfirm={handleReport}
        title="Report User"
        message="Why are you reporting this user?"
        confirmText="Submit Report"
        type="warning"
      >
        <div className="mt-4 space-y-2">
          {['Spam', 'Inappropriate message', 'Fake profile', 'Harassment', 'Other'].map((reason) => (
            <label key={reason} className="flex items-center gap-2 p-3 rounded-lg border border-slate-600 cursor-pointer hover:bg-slate-800 bg-slate-700">
              <input
                type="radio"
                name="reportReason"
                value={reason}
                checked={reportReason === reason}
                onChange={(e) => setReportReason(e.target.value)}
                className="accent-yellow-500"
              />
              <span className="text-sm text-white">{reason}</span>
            </label>
          ))}
        </div>
      </ConfirmModal>

      {/* Toast Container */}
      <Toast />
    </div>
  );
}

export default Chat;
