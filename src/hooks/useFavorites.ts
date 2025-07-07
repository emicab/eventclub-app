import { useMutation } from '@tanstack/react-query';
import { toggleFavoriteEvent } from '../api/events'; // Importamos la función de la capa de API
import { queryClient } from '../lib/queryClient';

export const useToggleFavorite = () => {

  return useMutation({
    mutationFn: (eventId: string) => toggleFavoriteEvent(eventId),
    onSuccess: () => {
      // Cuando el "like" es exitoso, le decimos a TanStack Query
      // que los datos de estas "queries" están desactualizados.
      // Automáticamente, volverá a pedirlos y la UI se actualizará sola.
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteEvents'] });
      // También invalidamos el detalle del evento por si el usuario está en esa pantalla
      queryClient.invalidateQueries({ queryKey: ['eventDetails'] });
    },
    // Opcional: Puedes añadir lógica onError para mostrar un toast de error al usuario.
  });
};