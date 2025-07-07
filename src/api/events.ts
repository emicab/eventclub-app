import apiClient from '../lib/axios'; // Asumo que usas una instancia de axios centralizada como esta


/**
 * Llama al endpoint para dar o quitar "favorito" a un evento.
 * El token de autenticación se añade automáticamente por el interceptor de Axios.
 * @param eventId - El ID del evento al que se le dará like/unlike.
 */
export const toggleFavoriteEvent = async (eventId: string) => {
  const { data } = await apiClient.post(`/api/events/${eventId}/favorite`);
  return data; // Devuelve { favorited: boolean }
};

/**
 * Obtiene la lista de eventos que el usuario actual ha marcado como favoritos.
 */
export const getMyFavoriteEvents = async () => {
  const { data } = await apiClient.get('/api/users/me/favorite-events');
  return data; // Devuelve un array de objetos de Evento enriquecidos
};