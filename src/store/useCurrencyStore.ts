// En src/store/useCurrencyStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CurrencyState = {
  // La moneda que el usuario elige para VER los precios. Nombre unificado.
  displayCurrency: string; 
  rates: Record<string, number>;
  setRates: (rates: Record<string, number>) => void;
  setDisplayCurrency: (currency: string) => void;
};

export const useCurrencyStore = create(
  // Usamos el middleware 'persist' para guardar la preferencia del usuario
  persist<CurrencyState>(
    (set) => ({
      displayCurrency: 'USD', // Moneda por defecto segura mientras se detecta la real
      rates: { USD: 1 },
      setRates: (rates) => set({ rates }),
      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
    }),
    {
      name: 'currency-preferences-storage', // Nombre para el guardado en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage),
      // Solo guardamos la preferencia del usuario, no las tasas de cambio
      partialize: (state) => ({ displayCurrency: state.displayCurrency }),
    }
  )
);