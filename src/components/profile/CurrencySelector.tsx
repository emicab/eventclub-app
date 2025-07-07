
import { View, Text, TouchableOpacity } from 'react-native';
import { useCurrencyStore } from '@/src/store/useCurrencyStore';
import Colors from '@/src/constants/Colors';

export default function CurrencySelector() {
  // Obtenemos el estado y las acciones del store
  const { displayCurrency, rates, setDisplayCurrency } = useCurrencyStore();

  // Creamos una lista de monedas disponibles a partir de las tasas que tenemos
  const availableCurrencies = ["USD", "EUR", "ARS", "BRL", "GBP"]

  return (
    <View className="mt-6">
      <Text className="text-primary text-xl mb-3" style={{ fontFamily: 'Inter_700Bold' }}>
        Moneda de Visualización
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {availableCurrencies.slice(0, 5).map((currency) => ( // Mostramos solo algunas para no saturar
          <TouchableOpacity
            key={currency}
            onPress={() => setDisplayCurrency(currency)}
            className={`px-4 py-2 rounded-full border-2 ${
              displayCurrency === currency
                ? 'bg-accent border-accent'
                : 'border-glass-border'
            }`}
          >
            <Text className={
              displayCurrency === currency
                ? 'text-background font-bold'
                : 'text-primary'
            }>
              {currency}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}