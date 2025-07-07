// En src/api/friends.ts
import apiClient from '../lib/axios';
import { UserProfile } from '../types'; // Asumo que tienes este tipo

// Obtener la lista de amigos aceptados
export const getFriends = async (): Promise<UserProfile[]> => {
  const { data } = await apiClient.get('/api/friends');
  return data;
};

// Obtener las solicitudes pendientes que he recibido
export const getPendingRequests = async () => {
  const { data } = await apiClient.get('/api/friends/requests');
  return data;
};

// Enviar una solicitud de amistad
export const sendFriendRequest = async (addresseeId: string) => {
  const { data } = await apiClient.post(`/api/friends/request/${addresseeId}`);
  return data;
};

// Aceptar una solicitud de amistad
export const acceptFriendRequest = async (requesterId: string) => {
  const { data } = await apiClient.put(`/api/friends/accept/${requesterId}`);
  return data;
};

// Rechazar una solicitud o eliminar a un amigo
export const removeFriendship = async (friendId: string) => {
  const { data } = await apiClient.delete(`/api/friends/${friendId}`);
  return data;
};