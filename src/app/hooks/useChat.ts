import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000';

export function useChat(userId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Initialize Socket.IO connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on('connect', () => {
      console.log('[useChat] Socket connected:', socketRef.current?.id);
      setIsConnected(true);
      // Join user channel
      socketRef.current?.emit('join_user', userId);
    });

    socketRef.current.on('disconnect', () => {
      console.log('[useChat] Socket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('error', (error) => {
      console.error('[useChat] Socket error:', error);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [userId]);

  return {
    socket: socketRef.current,
    isConnected,
  };
}
