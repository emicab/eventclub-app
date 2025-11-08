// app/(tabs)/benefits.tsx (Con enlace a Beneficios Reclamados)
import {
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import BenefitCard from '@/src/components/shared/BenefitCard';
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { useAuthStore } from '@/src/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Benefit, UserProfile } from '@/src/types';

// --- API Calls ---
const fetchCategories = async (): Promise<{ name: string }[]> => {
    const { data } = await apiClient.get('/api/categories?type=BENEFIT');
    return data;
};

const fetchMyProfile = async (): Promise<UserProfile> => {
    const { data } = await apiClient.get('/api/users/me');
    return data;
};

const fetchBenefits = async (city: string, category: string): Promise<Benefit[]> => {
    const categoryFilter = category !== 'Todos' ? `&category=${category}` : '';
    const { data } = await apiClient.get(
        `/api/benefits?city=${city.toLowerCase()}${categoryFilter}`
    );
    return data;
};
// --- Fin API Calls ---

export default function BenefitsScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Iniciar como null
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
    refetchOnWindowFocus: true,
  });

  const userCity = profileData?.profile?.city || 'cordoba';

  const { data: categoriesData = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['benefitCategories'],
    queryFn: fetchCategories,
  });
  const categories = ['Todos', ...categoriesData.map(c => c.name)];

  const {
    data: benefits = [],
    isLoading: isLoadingBenefits,
    isFetching: isFetchingBenefits,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['benefits', userCity.toLowerCase(), selectedCategory],
    queryFn: () => fetchBenefits(userCity, selectedCategory ?? 'Todos'), // Usar 'Todos' si selectedCategory es null
    enabled: !!profileData?.profile?.city && selectedCategory !== null, // Habilitar solo si hay ciudad Y canal seleccionado
    refetchOnWindowFocus: true,
  });

  // Efecto para seleccionar "Todos" cuando las categorías carguen
  useEffect(() => {
     if(categories.length > 0 && selectedCategory === null){
         setSelectedCategory(categories[0]); // Selecciona "Todos" al inicio
     }
  }, [categories]);

  const isInitiallyLoading = isLoadingProfile || isLoadingCategories || (isLoadingBenefits && benefits.length === 0);

  return (
    <SafeAreaView className="flex-1 mt-safe bg-background pt-8">
      {/* Cabecera */}
      <View className="px-6">
        <View className='flex-row justify-between items-start mb-6'>
          <View>
            <Text className="text-primary text-3xl" style={{ fontFamily: 'Inter_700Bold' }}>Beneficios</Text>
            <Text className="text-secondary mt-1 max-w-[200px]" style={{ fontFamily: 'Inter_400Regular' }}>
              Tus descuentos exclusivos por ser parte del club.
            </Text>
          </View>
          {/* --- SECCIÓN DE PUNTOS Y ENLACE A RECLAMADOS --- */}
          <View className='justify-end items-end gap-1'>
            <Text className='text-secondary text-sm'>Mis Puntos</Text>
            {isLoadingProfile ? (
              <ActivityIndicator size="small" color={Colors.accent} />
            ) : (
              <Text className="text-primary text-xl font-bold">🌟 {profileData?.points || 0}</Text>
            )}
            {/* --- NUEVO BOTÓN --- */}
            <TouchableOpacity 
              onPress={() => router.push('/profile/claimed-benefits')}
              className='mt-2 flex-row items-center bg-white/10 px-3 py-1.5 rounded-full'
            >
                <Ionicons name="receipt-outline" size={16} color={Colors.accent} />
                <Text className='text-accent text-xs font-bold ml-1.5'>Mis Beneficios</Text>
            </TouchableOpacity>
            {/* --- FIN NUEVO BOTÓN --- */}
          </View>
           {/* --- FIN SECCIÓN --- */}
        </View>

        {/* Filtro de Categorías */}
        <View>
         {isLoadingCategories ? (
            <ActivityIndicator color={Colors.accent}/>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`py-2 px-4 rounded-full mr-3 border ${
                    selectedCategory === category
                      ? 'bg-accent border-accent'
                      : 'bg-glass-border border-glass-border'
                  }`}
                >
                  <Text className={`font-bold ${
                    selectedCategory === category ? 'text-background' : 'text-primary'
                  }`}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Contenido Principal */}
      <View className="flex-1 px-4">
        {isInitiallyLoading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : isError ? (
          <View className="flex-1 justify-center items-center p-4 py-20">
            <Text className="text-error text-center">
              Error al cargar: {(error as any).message}
            </Text>
          </View>
        ) : (
          <FlatList
            data={benefits}
            renderItem={({ item }) => (
              <BenefitCard benefit={item} userPoints={profileData?.points || 0} />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center py-20">
                <Text className="text-secondary text-center px-4">No hay beneficios disponibles para "{selectedCategory}" en {userCity}.</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={isFetchingBenefits && !isInitiallyLoading}
                onRefresh={refetch}
                tintColor={Colors.accent}
              />
            }
            ListFooterComponent={<View style={{ height: 120 }} />}
          />
        )}
      </View>

      {/* Botón Flotante para Admin */}
       {profileData?.role === 'ADMIN' && (
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
