import apiClient  from '../lib/axios';
import { Conversation, Message } from '../types';

// Obtiene la lista de conversaciones del usuario
export const getConversations = async (): Promise<Conversation[]> => {
  const { data } = await apiClient.get('/api/conversations');
  return data;
};

// Obtiene los mensajes de una conversación
export const getMessages = async (conversationId: string): Promise<Message[]> => {
  const { data } = await apiClient.get(`/api/conversations/${conversationId}/messages`);
  return data;
};

// FUNCIÓN CLAVE: Encuentra o crea una conversación con un amigo
export const findOrCreateConversation = async (friendId: string): Promise<{ id: string }> => {
  // Necesitaremos crear este endpoint en el backend
  const { data } = await apiClient.post(`/api/conversations/find-or-create`, { friendId });
  return data; // Devolverá el ID de la conversación
};