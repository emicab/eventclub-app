
import {
    SafeAreaView, Text, View, FlatList, ActivityIndicator, TouchableOpacity, Image
  } from 'react-native';
  import { useQuery } from '@tanstack/react-query';
  import apiClient from '@/src/lib/axios';
  import { Stack, useRouter } from 'expo-router';
  import Colors from '@/src/constants/Colors';
  import { Benefit } from '@/src/types';
  import { Ionicons } from '@expo/vector-icons';
  
  // Función para llamar al nuevo endpoint
  const fetchMyClaimedBenefits = async (): Promise<Benefit[]> => {
    const { data } = await apiClient.get('/api/benefits/my-claimed');
    return data;
  };
  
  // Componente para renderizar cada beneficio reclamado
  const ClaimedBenefitCard = ({ item }: { item: Benefit }) => {
    const router = useRouter();
  
    // Esta función nos llevará a la pantalla donde se generará el QR
    const handleUseBenefit = () => {
      // Redirigimos a una nueva pantalla (que crearemos después) para generar el QR
      // Pasamos el ID del beneficio y el ID del *reclamo*
      // @ts-ignore
      router.push(`/profile/use-benefit/${item.claimedId}`);
    };

    console.log(item)
  
    return (
      <View className="bg-card rounded-lg p-4 mb-4 shadow-md">
        <View className="flex-row items-center">
          <Image 
            source={{ uri: item.company.logoUrl || 'https://placehold.co/100' }}
            className="w-16 h-16 rounded-full bg-slate-200"
          />
          <View className="flex-1 ml-4">
            <Text className="text-dark font-bold text-lg">{item.title}</Text>
            <Text className="text-secondary mt-1">en {item.company.name}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleUseBenefit}
          className="bg-accent mt-4 p-3 rounded-lg flex-row justify-center items-center"
        >
          <Ionicons name="qr-code" size={20} color={Colors.background} />
          <Text className="text-background font-bold ml-2">Generar QR para usar</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  
  export default function ClaimedBenefitsScreen() {
    const { data: claimedBenefits, isLoading, isError } = useQuery({
      queryKey: ['myClaimedBenefits'],
      queryFn: fetchMyClaimedBenefits,
      refetchOnWindowFocus: true,
    });
  
    return (
      <SafeAreaView className="flex-1 bg-background pt-10 my-safe">
        <Stack.Screen options={{ title: "Mis Beneficios", headerTintColor: Colors.text.primary, headerStyle:{backgroundColor: Colors.background} }} />
        <Text className="text-primary text-3xl px-6 mb-4" style={{ fontFamily: 'Inter_700Bold' }}>
          Listos para Usar
        </Text>
  
        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.accent} className="mt-8" />
        ) : isError ? (
          <Text className="text-error text-center p-4">
            Error al cargar tus beneficios.
          </Text>
        ) : (
          <FlatList
            data={claimedBenefits}
            renderItem={({ item }) => <ClaimedBenefitCard item={item} />}
            // @ts-ignore
            keyExtractor={(item) => item.claimedId}
            contentContainerStyle={{ paddingHorizontal: 24 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center mt-24">
                  <Text className="text-secondary text-center">
                  Aún no has reclamado ningún beneficio.
                  </Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    );
  }
  