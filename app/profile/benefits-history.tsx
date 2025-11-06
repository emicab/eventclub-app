
// --- app/profile/benefits-history.tsx (Pantalla para el historial) ---
import { SafeAreaView, Text, View, FlatList, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { Stack } from 'expo-router';
import Colors from '@/src/constants/Colors';
import { Benefit } from '@/src/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// La API ahora devuelve el beneficio completo + la fecha de canje
type UsedBenefit = Benefit & {
  redeemedAt: string;
};

// Función para llamar al nuevo endpoint
const fetchMyBenefitHistory = async (): Promise<UsedBenefit[]> => {
  const { data } = await apiClient.get('/api/users/me/benefits-history');
  return data;
};

// Componente para renderizar cada item del historial
const HistoryItem = ({ item }: { item: UsedBenefit }) => {
  const redeemedDate = format(new Date(item.redeemedAt), "d 'de' MMMM, yyyy", { locale: es });
  
  return (
    <View className="bg-card rounded-lg flex-row items-center p-4 mb-4 shadow-md">
      <Image 
        source={{ uri: item.company.logoUrl || 'https://placehold.co/100' }}
        className="w-16 h-16 rounded-full bg-slate-200"
      />
      <View className="flex-1 ml-4">
        <Text className="text-dark font-bold text-lg">{item.title}</Text>
        <Text className="text-secondary mt-1">en {item.company.name}</Text>
        <Text className="text-secondary text-sm mt-2">Canjeado el: {redeemedDate}</Text>
      </View>
    </View>
  );
};


export default function BenefitsHistoryScreen() {
  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['myBenefitHistory'],
    queryFn: fetchMyBenefitHistory,
    refetchOnWindowFocus: true,
  });

  return (
    <SafeAreaView className="flex-1 bg-background pt-10 my-safe">
      <Stack.Screen options={{ title: "Beneficios Canjeados", headerTintColor: Colors.text.primary, headerStyle:{backgroundColor: Colors.background} }} />
      <Text className="text-primary text-3xl px-6 mb-4" style={{ fontFamily: 'Inter_700Bold' }}>
        Mi Historial
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.accent} className="mt-8" />
      ) : isError ? (
        <Text className="text-error text-center p-4">
          Error al cargar tu historial.
        </Text>
      ) : (
        <FlatList
          data={history}
          renderItem={({ item }) => <HistoryItem item={item} />}
          keyExtractor={(item) => item.id + item.redeemedAt} // Clave única por si se canjea varias veces
          contentContainerStyle={{ paddingHorizontal: 24 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-24">
                <Text className="text-secondary text-center">
                Aún no has canjeado ningún beneficio.
                </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
