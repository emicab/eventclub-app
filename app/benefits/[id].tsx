import {
  SafeAreaView, Text, View, ActivityIndicator, Alert, TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { io } from "socket.io-client";
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useRouter } from 'expo-router';

// --- API Functions and Types ---

type BenefitDetails = {
  id: string;
  title: string;
  description: string;
  terms: string;
  // IMPORTANTE: Asegúrate de que tu backend envíe este campo.
  isUsed: boolean;
  timesUsed: number;
  usageLimit: number;
  company: {
    name: string;
    logoUrl?: string;
  };
};

type RedemptionData = {
  token: string;
  expiresAt: string;
};

// Función que obtiene todos los detalles de un beneficio, incluyendo si fue usado por el user actual.
const fetchBenefitDetails = async (benefitId: string): Promise<BenefitDetails> => {
  const { data } = await apiClient.get(`/api/benefits/${benefitId}`);
  return data;
};

const generateTokenForBenefit = async (benefitId: string): Promise<RedemptionData> => {
  const { data } = await apiClient.post(`/api/benefits/${benefitId}/generate-qr`);
  return data;
};

const socket = io(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001');

export default function BenefitDetailScreen() {
  const { id: benefitId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { token: authToken, user } = useAuthStore();
  const [qrData, setQrData] = useState<RedemptionData | null>(null);
  // Este estado local es solo para la actualización instantánea de la UI vía socket.
  const [wasJustRedeemed, setWasJustRedeemed] = useState(false);

  const router = useRouter();

  // --- QUERIES & MUTATIONS ---

  const { data: benefitDetails, isLoading: isLoadingBenefit, isError, error: benefitError } = useQuery({
    queryKey: ['benefitDetails', benefitId, user?.id],
    queryFn: () => fetchBenefitDetails(benefitId as string),
    enabled: !!benefitId,
    
    refetchOnWindowFocus: true,
  });
  console.log("benefitDeta:: ", benefitDetails)


  const { mutate: generateToken, isPending: isGeneratingToken } = useMutation({
    mutationFn: () => generateTokenForBenefit(benefitId as string),
    onSuccess: (data) => setQrData(data),
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'No se pudo generar el QR.'),
  });

  // --- EFFECTS ---

  useEffect(() => {
    if (authToken) socket.emit('authenticate', authToken);
    const onRedemptionSuccess = (data: { benefitId: string }) => {
      if (data.benefitId === benefitId) {
        // Actualiza el estado local para un feedback instantáneo.
        setWasJustRedeemed(true);
        setQrData(null);
        // Invalida la query para que la próxima vez que se cargue la pantalla, la API sea la fuente de la verdad.
        queryClient.invalidateQueries({ queryKey: ['benefitDetails', benefitId] });
      }
    };
    socket.on('redemption:success', onRedemptionSuccess);
    return () => { socket.off('redemption:success', onRedemptionSuccess) };
  }, [benefitId, authToken, queryClient]);

  // --- RENDER LOGIC ---

  if (isLoadingBenefit) {
    return (
      <SafeAreaView className="flex-1 my-safe bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView className="flex-1 my-safe bg-background justify-center items-center p-6">
        <Text className="text-error text-center">{(benefitError as any).response?.data?.message || 'Error al cargar el beneficio.'}</Text>
      </SafeAreaView>
    );
  }

  if (benefitDetails && (benefitDetails.timesUsed >= benefitDetails.usageLimit || wasJustRedeemed)) {
    return (
      <SafeAreaView className="flex-1 my-safe bg-background">
        <Stack.Screen options={{ title: "Beneficio Utilizado", headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
        <View className="flex-1 justify-center items-center p-6">
          <Ionicons name="checkmark-done-circle" size={100} color={Colors.success} />
          <Text className="text-success text-2xl text-white text-center mt-4" style={{ fontFamily: 'Inter_700Bold' }}>
            ¡Beneficio canjeando!
          </Text>
          <Text className="text-secondary text-center mt-2">
            Busca otras ofertas disponibles en la app.
          </Text>
          <TouchableOpacity
            className=" bg-accent rounded-lg px-4 py-2 items-center shadow-lg shadow-accent/40 mt-8"
            onPress={() => router.push('/benefits')}
          >
            <Text className="text-background text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
              Ir a Beneficios
            </Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 my-safe bg-background">
      <Stack.Screen options={{ title: "Canjear Beneficio", headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
      <View className="flex-1 justify-between items-center p-6">
        <View className="items-center">
          <Text className="text-primary text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>{benefitDetails?.title}</Text>
          <Text className="text-secondary text-center mt-2 mb-8">
            Muestra este QR único en el local para canjear tu descuento. Válido por 5 minutos.
          </Text>

          {qrData?.token ? (
            <View className="bg-white p-6 rounded-2xl">
              <QRCode
                value={`${process.env.EXPO_PUBLIC_API_URL}/api/redeem/${qrData.token}`}
                size={220}
              />
            </View>
          ) : (
             <View className="w-60 h-60 bg-card rounded-2xl justify-center items-center">
                <Text className="text-secondary">Genera tu QR para usarlo</Text>
             </View>
          )}
        </View>

        <TouchableOpacity
          className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40"
          onPress={() => generateToken()}
          disabled={isGeneratingToken || !!qrData}
        >
          {isGeneratingToken ? (
            <ActivityIndicator color={Colors.background} />
          ) : (
            <Text className="text-background text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
              {qrData ? 'QR Activo' : 'Generar QR de Uso Único'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
