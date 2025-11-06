import {
  SafeAreaView, Text, View, ActivityIndicator, Alert, TouchableOpacity, Image
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Benefit } from '@/src/types';

// --- API Functions ---

// Función que obtiene los detalles del beneficio
const fetchBenefitDetails = async (benefitId: string): Promise<Benefit> => {
  const { data } = await apiClient.get(`/api/benefits/${benefitId}`);
  return data;
};

// Nueva función para reclamar un beneficio
const claimBenefit = async (benefitId: string) => {
  const { data } = await apiClient.post(`/api/benefits/${benefitId}/claim`);
  return data;
};

export default function BenefitDetailScreen() {
  const { id: benefitId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const router = useRouter();

  // Query para obtener los detalles del beneficio
  const { data: benefit, isLoading, isError, error } = useQuery({
    queryKey: ['benefitDetails', benefitId],
    queryFn: () => fetchBenefitDetails(benefitId as string),
    enabled: !!benefitId,
    refetchOnWindowFocus: true,
  });

  // Mutación para reclamar el beneficio
  const { mutate: handleClaim, isPending: isClaiming } = useMutation({
    mutationFn: () => claimBenefit(benefitId as string),
    onSuccess: () => {
      Alert.alert(
        '¡Éxito!',
        'Has reclamado este beneficio. Ahora puedes encontrarlo en tu perfil, listo para ser usado.',
        [{ text: 'Aceptar', onPress: () => router.back() }]
      );
      // Invalidamos queries para refrescar los datos del usuario (puntos) y la lista de beneficios
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
      queryClient.invalidateQueries({ queryKey: ['myClaimedBenefits'] }); // Para la futura pantalla
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo reclamar el beneficio.');
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 my-safe bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 my-safe bg-background justify-center items-center p-6">
        <Text className="text-error text-center">{(error as any).response?.data?.message || 'Error al cargar.'}</Text>
      </SafeAreaView>
    );
  }
  
  if (!benefit) return null;


  return (
    <SafeAreaView className="flex-1 my-safe bg-background">
      <Stack.Screen options={{ title: "Detalle del Beneficio", headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
      <View className="flex-1 justify-between p-6">
        <View>
          <View className="flex-row items-center mb-4">
              <Image source={{ uri: benefit.company.logoUrl || 'https://placehold.co/100' }} className="w-16 h-16 rounded-full" />
              <View className="ml-4">
                  <Text className="text-secondary text-lg">Ofrecido por</Text>
                  <Text className="text-primary text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>{benefit.company.name}</Text>
              </View>
          </View>
          <Text className="text-primary text-3xl mt-4" style={{ fontFamily: 'Inter_700Bold' }}>{benefit.title}</Text>
        </View>

        <TouchableOpacity
          className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40"
          onPress={() => handleClaim()}
          disabled={isClaiming}
        >
          {isClaiming ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text className="text-background text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
              {benefit.pointCost > 0 ? `Reclamar por ${benefit.pointCost} Puntos` : 'Reclamar Gratis'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
