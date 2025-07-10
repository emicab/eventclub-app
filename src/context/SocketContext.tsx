// En src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import Constants from 'expo-constants';
import { queryClient } from '../lib/queryClient';

const SocketContext = createContext<Socket | null>(null);

// Este es el hook que nuestros componentes usarán para acceder al socket.
export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { token } = useAuthStore(); // Obtenemos el token del usuario logueado

    useEffect(() => {
        if (token) {
            // Si tenemos un token, creamos y conectamos el socket.
            const newSocket = io(Constants.expoConfig?.extra?.apiUrl as string);

            newSocket.on('connect', () => {
                // Una vez conectado, nos autenticamos.
                newSocket.emit('authenticate', token);
            });

            newSocket.on('friendship_updated', () => {
                console.log('✅ Notificación de amistad recibida. Invalidando queries...');
                // Invalidamos todas las queries relacionadas con amigos.
                // Esto forzará a la app a obtener los datos más recientes.
                queryClient.invalidateQueries({ queryKey: ['friends'] });
                queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
                // También invalidamos los estados de amistad de perfiles individuales.
                queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
            });

            setSocket(newSocket);

            // Al desmontar el provider (ej. al hacer logout), nos desconectamos.
            return () => {
                newSocket.disconnect();
            };
        } else {
            // Si no hay token (logout), nos aseguramos de que el socket esté desconectado y nulo.
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [token]); // Este efecto se re-ejecuta cada vez que el token cambia (login/logout)

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};