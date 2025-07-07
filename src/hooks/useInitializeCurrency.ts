// En src/hooks/useInitializeCurrency.ts
import { useEffect } from 'react';
import * as Location from 'expo-location';
import * as Localization from 'expo-localization';
import { useCurrencyStore } from '../store/useCurrencyStore';
import Constants from 'expo-constants';
import { countryToCurrency } from '../utils/countryToCurrency';

const API_KEY = Constants.expoConfig?.extra?.apiExchange;

const fetchExchangeRates = async (): Promise<Record<string, number>> => {
    console.log("1. Buscando tasas de cambio...");
    if (!API_KEY) {
        console.log("   -> No hay API Key. Usando datos de ejemplo.");
        return { USD: 1, EUR: 0.92, ARS: 1250.75 };
    }
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`);
        const data = await response.json();
        if (data.result === 'success') {
            console.log("   -> Tasas obtenidas correctamente.");
            return data.conversion_rates;
        }
        console.warn("   -> La API de tasas de cambio no devolvió 'success'.");
        return { USD: 1 };
    } catch (error) {
        console.error("   -> Error crítico al buscar tasas:", error);
        return { USD: 1 };
    }
};

export const useInitializeCurrency = () => {
  const { setDisplayCurrency, setRates } = useCurrencyStore();

  useEffect(() => {
    const initialize = async () => {
      console.log("--- INICIANDO DETECCIÓN DE MONEDA ---");
      try {
        const rates = await fetchExchangeRates();
        setRates(rates);

        let detectedCurrency: string | null = null;

        // Plan A: Intentar por GPS
        console.log("2. Plan A: Intentando por GPS (puede fallar en emulador)");
        const { status } = await Location.requestForegroundPermissionsAsync();
        console.log(`   -> Permiso de ubicación: ${status}`);
        
        if (status === 'granted') {
          try {
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const geo = await Location.reverseGeocodeAsync(location.coords);
            const countryCode = geo?.[0]?.isoCountryCode;
            console.log(`   -> País detectado por GPS: ${countryCode}`);
            if (countryCode) {
              detectedCurrency = countryToCurrency[countryCode];
            }
          } catch (geocodeError) {
            // Este es el error que viste. Ahora lo manejamos sin romper todo.
            console.warn("   -> Falló la geocodificación inversa. Pasando al Plan B.");
          }
        }
        
        // Plan B: Fallback a la configuración del dispositivo
        if (!detectedCurrency) {
          console.log("3. Plan B: Usando configuración regional del dispositivo.");
          const deviceCurrency = Localization.currency;
          console.log(`   -> Moneda del dispositivo: ${deviceCurrency}`);
          if (deviceCurrency && rates[deviceCurrency]) {
            detectedCurrency = deviceCurrency;
          }
        }

        console.log(`4. Moneda final detectada: ${detectedCurrency}`);
        if (detectedCurrency) {
          console.log(`   -> Actualizando store a: ${detectedCurrency}`);
          setDisplayCurrency(detectedCurrency);
        } else {
          console.warn("   -> No se pudo detectar una moneda válida. Se mantiene el valor por defecto (USD).");
        }
        console.log("--- DETECCIÓN DE MONEDA FINALIZADA ---");

      } catch (error) {
        console.error("Error grave en initializeCurrency:", error);
      }
    };

    initialize();
  }, [setDisplayCurrency, setRates]);
};