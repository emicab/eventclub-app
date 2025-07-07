// En app/user/[id].tsx
import { 
  View, Text, Image, ActivityIndicator, ScrollView, 
  TouchableOpacity, Linking 
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { UserProfile } from '@/src/types';
import FriendshipButton from '@/src/components/friends/FriendshipButton';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';

// --- Componente Reutilizable ---
// Idealmente, este InfoChip viviría en su propio archivo en src/components/
const InfoChip = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap, text: string }) => (
  <View className='flex-row items-center bg-white/5 rounded-full px-3 py-1.5 mr-2 mb-2'>
      <Ionicons name={icon} size={14} color={Colors.text.secondary} />
      <Text className='text-secondary text-xs ml-1.5'>{text}</Text>
  </View>
);

// --- Funciones de Ayuda y Fetching ---
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data } = await apiClient.get(`/api/users/${userId}`);
  return data;
};

const calculateAge = (dateString?: string) => {
  if (!dateString) return null;
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
};

// --- Pantalla Principal del Perfil Público ---
export default function UserProfileScreen() {
  const { id: userId } = useLocalSearchParams();

  const { data: user, isLoading, error } = useQuery({
      queryKey: ['userProfile', userId],
      queryFn: () => fetchUserProfile(userId as string),
      enabled: !!userId,
  });

  if (isLoading) return <View className="flex-1 justify-center bg-background"><ActivityIndicator size="large" /></View>;
  if (error || !user) return <View className="flex-1 justify-center bg-background"><Text className="text-error text-center">No se pudo cargar el perfil.</Text></View>;

  const age = calculateAge(user.profile?.dateOfBirth);
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
      <ScrollView className="flex-1 bg-background pt-6 my-safe ">
          <Stack.Screen options={{ title: `@${user.profile?.nickname || fullName}`, headerTintColor: Colors.text.primary, headerStyle:{backgroundColor: Colors.background} }} />
          
          <View className='px-4'>
            <View className="p-4">
                {/* --- Cabecera --- */}
                <View className="items-center">
                    <Image
                        source={{ uri: user.profile?.avatarUrl || 'https://placehold.co/100' }}
                        className="w-32 h-32 rounded-full border-4 border-accent offset-1"
                    />
                    <Text className="text-primary text-2xl font-bold mt-4">{fullName}</Text>
                    <Text className="text-secondary text-md">@{user.profile?.nickname}</Text>
                </View>
            
                {/* --- Sección "Sobre mí" --- */}
                <View className="mt-6 p-4 bg-background rounded-2xl border-2 border-accent">
                    <Text className='text-primary text-lg font-bold mb-2'>Sobre mí</Text>
                    <Text className='text-secondary'>{user.profile?.bio || "Este usuario aún no ha añadido una biografía."}</Text>
                    <View className='flex-row flex-wrap mt-4'>
                        {age && <InfoChip icon='calendar-outline' text={`${age} años`} />}
                        {user.profile?.city && <InfoChip icon='location-outline' text={`Vive en ${user.profile.city}`} />}
                        {user.profile?.hometown && <InfoChip icon='flag-outline' text={`De ${user.profile.hometown}`} />}
                    </View>
                </View>
                {/* --- Sección CV Express (CONDICIONAL) --- */}
                {/* @ts-ignore */}
                {user.profile?.showInfo && (user?.profile?.skills?.length > 0 || user.profile.jobSeeking) && (
                    <View className="mt-6 p-4 bg-backgroud border-2 border-accent rounded-2xl">
                        <Text className="text-primary text-xl font-bold mb-3">CV Express</Text>
                        {user.profile.jobSeeking && (
                            <Text className="text-secondary mb-3"><Text className="font-bold">Buscando:</Text> {user.profile.jobSeeking}</Text>
                        )}
                        {/* @ts-ignore */}
                        {user?.profile?.skills?.length > 0 && (
                            <View>
                                <Text className="text-secondary font-bold mb-2">Habilidades:</Text>
                                <View className="flex-row flex-wrap gap-2">
                                {user?.profile?.skills && user.profile.skills.map((skill: string, index: number) => (
                                <InfoChip key={index} icon='checkmark' text={skill} />
                            ))}
                                </View>
                            </View>
                        )}
                    </View>
                )}
                {/* --- Sección Redes Sociales (CONDICIONAL) --- */}
                {/* Asumimos que tendrás un objeto 'socials' en el perfil */}
                {/* {user.profile?.socials && Object.keys(user.profile.socials).length > 0 && (
                    <View className="mt-6 p-4 bg-card rounded-2xl">
                        <Text className="text-primary text-xl font-bold mb-3">Conecta</Text>
                        <View className="flex-row gap-4">
                            {user.profile.socials.instagram && (
                                <TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/${user.profile.socials.instagram}`)}>
                                    <Ionicons name="logo-instagram" size={32} color={Colors.text.primary} />
                                </TouchableOpacity>
                            )}
                            {user.profile.socials.whatsapp && (
                                <TouchableOpacity onPress={() => Linking.openURL(`https://wa.me/${user.profile.socials.whatsapp}`)}>
                                    <Ionicons name="logo-whatsapp" size={32} color={Colors.text.primary} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )} */}
            
          </View>
          {/* --- Botón de Amistad --- */}
          <View className="mt-6">
              <FriendshipButton profileUserId={user.id} />
          </View>
          </View>
      </ScrollView>
  );
}