import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { UserProfile } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';
import { findOrCreateConversation } from '@/src/api/chat';
import { useMutation } from '@tanstack/react-query';

interface Props {
  friend: UserProfile;
}

export default function FriendListItem({ friend }: Props) {
  const router = useRouter();

  // Esta mutación se encarga de todo el flujo de iniciar un chat.
  const { mutate: startChat, isPending } = useMutation({
    mutationFn: () => findOrCreateConversation(friend.id),
    onSuccess: (data) => {
      // 2. Solo cuando la API responde con éxito, navegamos.
      // 'data.id' aquí es el verdadero ID de la conversación.
      router.push(`/chat/${data.id}`);
    },
    onError: (error) => {
      console.error("Error al iniciar el chat:", error);
      alert("No se pudo iniciar la conversación. Inténtalo de nuevo.");
    }
  });

  const handleSendMessage = () => {
    // TODO: Implementar navegación a la pantalla de chat con este amigo
    startChat();
    console.log(`Iniciar chat con ${friend.firstName}`);
  };

  return (
    <TouchableOpacity onPress={() => router.push({ pathname: '/user/[id]', params: { id: friend.id } })} className="flex-row items-center p-3 bg-card rounded-lg">
      <Image
        source={{ uri: friend.profile?.avatarUrl || 'https://placehold.co/100' }}
        className="w-12 h-12 rounded-full"
      />
      <View className="flex-1 ml-4">
        <Text className="text-dark font-bold">{friend.firstName} {friend.lastName}</Text>
        <Text className="text-secondary">@{friend.profile?.nickname}</Text>
      </View>
      <TouchableOpacity onPress={handleSendMessage} className="p-2">
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}