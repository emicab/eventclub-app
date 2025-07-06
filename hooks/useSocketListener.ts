import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { socket } from '../lib/socket';
import { useAuthStore } from '../store/useAuthStore';

// Un hook dedicado para manejar todos nuestros listeners de socket.
export const useSocketListeners = () => {
  const queryClient = useQueryClient();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      socket.emit('authenticate', token);
    }

    const onInteractionUpdate = (data: { postId: string }) => {
      // Cuando recibimos una actualización, invalidamos las queries relacionadas.
      // TanStack Query se encargará de volver a hacer el fetch si es necesario.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postDetails', data.postId] });
    };

    socket.on('interaction:update', onInteractionUpdate);

    return () => {
      socket.off('interaction:update', onInteractionUpdate);
    };
  }, [queryClient, token]);
};