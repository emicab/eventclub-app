// app/(tabs)/benefits.tsx (Corregido y Ordenado)
import {
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import BenefitCard from '@/src/components/shared/BenefitCard';
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Benefit, UserProfile } from '@/src/types';

// Lista de categorías que mostraremos.
const categories = ['Todos', 'Gastronomía', 'Bares', 'Eventos', 'Tecnología'];

// Función para obtener los beneficios desde la API.
const fetchBenefits = async (
  city: string,
  category: string
): Promise<Benefit[]> => {
  const categoryFilter = category !== 'Todos' ? `&category=${category}` : '';
  const { data } = await apiClient.get(
    `/api/benefits?city=${city}${categoryFilter}`
  );
  return data;
};

const fetchMyProfile = async (): Promise<UserProfile> => {
  // Este endpoint sí devuelve el perfil completo, incluyendo los datos anidados.
  const { data } = await apiClient.get('/api/users/me');
  return data;
};

export default function BenefitsScreen() {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const { user } = useAuthStore();
  const router = useRouter();
  const {
    data: benefits,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['benefits', 'Cordoba', selectedCategory],
    queryFn: () => fetchBenefits('Cordoba', selectedCategory),
    refetchOnWindowFocus: true,
  });
  
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
    refetchOnWindowFocus: true,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 justify-center items-center p-4 py-20">
          <Text className="text-error text-center">
            Error al cargar los beneficios: {(error as any).message}
          </Text>
        </View>
      );
    }

    if (!benefits || benefits.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <Text className="text-secondary">No hay beneficios en esta categoría.</Text>
        </View>
      );
    }

    return (
      <View className=''>
        <FlatList
          data={benefits}
          renderItem={({ item }) => <BenefitCard benefit={item} /> }
          keyExtractor={(item) => item.id}
          numColumns={1} // Cambiado a 2 para una mejor visualización en móviles
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View style={{ height: 60 }} />} // Espacio para el botón flotante y tab bar
        />
      </View>
    );
  };

  return (
    // Reemplazamos "my-safe" por un padding top estándar
    <SafeAreaView className="flex-1 mt-safe bg-background pt-8">
      <View className="px-6">
        <View className='flex-row justify-between items-start mb-6'>
          <View>
            <Text
              className="text-primary text-3xl"
              style={{ fontFamily: 'Inter_700Bold' }}
            >
              Beneficios
            </Text>
            <Text
              className="text-secondary mt-1 mb-6 w-52"
              style={{ fontFamily: 'Inter_400Regular' }}
            >
              Tus descuentos exclusivos por ser parte del club.
            </Text>
          </View>
          <View className='justify-end items-end gap-2'>
            <Text className='text-primary text-md'>Mis Puntos Club </Text>
            <Text className="text-accent text-xl font-bold">🌟 {profileData?.points || 0}</Text>
          </View>
        </View>

        {/* --- Filtro de Categorías --- */}
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => setSelectedCategory(category)}
                className={`py-2 px-4 rounded-full  mr-3 border ${
                  selectedCategory === category
                    ? 'bg-accent border-accent'
                    : 'bg-card border-glass-border text-dark'
                }`}
              >
                <Text
                  className={`font-bold ${
                    selectedCategory === category
                      ? 'text-background'
                      : 'text-dark'
                  }`}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      
      {/* El contenido dinámico (carga, error, lista) se renderiza aquí */}
      <View className="flex-1 px-4">{renderContent()}</View>


      {/* --- BOTÓN FLOTANTE PARA ADMINS --- */}
      {user?.role === 'ADMIN' && (
        <TouchableOpacity
          onPress={() => router.push('/benefits/create')}
          className="absolute bottom-32 right-6 bg-accent w-16 h-16 rounded-full justify-center items-center shadow-lg shadow-accent/40"
        >
          <Ionicons name="add" size={32} color={Colors.background} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}
