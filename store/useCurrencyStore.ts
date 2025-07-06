// src/store/useCurrencyStore.ts

import { create } from 'zustand';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import Constants from 'expo-constants';

interface ExchangeRateResponse {
  result: string;
  conversion_rates: Record<string, number>;
}

type CurrencyState = {
  selectedCurrency: string;
  rates: Record<string, number>;
  isLoadingRates: boolean;
  setCurrency: (currency: string) => void;
  fetchRates: () => Promise<void>;
  convertPrice: (priceUSD: number) => number;
};

const API_KEY = Constants.expoConfig?.extra?.apiExchange;

const countryToCurrency: Record<string, string> = {
  Argentina: 'ARS',
    "EE.UU": 'USD',
    Brasil: 'BRL',
    Chile: 'CLP',
    Uruguay: 'UYU',
    México: 'MXN',
    Colombia: 'COP',
    Perú: 'PEN',
    España: 'EUR',
    France: 'EUR',
    Germany: 'EUR',
};

const fetchExchangeRates = async (): Promise<Record<string, number>> => {
  if (!API_KEY) {
    console.warn('API Key de ExchangeRate no encontrada. Usando datos de ejemplo.');
    return { USD: 1, EUR: 0.92, ARS: 1250.75 };
  }

  try {
    const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
    const data: ExchangeRateResponse = await response.json();
    if (data.result === 'success') {
      return data.conversion_rates;
    }
    console.log("data exchange:: ", data)
    return { USD: 1 };
  } catch (error) {
    console.error("Error al obtener tasas de cambio:", error);
    return { USD: 1 };
  }
};

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  selectedCurrency: 'USD',
  rates: { USD: 1 },
  isLoadingRates: true,
  setCurrency: (currency) => set({ selectedCurrency: currency }),
  fetchRates: async () => {
    try {
      set({ isLoadingRates: true });

      // Pedir permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permiso de ubicación denegado');
        set({ isLoadingRates: false });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(location.coords);
      const countryCode = geo?.[0]?.isoCountryCode || Localization?.region;

      const currency = countryToCurrency[countryCode] || 'USD';
      const rates = await fetchExchangeRates();

      set({
        selectedCurrency: rates[currency] ? currency : 'ARS',
        rates,
        isLoadingRates: false,
      });
    } catch (error) {
      console.error("Error al detectar ubicación o cargar tasas:", error);
      set({ isLoadingRates: false });
    }
  },
  convertPrice: (priceUSD: number) => {
    const { rates, selectedCurrency } = get();
    const rate = rates[selectedCurrency] || 1;
    return priceUSD * rate;
  },
}));
