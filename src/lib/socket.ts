import { io } from 'socket.io-client';

// Creamos y exportamos una única instancia del socket para toda la app.
export const socket = io(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001');
