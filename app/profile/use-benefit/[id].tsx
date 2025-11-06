import {
  SafeAreaView, Text, View, ActivityIndicator, Alert, TouchableOpacity, Image
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { useEffect, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { ClaimedBenefit } from '@/src/types';
import Constants from 'expo-constants';
import { socket } from '@/src/lib/socket'; 

// Obtiene los detalles de un beneficio RECLAMADO específico
const fetchClaimedBenefit = async (claimedId: string): Promise<ClaimedBenefit> => {
  const { data } = await apiClient.get(`/api/benefits/claimed/${claimedId}`);
  return data;
};

// Genera el token QR para el canje
const generateQrToken = async (claimedId: string): Promise<{ token: string, expiresAt: string }> => {
  const { data } = await apiClient.post(`/api/benefits/claimed/${claimedId}/generate-qr`);
  return data;
};


export default function UseBenefitScreen() {
  const { id: claimedId } = useLocalSearchParams<{ claimedId: string }>();
  const router = useRouter(); 
  const queryClient = useQueryClient();

  const [qrContent, setQrContent] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);

  // Query para obtener los detalles del beneficio reclamado
  const { data: claimedBenefit, isLoading, isError, refetch } = useQuery({
    queryKey: ['claimedBenefit', claimedId],
    queryFn: () => fetchClaimedBenefit(claimedId as string),
    enabled: !!claimedId,
  });

  // Mutación para generar el token del QR
  const { mutate: handleGenerateQr, isPending: isGenerating } = useMutation({
    mutationFn: () => generateQrToken(claimedId as string),
    onSuccess: (data) => {
      setIsExpired(false);
      setCountdown('');
      const fullUrl = `${Constants.expoConfig?.extra?.apiUrl}/api/redeem/${data.token}`;
      setQrContent(fullUrl);
      setExpiresAt(new Date(data.expiresAt));
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo generar el código QR.');
    },
  });

  // Genera el QR automáticamente al cargar la pantalla si está disponible
  useEffect(() => {
      if(claimedBenefit && claimedBenefit.status === 'AVAILABLE' && !qrContent && !isGenerating) {
          handleGenerateQr();
      }
  }, [claimedBenefit, qrContent, isGenerating]);
  

  // Lógica del Temporizador
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(interval);
        setCountdown('Expirado');
        setQrContent(null); 
        setIsExpired(true);
        Alert.alert('QR Expirado', 'El código ha expirado. Puedes generar uno nuevo si lo necesitas.');
        return;
      }

      const minutes = Math.floor((diff / 1000) / 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // Listener de Socket.IO
  useEffect(() => {
      const handleRedemptionSuccess = (data: { claimedId: string }) => {
      if (data.claimedId === claimedId) {
          setQrContent(null);
          queryClient.invalidateQueries({ queryKey: ['claimedBenefit', claimedId] });
          queryClient.invalidateQueries({ queryKey: ['claimedBenefits'] });
          refetch();
      }
      };

      socket.on('redemption:success', handleRedemptionSuccess);

      return () => {
      socket.off('redemption:success', handleRedemptionSuccess);
      };
  }, [claimedId, queryClient, router, refetch]);


  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.accent} className="flex-1 bg-background" />;
  }

  if (isError || !claimedBenefit) {
    return (
      <SafeAreaView className="flex-1 my-safe bg-background justify-center items-center">
           <Text className="text-error text-center p-4">Error al cargar el beneficio.</Text>
      </SafeAreaView>
    );
  }

  // --- LÓGICA DE RENDERIZADO SIMPLIFICADA ---
  
  // 1. Si el beneficio está USADO o EXPIRADO, mostramos la pantalla de estado final.
  if (claimedBenefit.status === 'USED' || claimedBenefit.status === 'EXPIRED') {
      const isUsed = claimedBenefit.status === 'USED';
      return (
          <SafeAreaView className={`flex-1 items-center justify-center p-8 ${isUsed ? 'bg-green-500' : 'bg-gray-700'}`}>
              <Stack.Screen 
                  options={{ 
                      title: isUsed ? "Canjeado" : "Expirado", 
                      headerStyle: { backgroundColor: isUsed ? '#28a745' : '#374151' }, 
                      headerTintColor: 'white' 
                  }} 
              />
              <Ionicons name={isUsed ? "checkmark-circle" : "time"} size={120} color="white" />
              <Text className="text-white text-3xl font-bold mt-4">{isUsed ? "Canjeado" : "Expirado"}</Text>
              <Text className="text-white text-lg text-center mt-2">
                  {isUsed ? "Este beneficio ya fue utilizado." : "Este beneficio ha expirado."}
              </Text>
               <TouchableOpacity
                  className="w-full bg-white/30 rounded-lg p-4 items-center flex-row justify-center shadow-lg shadow-black/20 mt-10"
                  onPress={() => router.back()}
                  >
                  <Ionicons name="arrow-back" size={24} color="white" />
                  <Text className="text-white text-base font-bold ml-3" style={{ fontFamily: 'Inter_700Bold' }}>
                      Volver
                  </Text>
              </TouchableOpacity>
          </SafeAreaView>
      );
  }
  
  // 2. Si el código llega aquí, el estado solo puede ser 'AVAILABLE'.
  //    Mostramos la pantalla principal de canje.
  const benefit = claimedBenefit.benefit;

  return (
    <SafeAreaView className="flex-1 my-safe bg-background">
      <Stack.Screen options={{ title: benefit.title, headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
      <View className="flex-1 justify-between p-6">
        <View>
          <View className="flex-row items-center mb-4">
            <Image source={{ uri: benefit.company.logoUrl || 'https://placehold.co/100' }} className="w-16 h-16 rounded-full" />
            <View className="ml-4">
              <Text className="text-secondary text-lg">Beneficio en</Text>
              <Text className="text-primary text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>{benefit.company.name}</Text>
            </View>
          </View>
          <Text className="text-primary text-3xl mt-4" style={{ fontFamily: 'Inter_700Bold' }}>{benefit.title}</Text>
          <Text className="text-secondary leading-6 mt-4">{benefit.description}</Text>
        </View>

        <View className="items-center gap-4">
           {isGenerating ? (
               <ActivityIndicator color={Colors.accent} size="large"/>
           ) : qrContent ? (
              // --- VISTA DE QR ACTIVO ---
              <>
                  <Text className="text-secondary text-center">Muestra este código en el local para canjear tu beneficio.</Text>
                  <View className="bg-white p-6 rounded-2xl">
                      <QRCode value={qrContent} size={250} />
                  </View>
                  <View className='bg-accent/20 border border-accent p-3 rounded-lg'>
                      <Text className="text-accent text-2xl font-bold">{countdown}</Text>
                  </View>
                  <Text className="text-secondary text-center text-xs">Este código es de un solo uso y expirará.</Text>
              </>
           ) : (
              // --- VISTA PARA GENERAR (Incluye 'isExpired' o 'AVAILABLE') ---
              <TouchableOpacity
                  className="w-full bg-accent rounded-lg p-4 items-center flex-row justify-center shadow-lg shadow-accent/40"
                  onPress={() => handleGenerateQr()}
                  disabled={isGenerating}
                  >
                  {isGenerating ? <ActivityIndicator color={Colors.background} /> : (
                      <>
                      <Ionicons name={isExpired ? "refresh" : "qr-code"} size={24} color={Colors.background} />
                      <Text className="text-background text-base font-bold ml-3" style={{ fontFamily: 'Inter_700Bold' }}>
                          {isExpired ? "Generar Nuevo QR" : "Generar QR para Usar"}
                      </Text>
                      </>
                  )}
              </TouchableOpacity>
           )
           }
          </View>

      </View>
    </SafeAreaView>
  );
}
