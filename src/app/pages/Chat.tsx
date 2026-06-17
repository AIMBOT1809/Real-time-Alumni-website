import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Edit, Phone, Video, Info, Smile, Image, Heart, X, ArrowLeft, MessageCircle, Mic, MicOff, VideoOff, PhoneOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../../supabaseClient';

interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

interface FollowRequest {
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

export function Chat({ theme = 'dark' }: { theme?: 'dark' | 'light' }) {
  const { user, getAlumniById, alumni } = useAuth();

  const [activeTab, setActiveTab] = useState<'messages' | 'people'>('messages');
  const [chats, setChats] = useState<{ chat_id: string; otherUserId: string; lastMessage?: any; unreadCount: number }[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const activeConvoIdRef = useRef<string | null>(null);
  
  useEffect(() => { activeConvoIdRef.current = activeConvoId; }, [activeConvoId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // WebRTC States
  const [callState, setCallState] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
  const [callType, setCallType] = useState<'audio' | 'video'>('video');
  const [callPartnerId, setCallPartnerId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const channelRef = useRef<any>(null);

  const stateRef = useRef({ callState, callPartnerId });
  useEffect(() => { stateRef.current = { callState, callPartnerId }; }, [callState, callPartnerId]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("follow_requests")
      .select("*")
      .eq("receiver_id", user.id)
      .eq("status", "pending");
    if (data) setRequests(data);
  };

  const loadChats = async () => {
    if (!user) return;
    const { data: myMemberships } = await supabase
      .from("chat_members")
      .select('chat_id')
      .eq("user_id", user.id);
      
    if (myMemberships && myMemberships.length > 0) {
      const chatIds = myMemberships.map(m => m.chat_id);
      
      if (chatIds.length > 0) {
        const { data: allMembers } = await supabase
          .from('chat_members')
          .select('chat_id, user_id')
          .in('chat_id', chatIds)
          .neq('user_id', user.id);
          
        if (allMembers) {
          setChats(allMembers.map(m => ({
            chat_id: m.chat_id,
            otherUserId: m.user_id,
            unreadCount: 0
          })));
        }
      }
    } else {
      setChats([]);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadRequests();
    loadChats();

    const handleWebRTCSignal = async (payload: any) => {
      if (!user || payload.targetId !== user.id) return;
      const { senderId, type, data } = payload;
      const { callState: currentCallState, callPartnerId: currentCallPartnerId } = stateRef.current;

      if (type === 'call-invite') {
        if (currentCallState !== 'idle') {
          if (channelRef.current) {
            channelRef.current.send({
              type: 'broadcast', event: 'webrtc-signal',
              payload: { targetId: senderId, senderId: user.id, type: 'call-end', data: { reason: 'busy' } }
            });
          }
          return;
        }
        setCallType(data.isVideo ? 'video' : 'audio');
        setCallPartnerId(senderId);
        setCallState('ringing');
      }
      else if (type === 'call-accept') {
        if (currentCallState === 'calling' && currentCallPartnerId === senderId) {
          const pc = setupPeerConnection(senderId);
          setCallState('connected');
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (channelRef.current) {
            channelRef.current.send({ type: 'broadcast', event: 'webrtc-signal', payload: { targetId: senderId, senderId: user.id, type: 'offer', data: offer } });
          }
        }
      }
      else if (type === 'offer') {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          if (channelRef.current) {
            channelRef.current.send({ type: 'broadcast', event: 'webrtc-signal', payload: { targetId: senderId, senderId: user.id, type: 'answer', data: answer } });
          }
        }
      }
      else if (type === 'answer') {
        if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(data));
      }
      else if (type === 'ice-candidate') {
        if (pcRef.current) {
          try { await pcRef.current.addIceCandidate(new RTCIceCandidate(data)); } 
          catch (e) { console.error("Error adding ice candidate", e); }
        }
      }
      else if (type === 'call-end') {
        cleanupCall();
      }
    };

    const channel = supabase
      .channel("chat-room")
      .on("broadcast", { event: "webrtc-signal" }, (payload) => {
        handleWebRTCSignal(payload.payload);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.chat_id === activeConvoIdRef.current) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "follow_requests", filter: `receiver_id=eq.${user.id}` }, (payload) => {
        if (payload.new.status === 'pending') {
          setRequests(prev => {
            if (prev.find(r => r.id === payload.new.id)) return prev;
            return [...prev, payload.new as FollowRequest];
          });
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "follow_requests" }, (payload) => {
        if (payload.new.sender_id === user.id || payload.new.receiver_id === user.id) {
           loadChats();
           if (payload.new.receiver_id === user.id) {
               loadRequests();
           }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [user]);

  const sendSignal = async (targetId: string, type: string, data: any) => {
    if (!channelRef.current || !user) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: { targetId, senderId: user.id, type, data }
    });
  };

  const startCall = async (targetId: string, isVideo: boolean) => {
    try {
      setCallType(isVideo ? 'video' : 'audio');
      setCallState('calling');
      setCallPartnerId(targetId);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      await sendSignal(targetId, 'call-invite', { isVideo });
    } catch (err) {
      console.error("Error accessing media devices.", err);
      alert("Could not access camera/microphone.");
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!callPartnerId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      
      setupPeerConnection(callPartnerId);
      await sendSignal(callPartnerId, 'call-accept', {});
      setCallState('connected');
    } catch (err) {
      console.error("Error accessing media devices.", err);
      endCall();
    }
  };

  const cleanupCall = () => {
    setCallState('idle');
    setCallPartnerId(null);
    setIsMuted(false);
    setIsVideoOff(false);
    if (pcRef.current) { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(t => t.stop()); localStreamRef.current = null; }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  const endCall = async () => {
    if (callPartnerId) await sendSignal(callPartnerId, 'call-end', {});
    cleanupCall();
  };

  const setupPeerConnection = (targetId: string) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) sendSignal(targetId, 'ice-candidate', e.candidate);
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => pc.addTrack(t, localStreamRef.current!));
    }
    return pc;
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    if (!activeConvoId) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', activeConvoId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    loadMessages();
  }, [activeConvoId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !user || !activeConvoId) return;
    const messageText = input.trim();
    setInput('');
    
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [...prev, { id: tempId, chat_id: activeConvoId, sender_id: user.id, content: messageText, created_at: new Date().toISOString() }]);

    await supabase
      .from("messages")
      .insert({
        chat_id: activeConvoId,
        sender_id: user.id,
        content: messageText
      });
      
    inputRef.current?.focus();
  };

