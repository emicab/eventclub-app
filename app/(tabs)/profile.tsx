// --- app/(tabs)/profile.tsx (Refactorizado con Sincronización de Estado) ---
import VerifyCheckIcon from '@/src/components/ui/VerifyCheckIcon';
import Colors from '@/src/constants/Colors';
import { useAuth } from '@/src/hooks/useAuth';
import apiClient from '@/src/lib/axios';
import { useAuthStore } from '@/src/store/useAuthStore'; // Importar el store
import { UserProfile } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Función para obtener los datos del perfil desde la API
const fetchMyProfile = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get('/api/users/me');
  return data;
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  // Obtenemos la función para actualizar el usuario en el store
  const { login: updateUserInStore } = useAuthStore();

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
    refetchOnWindowFocus: true,
    onSuccess: (freshUserData) => {
      // --- SOLUCIÓN ROBUSTA ---
      // Obtenemos el token más reciente directamente desde el estado del store
      // para evitar problemas con closures y valores "viejos".
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        // Actualizamos el store global con los datos frescos del perfil.
        updateUserInStore(currentToken, freshUserData);
      }
    }
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
    <SafeAreaView className="flex-1 bg-background pt-8 mt-safe">
      <ScrollView>
        <View className="p-6">
          {/* --- Cabecera --- */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Image source={{ uri: user?.profile?.avatarUrl || 'https://placehold.co/100' }} className="w-20 h-20 rounded-full" />
              <View className="ml-4">
                <View className='flex justify-start'>
                  <View className="flex-row items-center justify-center">
                    <Text className="text-primary text-2xl mr-2" style={{ fontFamily: 'Inter_700Bold' }}>{fullName}</Text>
                    <Text>
                      {
                        user?.isVerified && (
                          <VerifyCheckIcon className="w-2 h-2 ml-2" color={Colors.accent} />
                        )
                      }
                    </Text>
                  </View>
                  <Text className="text-primary text-lg italic" style={{ fontFamily: 'Inter_700Bold' }}>{displayName}</Text>
                </View>
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
            {user?.profile?.nickname && <InfoChip icon="happy-outline" text={fullName} />}
            <Text className="text-secondary mt-2" style={{ fontFamily: 'Inter_400Regular' }}>{user?.profile?.bio || "Añade una descripción sobre ti."}</Text>
            <View className="flex-row flex-wrap mt-4">
              {user?.profile?.showInfo && user?.profile?.city && <InfoChip icon="location-outline" text={`Vive en ${user.profile.city}`} />}
              {user?.profile?.showInfo && user?.profile?.hometown && <InfoChip icon="flag-outline" text={`De ${user.profile.hometown}`} />}
              {user?.profile?.showInfo && getAge(user?.profile?.dateOfBirth) && <InfoChip icon="calendar-outline" text={`${getAge(user.profile.dateOfBirth)} años`} />}
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
              {user?.profile?.skills?.length > 0 ? (
                <View className="flex-row flex-wrap">
                  {user.profile.skills.map(skill => <SkillChip key={skill} text={skill} />)}
                </View>
              ) : <Text className="text-secondary italic">Añade tus habilidades.</Text>}
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
