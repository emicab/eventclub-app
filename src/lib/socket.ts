import { io } from 'socket.io-client';
const API_URL = process.env.EXPO_PUBLIC_API_URL;
export const socket = io(API_URL, {
  path: '/socket.io',
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  secure: true,
});

