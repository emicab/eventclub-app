import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/src/context/SocketContext';
import { useAuthStore } from '@/src/store/useAuthStore';

/**
 * Hook global que escucha eventos del socket.io
 * y actualiza automáticamente el estado de la app.
 */
export const useSocketListeners = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { token } = useAuthStore();

  useEffect(() => {
    if (!socket) return;

    console.log('🔌 SocketListeners montado');

    // Si hay token, autenticamos el socket
    if (token) {
      socket.emit('authenticate', token);
    }

    // 🧠 --- HANDLERS DE EVENTOS ---
    const handleInteractionUpdate = (data: { postId: string }) => {
      console.log('🟢 interaction:update recibido ->', data);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postDetails', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['comments', data.postId] });
    };

    const handleCommentNew = (data: any) => {
      console.log('💬 comment:new recibido ->', data);
      // Actualizamos solo el post correspondiente
      queryClient.invalidateQueries({ queryKey: ['comments', data.postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    };

    const handlePostDeleted = (data: { postId: string }) => {
      console.log('🗑️ post:deleted recibido ->', data);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    };

    const handleLikeUpdated = (data: { postId: string }) => {
      console.log('❤️ like:updated recibido ->', data);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['postDetails', data.postId] });
    };

    //actualizar cuando hay nuevo post
    const handleNewPosts = (data: { channelSlug: string }) => {
      console.log('🔔 post:new recibido ->', data);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }

    // 🧩 --- REGISTRO DE EVENTOS ---
    socket.on('interaction:update', handleInteractionUpdate);
    socket.on('comment:new', handleCommentNew);
    socket.on('post:deleted', handlePostDeleted);
    socket.on('like:updated', handleLikeUpdated);
    socket.on('post:new', handleNewPosts);


    console.log('🧠 Socket listeners ACTIVADOS');

    // 🧹 --- LIMPIEZA ---
    return () => {
      console.log('🔴 Socket listeners DESMONTADOS');
      socket.off('interaction:update', handleInteractionUpdate);
      socket.off('comment:new', handleCommentNew);
      socket.off('post:deleted', handlePostDeleted);
      socket.off('like:updated', handleLikeUpdated);
      socket.off('post:new', handleNewPosts);
    };
  }, [socket, token, queryClient]);
};