  const handleStartChat = async (targetId: string) => {
    if (!user || isSendingRequest) return;
    
    const existing = chats.find(c => c.otherUserId === targetId);
    if (existing) {
      setActiveConvoId(existing.chat_id);
      setActiveTab('messages');
      return;
    }
    
    setIsSendingRequest(true);
    try {
      const { data: existingReqs } = await supabase
        .from("follow_requests")
        .select("*")
        .eq("sender_id", user.id)
        .eq("receiver_id", targetId)
        .eq("status", "pending");
        
      if (existingReqs && existingReqs.length > 0) {
        alert("Request already sent and pending.");
        return;
      }

      const { error } = await supabase
        .from("follow_requests")
        .insert({
          sender_id: user.id,
          receiver_id: targetId
        });

      if (!error) {
        alert("Request Sent");
      } else {
        alert("Error sending request");
      }
    } finally {
      setIsSendingRequest(false);
    }
  };

  const acceptRequest = async (request: FollowRequest) => {
    try {
      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .insert({})
        .select()
        .single();
        
      if (chatError || !chat) throw chatError;

      await supabase
        .from("chat_members")
        .insert([
          { chat_id: chat.id, user_id: request.sender_id },
          { chat_id: chat.id, user_id: request.receiver_id }
        ]);

      await supabase
        .from("follow_requests")
        .update({ status: "accepted" })
        .eq("id", request.id);
        
      loadRequests();
      loadChats();
      setActiveConvoId(chat.id);
      setActiveTab('messages');
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };
  
  const declineRequest = async (request: FollowRequest) => {
    try {
      await supabase
        .from("follow_requests")
        .update({ status: "declined" })
        .eq("id", request.id);
      loadRequests();
    } catch (err) {
      console.error("Error declining request:", err);
    }
  };

  if (!user) return null;

  const totalUnread = chats.reduce((acc, c) => acc + c.unreadCount, 0);
  const filteredPeople = alumni
    .filter((u: any) => u.id !== user.id)
    .filter((u: any) => searchQuery ? u.name.toLowerCase().includes(searchQuery.toLowerCase()) || (u.department || '').toLowerCase().includes(searchQuery.toLowerCase()) : true);

  const activeConvo = chats.find(c => c.chat_id === activeConvoId);
  const otherUserId = activeConvo?.otherUserId;
  const otherUser = otherUserId ? getAlumniById(otherUserId) : null;

  return (
    <>
      <style>{`
        :root {
          --ig-bg: ${theme === 'dark' ? '#000' : '#fff'};
          --ig-sidebar-bg: ${theme === 'dark' ? '#000' : '#fff'};
          --ig-border: ${theme === 'dark' ? '#262626' : '#dbdbdb'};
          --ig-text: ${theme === 'dark' ? '#f5f5f5' : '#000'};
          --ig-muted: #737373;
          --ig-accent: ${theme === 'dark' ? '#1a1a1a' : '#efefef'};
          --ig-hover: ${theme === 'dark' ? '#161616' : '#fafafa'};
          --ig-active: ${theme === 'dark' ? '#1c1c1c' : '#efefef'};
          --ig-bubble-me: #0095f6;
          --ig-bubble-them: ${theme === 'dark' ? '#262626' : '#efefef'};
          --ig-gold: #FFD700;
          --ig-online: #22c55e;
        }
        .ig-root { display:flex; height:calc(100vh - 64px); background:var(--ig-bg); color:var(--ig-text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; overflow:hidden; }
        
        .ig-sidebar { width:360px; flex-shrink:0; display:flex; flex-direction:column; border-right:1px solid var(--ig-border); height:100%; background:var(--ig-sidebar-bg); }
        .ig-sidebar-header { padding:16px 20px 12px; display:flex; align-items:center; justify-content:space-between; }
        .ig-sidebar-title { font-size:16px; font-weight:700; color:var(--ig-text); display:flex; align-items:center; gap:8px; }
        .ig-tab-bar { display:flex; border-bottom:1px solid var(--ig-border); }
        .ig-tab { flex:1; padding:14px 0; background:none; border:none; border-bottom:2px solid transparent; color:var(--ig-muted); font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; }
        .ig-tab.active { color:var(--ig-text); border-bottom-color:var(--ig-text); }
        .ig-search-wrap { padding:8px 16px; }
        .ig-search-box { display:flex; align-items:center; gap:8px; background:var(--ig-accent); border-radius:10px; padding:8px 12px; }
        .ig-search-input { flex:1; background:none; border:none; outline:none; color:var(--ig-text); font-size:14px; }
        .ig-search-input::placeholder { color:var(--ig-muted); }
        
        .ig-list { flex:1; overflow-y:auto; }
        .ig-list::-webkit-scrollbar { width:0; }
        .ig-convo-row { width:100%; display:flex; align-items:center; gap:12px; padding:10px 16px; background:transparent; border:none; cursor:pointer; text-align:left; transition:background 0.15s; }
        .ig-convo-row:hover { background:var(--ig-hover); }
        .ig-convo-row.active { background:var(--ig-active); }
        .ig-convo-info { flex:1; min-width:0; }
        .ig-convo-name { font-size:14px; color:var(--ig-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ig-convo-name.bold { font-weight:700; }
        .ig-convo-sub { font-size:13px; color:var(--ig-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
        .ig-convo-sub.bold { color:var(--ig-text); font-weight:500; }
        .ig-convo-time { font-size:12px; color:var(--ig-muted); flex-shrink:0; }
        .ig-unread-dot { width:8px; height:8px; border-radius:50%; background:#0095f6; flex-shrink:0; }
        
        .ig-section-header { padding:10px 16px 6px; font-size:12px; font-weight:700; color:var(--ig-muted); text-transform:uppercase; letter-spacing:0.08em; }
        .ig-people-row { width:100%; display:flex; align-items:center; gap:12px; padding:10px 16px; background:transparent; border:none; cursor:pointer; text-align:left; transition:background 0.15s; }
        .ig-people-row:hover { background:var(--ig-hover); }
        .ig-person-name { font-size:14px; color:var(--ig-text); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .ig-person-sub { font-size:12px; color:var(--ig-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
        .ig-chat-btn { padding:5px 14px; background:#0095f6; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; flex-shrink:0; transition:background 0.2s; }
        .ig-chat-btn:hover { background:#1aa0f8; }
        .ig-chat-btn.connected { background:transparent; color:#0095f6; border:1px solid #0095f6; }
        
        .ig-chat-pane { flex:1; display:flex; flex-direction:column; height:100%; min-width:0; background:var(--ig-bg); }
        .ig-chat-header { height:60px; padding:0 16px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--ig-border); flex-shrink:0; }
        .ig-chat-header-left { display:flex; align-items:center; gap:12px; }
        .ig-chat-header-name { font-size:15px; font-weight:700; color:var(--ig-text); }
        .ig-chat-header-status { font-size:12px; color:var(--ig-muted); margin-top:1px; }
        .ig-chat-actions { display:flex; gap:4px; }
        .ig-icon-btn { background:none; border:none; cursor:pointer; color:var(--ig-text); display:flex; align-items:center; justify-content:center; padding:8px; border-radius:50%; transition:background 0.15s; }
        .ig-icon-btn:hover { background:var(--ig-hover); }
        
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
        
        .ig-input-area { padding:12px 16px; border-top:1px solid var(--ig-border); flex-shrink:0; }
        .ig-input-box { display:flex; align-items:center; gap:10px; background:var(--ig-bg); border-radius:24px; padding:8px 8px 8px 16px; border:1px solid var(--ig-border); transition:border-color 0.2s; }
        .ig-input-box:focus-within { border-color:#555; }
        .ig-msg-input { flex:1; background:none; border:none; outline:none; color:var(--ig-text); font-size:15px; }
        .ig-msg-input::placeholder { color:var(--ig-muted); }
        .ig-send-btn { background:none; border:none; cursor:pointer; color:#0095f6; font-size:14px; font-weight:700; padding:0 8px; }
        
        .ig-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; color:var(--ig-muted); gap:12px; padding:20px; }
        .ig-empty-icon { width:96px; height:96px; border:2px solid #333; border-radius:50%; display:flex; align-items:center; justify-content:center; }
        .ig-empty-title { font-size:20px; font-weight:500; color:var(--ig-text); }
        
        .ig-req-row { display:flex; align-items:center; gap:12px; padding:12px 16px; border-bottom:1px solid var(--ig-border); }
        .ig-req-actions { display:flex; gap:8px; }
        .ig-req-accept { padding:6px 14px; background:#0095f6; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
        .ig-req-decline { padding:6px 14px; background:var(--ig-accent); color:var(--ig-text); border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; }
        
        .ig-call-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:#111; z-index:50; display:flex; flex-direction:column; color:#fff; }
        .ig-call-video { flex:1; width:100%; object-fit:cover; background:#000; }
        .ig-call-pip { position:absolute; top:20px; right:20px; width:120px; height:160px; background:#000; border-radius:12px; overflow:hidden; border:2px solid #333; z-index:51; box-shadow:0 4px 12px rgba(0,0,0,0.5); }
        .ig-call-pip video { width:100%; height:100%; object-fit:cover; }
        .ig-call-controls { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); display:flex; gap:20px; z-index:52; }
        .ig-call-btn { width:56px; height:56px; border-radius:50%; border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; transition:all 0.2s; }
        .ig-call-btn.hangup { background:#ef4444; }
        .ig-call-btn.hangup:hover { background:#dc2626; }
        .ig-call-btn.normal { background:rgba(255,255,255,0.2); backdrop-filter:blur(10px); }
        .ig-call-btn.normal:hover { background:rgba(255,255,255,0.3); }
        .ig-call-btn.off { background:#fff; color:#000; }

        .ig-incoming { position:absolute; top:20px; left:50%; transform:translateX(-50%); background:#262626; padding:16px 24px; border-radius:16px; display:flex; align-items:center; gap:16px; z-index:60; box-shadow:0 10px 25px rgba(0,0,0,0.5); border:1px solid #333; }
        .ig-incoming-btns { display:flex; gap:12px; }
        .ig-inc-btn { padding:8px 16px; border-radius:8px; font-weight:600; font-size:14px; cursor:pointer; border:none; color:#fff; }
        .ig-inc-accept { background:#22c55e; }
        .ig-inc-decline { background:#ef4444; }

        @media (max-width: 768px) {
          .ig-sidebar { width:100%; position:absolute; z-index:10; }
          .ig-chat-pane { position:absolute; width:100%; left:100%; transition:left 0.3s ease; }
          .ig-chat-pane.mobile-open { left:0; }
        }
      `}</style>

      <div className="ig-root">
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
            {activeTab === 'messages' && (
              <>
                {requests.length > 0 && (
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--ig-border)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0095f6', marginBottom: 8 }}>
                      Follow Requests ({requests.length})
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
                            <button className="ig-req-accept" onClick={() => acceptRequest(req)}>Accept</button>
                            <button className="ig-req-decline" onClick={() => declineRequest(req)}>Decline</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {chats
                  .filter(c => {
                    if (!searchQuery) return true;
                    const other = getAlumniById(c.otherUserId);
                    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
                  })
                  .map(convo => {
                    const other = getAlumniById(convo.otherUserId);
                    if (!other) return null;
                    const isUnread = convo.unreadCount > 0;
                    const lastText = convo.lastMessage?.content || 'Say hi!';
                    return (
                      <button
                        key={convo.chat_id}
                        className={`ig-convo-row ${activeConvoId === convo.chat_id ? 'active' : ''}`}
                        onClick={() => setActiveConvoId(convo.chat_id)}
                      >
                        <Avatar src={other.avatar} name={other.name} size={56} online={onlineUsers.has(other.id)} />
                        <div className="ig-convo-info">
                          <div className={`ig-convo-name ${isUnread ? 'bold' : ''}`}>{other.name}</div>
                          <div className={`ig-convo-sub ${isUnread ? 'bold' : ''}`}>
                            {lastText}
                          </div>
                        </div>
                        {isUnread && <span className="ig-unread-dot" />}
                      </button>
                    );
                  })}

                {chats.length === 0 && (
                  <div style={{ padding: '32px 20px', textAlign: 'center', color: '#737373' }}>
                    <MessageCircle size={36} style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontWeight: 600, color: '#f5f5f5', marginBottom: 4 }}>No messages yet</div>
                    <div style={{ fontSize: 13 }}>Go to "People" tab to start chatting!</div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'people' && (
              <>
                <div className="ig-section-header">All Registered Members</div>
                {filteredPeople.length === 0 && (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#737373', fontSize: 14 }}>
                    No people found
                  </div>
                )}
                {filteredPeople.map((person: any) => {
                  const hasConvo = chats.some(c => c.otherUserId === person.id);
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
                      </div>
                      <button
                        className={`ig-chat-btn ${hasConvo ? 'connected' : ''}`}
                        onClick={e => { e.stopPropagation(); handleStartChat(person.id); }}
                        disabled={isSendingRequest}
                      >
                        {hasConvo ? 'Open' : 'Follow'}
                      </button>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <div className={`ig-chat-pane${activeConvoId ? ' mobile-open' : ''}`}>
          {activeConvoId && activeConvo ? (
            <>
              <div className="ig-chat-header">
                <div className="ig-chat-header-left">
                  <button className="ig-icon-btn" style={{ marginRight: 4 }} onClick={() => setActiveConvoId(null)}>
                    <ArrowLeft size={20} />
                  </button>
                  <Avatar src={otherUser?.avatar} name={otherUser?.name} size={40} online={otherUserId ? onlineUsers.has(otherUserId) : false} />
                  <div>
                    <div className="ig-chat-header-name">{otherUser?.name || 'Unknown User'}</div>
                    <div className="ig-chat-header-status">
                      {otherUser?.department || 'Offline'}
                    </div>
                  </div>
                </div>
                <div className="ig-chat-actions">
                  <button className="ig-icon-btn"><Info size={20} /></button>
                </div>
              </div>

              {messages.length === 0 && (
                <div style={{ padding: '40px 20px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid var(--ig-border)' }}>
                  <Avatar src={otherUser?.avatar} name={otherUser?.name} size={80} />
                  <div style={{ marginTop: 12, fontWeight: 700, fontSize: 18, color: '#f5f5f5' }}>{otherUser?.name}</div>
                  {otherUser?.department && <div style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>{otherUser.department}{otherUser.year ? ` · ${otherUser.year}` : ''}</div>}
                  <div style={{ fontSize: 13, color: '#737373', marginTop: 8 }}>
                    Connected via Alumni Network
                  </div>
                </div>
              )}

              <div className="ig-messages">
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === user.id;
                  const showAvatar = !isMe && (i === messages.length - 1 || messages[i + 1]?.sender_id !== msg.sender_id);
                  const showTime = i === messages.length - 1 ||
                    (messages[i + 1] && (new Date(messages[i + 1].created_at).getTime() - new Date(msg.created_at).getTime()) > 5 * 60 * 1000);
                  const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div key={msg.id || i}>
                      <div className={`ig-msg-row ${isMe ? 'ig-msg-me' : 'ig-msg-them'}`}>
                        {!isMe && (
                          <div style={{ width: 28, flexShrink: 0 }}>
                            {showAvatar && <Avatar src={otherUser?.avatar} name={otherUser?.name} size={24} />}
                          </div>
                        )}
                        <div>
                          <div className={`ig-bubble ${isMe ? 'ig-bubble-me' : 'ig-bubble-them'}`}>
                            {msg.content}
                          </div>
                          {showTime && (
                            <div className={`ig-msg-time ${isMe ? 'ig-time-right' : 'ig-time-left'}`}>{time}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <div className="ig-input-area">
                <div className="ig-input-box">
                  <button className="ig-icon-btn" style={{ padding: 4 }}><Smile size={22} /></button>
                  <input
                    ref={inputRef}
                    className="ig-msg-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
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
          
          {callState !== 'idle' && (
            <div className="ig-call-overlay">
              <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 51, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                {callState === 'calling' && <div style={{ fontSize: 20, fontWeight: 600 }}>Calling {getAlumniById(callPartnerId!)?.name}...</div>}
                {callState === 'connected' && <div style={{ fontSize: 20, fontWeight: 600 }}>In call with {getAlumniById(callPartnerId!)?.name}</div>}
              </div>

              {callType === 'video' && <video ref={remoteVideoRef} className="ig-call-video" autoPlay playsInline />}
              {callType === 'audio' && (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Avatar src={getAlumniById(callPartnerId!)?.avatar} name={getAlumniById(callPartnerId!)?.name} size={120} />
                   <audio ref={remoteVideoRef} autoPlay />
                </div>
              )}

              {(callState === 'connected' || callState === 'calling') && callType === 'video' && (
                <div className="ig-call-pip">
                  <video ref={localVideoRef} autoPlay playsInline muted />
                </div>
              )}

              <div className="ig-call-controls">
                <button className={`ig-call-btn ${isMuted ? 'off' : 'normal'}`} onClick={toggleMute}>
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                {callType === 'video' && (
                  <button className={`ig-call-btn ${isVideoOff ? 'off' : 'normal'}`} onClick={toggleVideo}>
                    {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                  </button>
                )}
                <button className="ig-call-btn hangup" onClick={endCall}>
                  <PhoneOff size={24} />
                </button>
              </div>
            </div>
          )}

          {callState === 'ringing' && callPartnerId && (
            <div className="ig-incoming">
               <Avatar src={getAlumniById(callPartnerId)?.avatar} name={getAlumniById(callPartnerId)?.name} size={48} />
               <div>
                 <div style={{ fontWeight: 600, color: '#fff', fontSize: 16 }}>{getAlumniById(callPartnerId)?.name}</div>
                 <div style={{ color: '#aaa', fontSize: 13 }}>Incoming {callType} call...</div>
               </div>
               <div className="ig-incoming-btns">
                 <button className="ig-inc-btn ig-inc-accept" onClick={acceptCall}>Accept</button>
                 <button className="ig-inc-btn ig-inc-decline" onClick={endCall}>Decline</button>
               </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}