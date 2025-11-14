import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---- TYPES ----
type CurrencyState = {
  displayCurrency: string; // Moneda elegida por el usuario (ej: "USD", "ARS")
  rates: Record<string, number>; // Tasas de conversión (base USD por defecto)
  setRates: (rates: Record<string, number>) => void;
  setDisplayCurrency: (currency: string) => void;
  getRate: (currency: string) => number;
  
};

// ---- STORE PRINCIPAL ----
export const useCurrencyStore = create(
  persist<CurrencyState>(
    (set, get) => ({
      displayCurrency: 'USD', // Valor por defecto
      rates: { USD: 1 },

      setRates: (rates) => set({ rates }),

      setDisplayCurrency: (currency) => {
        // Validamos formato ISO: 3 letras mayúsculas
        if (!/^[A-Z]{3}$/.test(currency)) return;
        set({ displayCurrency: currency.toUpperCase() });
      },

      getRate: (currency) => {
        const rates = get().rates;
        return rates[currency] ?? 1;
      },
    }),
    {
      name: 'currency-preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // @ts-ignore
      partialize: (state) => ({ displayCurrency: state.displayCurrency }), // Guardamos solo la moneda elegida
    }
  )
);

// ---- HELPER: ACTUALIZAR TASAS DE CAMBIO ----
// Podés llamarlo desde tu hook useInitializeCurrency o al iniciar la app.
export const fetchRates = async () => {
  const { setRates } = useCurrencyStore.getState();
  try {
    console.log('🌐 Actualizando tasas de cambio...');
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    if (data?.rates) {
      setRates(data.rates);
      console.log('✅ Tasas actualizadas correctamente.');
    }
  } catch (err) {
    console.error('❌ Error al obtener tasas de cambio:', err);
  }
};

// ---- HELPER: FORMATEADOR DE PRECIOS ----
export const useCurrencyFormatter = () => {
  const { displayCurrency, getRate } = useCurrencyStore();

  /**
   * Convierte un precio en USD al valor y formato de la moneda del usuario.
   * @param amount Monto en USD (base)
   * @returns string formateado según el país y moneda actual
   */
  const formatPrice = (amount: number) => {
    const rate = getRate(displayCurrency);
    const converted = amount * rate;

    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: displayCurrency,
        minimumFractionDigits: 0,
      }).format(converted);
    } catch {
      // fallback si Intl no soporta esa moneda
      return `${displayCurrency} ${converted.toFixed(2)}`;
    }
  };

  return { formatPrice, displayCurrency };
};

// ---- HELPER: FORMATEADOR DE PRECIOS ORIGINALES ----
export const useOriginalCurrencyFormatter = () => {
  // Retorna una función para formatear el precio sin conversión
  const formatOriginalPrice = (amountInCents: number, currency: string) => {
      const amount = amountInCents / 100;
      try {
          // Usamos 'undefined' para la localización y que tome la del dispositivo
          return new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 2,
          }).format(amount);
      } catch {
          return `${currency} ${amount.toFixed(2)}`;
      }
  };
  return { formatOriginalPrice };
};