import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/src/store/useAuthStore';

// 🧠 URL de tu backend (ngrok)
const API_URL = process.env.EXPO_PUBLIC_API_URL;

const socket = io(API_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 10,
  secure: true,
  rejectUnauthorized: false,
});

const SocketContext = createContext<{ socket: Socket | null }>({ socket: null });

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket conectado:', socket.id);
      if (token) socket.emit('authenticate', token);
    });

    socket.on('connect_error', (err) => {
      console.log('❌ Error de conexión:', err.message);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🔴 Socket desconectado');
    });

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
    };
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
