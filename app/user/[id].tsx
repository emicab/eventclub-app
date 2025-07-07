// En app/user/[id].tsx
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { UserProfile } from '@/src/types';
import FriendshipButton from '@/src/components/friends/FriendshipButton'; // Importaremos este componente a continuación

// Función para obtener el perfil público de un usuario
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data } = await apiClient.get(`/api/users/${userId}`); // Asumimos que tienes o crearás este endpoint
  return data;
};

export default function UserProfileScreen() {
  const { id: userId } = useLocalSearchParams();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId as string),
    enabled: !!userId,
  });

  if (isLoading) return <ActivityIndicator className="flex-1" />;
  if (error || !user) return <Text>No se pudo cargar el perfil del usuario.</Text>;

  return (
    <View className="flex-1 bg-background pt-6 my-safe px-6">
      <Stack.Screen options={{ title: `@${user.profile?.nickname || user.firstName}` }} />
      
      <View className="items-center">
        <Image 
          source={{ uri: user.profile?.avatarUrl || 'https://placehold.co/100' }}
          className="w-32 h-32 rounded-full border-4 border-accent"
        />
        <Text className="text-primary text-3xl font-bold mt-4">{user.firstName} {user.lastName}</Text>
        <Text className="text-secondary text-xl">@{user.profile?.nickname}</Text>
        <Text className="text-secondary text-center mt-2">{user.profile?.bio}</Text>
      </View>

      <View className="mt-8">
        {/* Aquí irá nuestro botón de amistad inteligente */}
        <FriendshipButton profileUserId={user.id} />
      </View>
    </View>
  );
}