// En src/hooks/useFriends.ts
import { useMutation } from '@tanstack/react-query';
import * as api from '@/src/api/friends';
import { queryClient } from '../lib/queryClient';

// Hook para aceptar una solicitud de amistad
export const useAcceptFriendRequest = () => {
  return useMutation({
    mutationFn: (requesterId: string) => api.acceptFriendRequest(requesterId),
    onSuccess: () => {
      // Cuando aceptamos, la lista de amigos y de solicitudes cambian.
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    },
  });
};

// Hook para rechazar una solicitud o eliminar un amigo
export const useRemoveFriendship = () => {

    return useMutation({
      mutationFn: (friendId: string) => api.removeFriendship(friendId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['friends'] });
        queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      },
    });
  };