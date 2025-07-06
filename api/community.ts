// --- Crear este nuevo archivo: src/api/community.ts ---
import apiClient from '@/src/lib/axios';
import { Channel, Post } from '@/src/types'; // Asegúrate de que tus tipos estén centralizados

/**
 * Obtiene la lista de canales disponibles desde la API.
 */
export const fetchChannels = async (): Promise<Channel[]> => {
  const { data } = await apiClient.get('/api/channels');
  return data;
};


/**
 * Obtiene los posts filtrados por el slug de un canal.
 */
export const fetchPostsByChannel = async (slug: string): Promise<Post[]> => {
  // El backend filtrará por slug. Si el slug es "todos", el backend debería devolver todos los posts.
  const { data } = await apiClient.get(`/api/posts?channelSlug=${slug}`);
  return data;
};
