// --- Crear este nuevo archivo: src/hooks/useInitializeApp.ts ---
import { useEffect, useState } from 'react';
import { useCurrencyStore } from '../store/useCurrencyStore';

export const useInitializeApp = () => {
  const { fetchRates, isLoadingRates } = useCurrencyStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      await fetchRates();
      // Podríamos añadir otras tareas de inicialización aquí en el futuro
      setIsInitialized(true);
    };

    initialize();
  }, [fetchRates]);

  // Devolvemos un booleano que nos dice si la app está lista
  return !isLoadingRates && isInitialized;
};
