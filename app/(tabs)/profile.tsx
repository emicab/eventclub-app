// --- app/(tabs)/profile.tsx (Refactorizado con useQuery para datos siempre actualizados) ---
import { SafeAreaView, Text, View, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/src/hooks/useAuth';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';
import { BlurView } from 'expo-blur';
import { useQuery } from '@tanstack/react-query'; // Importar useQuery
import apiClient from '@/src/lib/axios';       // Importar nuestro cliente de API
import { UserProfile } from '@/src/types';     // Importar el tipo de perfil

// Función para obtener los datos del perfil desde la API
const fetchMyProfile = async (): Promise<UserProfile> => {
  // Este endpoint sí devuelve el perfil completo, incluyendo los datos anidados.
  const { data } = await apiClient.get('/api/users/me');
  return data;
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  // Usamos useQuery para obtener siempre los datos más actualizados del perfil
  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
    refetchOnWindowFocus: true, // Vuelve a cargar los datos cuando la pantalla gana foco
  });

  const getAge = (dateString?: string | Date) => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // Mientras carga, mostramos un indicador
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color={Colors.accent} />
      </SafeAreaView>
    );
  }

  // Si hay un error, lo mostramos
  if (isError) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-error">Error al cargar el perfil: {(error as any).message}</Text>
      </SafeAreaView>
    );
  }

  // 'user' ahora es el objeto que viene de TanStack Query
  const displayName = user?.profile?.nickname || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();

  return (
    <SafeAreaView className="flex-1 my-safe pb-safe bg-background pt-6">
      <ScrollView>
        <View className="p-6">
          {/* --- Cabecera --- */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Image source={{ uri: user?.profile?.avatarUrl || 'https://placehold.co/100' }} className="w-20 h-20 rounded-full" />
              <View className="ml-4">
                <Text className="text-primary text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>{fullName}</Text>
                <Text className="text-primary text-lg" style={{ fontFamily: 'Inter_700Regular' }}>{displayName}</Text>
                {/* Espacio para Puntos */}
                <Text className="text-accent" style={{ fontFamily: 'Inter_400Regular' }}>✨ {user?.points || 0} Puntos</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile/edit')}>
              <Ionicons name="create-outline" size={28} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* --- Sobre mí --- */}
          <BlurView intensity={80} tint="dark" className="p-4 rounded-2xl mt-8" style={{ borderWidth: 1, borderColor: Colors.glass.border }}>
            <Text className="text-primary text-lg mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Sobre mí</Text>

            <Text className="text-secondary mt-2" style={{ fontFamily: 'Inter_400Regular' }}>{user?.profile?.bio || "Añade una descripción sobre ti."}</Text>
            <View className="flex-row flex-wrap mt-4">
              {user?.profile?.city && <InfoChip icon="location-outline" text={`Vive en ${user.profile.city}`} />}
              {user?.profile?.hometown && <InfoChip icon="flag-outline" text={`De ${user.profile.hometown}`} />}
              {getAge(user?.profile?.dateOfBirth) && <InfoChip icon="calendar-outline" text={`${getAge(user?.profile?.dateOfBirth)} años`} />}
            </View>
          </BlurView>

          {/* --- Área de Trabajo --- */}
          <BlurView intensity={80} tint="dark" className="p-4 rounded-2xl mt-6" style={{ borderWidth: 1, borderColor: Colors.glass.border }}>
            <View className="flex-row justify-between items-center">
              <Text className="text-primary text-lg" style={{ fontFamily: 'Inter_700Bold' }}>Mi Perfil Laboral</Text>
              <Ionicons name="lock-closed-outline" size={16} color={Colors.text.secondary} />
            </View>
            <Text className="text-secondary mt-2 mb-4" style={{ fontFamily: 'Inter_400Regular' }}>Esta información es privada y solo se compartirá cuando apliques a un trabajo.</Text>
            <InfoChip icon="search-outline" text={user?.profile?.jobSeeking || "Define tu búsqueda"} />
            <View className="mt-2">
              {/* @ts-ignore */}
              {user?.profile?.skills?.length > 0 ? (
                <View className="flex-row flex-wrap">
                  {/* @ts-ignore */}
                  {user.profile.skills.map(skill => <SkillChip key={skill} text={skill} />)}
                </View>
              ) : <Text className="text-secondary italic">Añade tus habilidades.</Text>}
            </View>

            {/* --- NUEVA SECCIÓN PARA ENTRADAS Y BENEFICIOS --- */}
          </BlurView>

          <BlurView intensity={80} tint="dark" className="p-4 rounded-2xl mt-6" style={{ borderWidth: 1, borderColor: Colors.glass.border }}>
          <View className="flex-row justify-between items-center">
                <Text className="text-primary text-lg" style={{fontFamily: 'Inter_700Bold'}}>Mi Compras</Text>
                <Ionicons name="cart-sharp" size={16} color={Colors.text.secondary}/>
             </View>
            <View className="px-4 mt-2 gap-2">
              <TouchableOpacity
                onPress={() => router.push('/profile/tickets')}
                className="bg-card p-4 rounded-lg flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Ionicons name="ticket-outline" size={24} color={Colors.accent} />
                  <Text className="text-dark text-base ml-3 font-bold">Mis Entradas</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/profile/benefits-history')}
                className="bg-card p-4 rounded-lg flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Ionicons name="pricetag-outline" size={24} color={Colors.accent} />
                  <Text className="text-dark text-base ml-3 font-bold">Beneficios Usados</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </BlurView>


          <TouchableOpacity className="w-full bg-card mt-8 rounded-xl p-4 items-center" onPress={logout}>
            <Text className="text-error text-base" style={{ fontFamily: 'Inter_700Bold' }}>Cerrar Sesión</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const InfoChip = ({ icon, text }: { icon: any, text: string }) => (
  <View className="flex-row items-center bg-white/5 rounded-full px-3 py-1.5 mr-2 mb-2">
    <Ionicons name={icon} size={14} color={Colors.text.secondary} />
    <Text className="text-secondary text-xs ml-1.5" style={{ fontFamily: 'Inter_400Regular' }}>{text}</Text>
  </View>
);

const SkillChip = ({ text }: { text: string }) => (
  <View className="bg-accent/20 rounded-full px-3 py-1.5 mr-2 mb-2">
    <Text className="text-accent text-xs font-bold">{text}</Text>
  </View>
);
