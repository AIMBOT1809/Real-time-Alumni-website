import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sendConnectionRequest, getOutgoingRequests, getConversations } from '../services/chatApi';
import { useNavigate } from 'react-router';

interface ConnectionButtonProps {
  alumniId: string;
}

export function ConnectionButton({ alumniId }: ConnectionButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'connect' | 'pending' | 'message'>('connect');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStatus() {
      if (!user) return;
      try {
        // 1. Check if there's an active conversation (meaning accepted)
        const convos = await getConversations(user.id);
        const hasConvo = convos.some((c: any) => c.participants.includes(alumniId));
        if (hasConvo) {
          setStatus('message');
          setLoading(false);
          return;
        }

        // 2. Check if there's a pending request
        const outReqs = await getOutgoingRequests(user.id);
        const isPending = outReqs.some((r: any) => r.receiver_id === alumniId && r.status === 'pending');
        if (isPending) {
          setStatus('pending');
        } else {
          setStatus('connect');
        }
      } catch (err) {
        console.error('Error checking connection status:', err);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [user, alumniId]);

  const handleConnect = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await sendConnectionRequest(user.id, alumniId);
      setStatus('pending');
    } catch (err) {
      console.error('Failed to send request:', err);
      setStatus('connect'); // Revert on failure
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    navigate('/chat');
  };

  if (loading) {
    return (
      <button disabled className="w-full mt-4 bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg opacity-50 cursor-not-allowed">
        Loading...
      </button>
    );
  }

  if (status === 'message') {
    return (
      <button onClick={handleMessage} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
        Message
      </button>
    );
  }

  if (status === 'pending') {
    return (
      <button disabled className="w-full mt-4 bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg opacity-70 cursor-not-allowed">
        Pending Request
      </button>
    );
  }

  // default: connect
  return (
    <button onClick={handleConnect} className="w-full mt-4 bg-[#FFD700] hover:bg-yellow-400 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors">
      Connect
    </button>
  );
}
