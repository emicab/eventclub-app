import { QueryClient } from '@tanstack/react-query';

// Creamos una instancia global del cliente de TanStack Query.
// Podemos configurar opciones por defecto aquí si lo necesitamos.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Por ejemplo, podemos configurar el tiempo de caché o los reintentos.
      staleTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});
