// En src/components/friends/FriendshipButton.tsx
import { Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/src/api/friends'; // Usamos el alias para todas nuestras funciones de la API
import { useAuthStore } from '@/src/store/useAuthStore';
import apiClient from '@/src/lib/axios';

// Endpoint para obtener el estado de la amistad con un usuario específico
const fetchFriendshipStatus = async (friendId: string) => {
    const { data } = await apiClient.get(`/api/friends/status/${friendId}`); // Necesitaremos crear este endpoint
    return data; // Devolverá algo como { status: 'NOT_FRIENDS' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS' }
};


export default function FriendshipButton({ profileUserId }: { profileUserId: string }) {
  const { user: currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Query para saber el estado actual de la amistad
  const { data: friendship, isLoading } = useQuery({
    queryKey: ['friendshipStatus', profileUserId],
    queryFn: () => fetchFriendshipStatus(profileUserId),
  });

  // Mutaciones para cada acción posible
  const { mutate: sendRequest, isPending: sending } = useMutation({
    mutationFn: api.sendFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendshipStatus', profileUserId] }),
  });

  const { mutate: acceptRequest, isPending: accepting } = useMutation({
    mutationFn: api.acceptFriendRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendshipStatus', profileUserId] }),
  });

  const { mutate: removeFriend, isPending: removing } = useMutation({
    mutationFn: api.removeFriendship,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['friendshipStatus', profileUserId] }),
  });


  if (isLoading) return <ActivityIndicator />;
  // No mostramos el botón si el usuario está viendo su propio perfil
  if (currentUser?.id === profileUserId) return null;

  const handleRemoveFriend = () => {
    Alert.alert(
      "Eliminar Amigo",
      "¿Estás seguro de que quieres eliminar a este amigo?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => removeFriend(profileUserId) }
      ]
    );
  };


  // Lógica para renderizar el botón correcto
  switch (friendship?.status) {
    case 'FRIENDS':
      return (
        <TouchableOpacity onPress={handleRemoveFriend} disabled={removing} className="bg-red-500 p-4 rounded-lg items-center">
          <Text className="text-white font-bold">Eliminar Amigo</Text>
        </TouchableOpacity>
      );
    case 'PENDING_SENT': // Yo envié la solicitud
      return (
        <TouchableOpacity disabled className="bg-gray-600 p-4 rounded-lg items-center">
          <Text className="text-white font-bold">Solicitud Enviada</Text>
        </TouchableOpacity>
      );
    case 'PENDING_RECEIVED': // Él/ella me envió la solicitud
      return (
        <TouchableOpacity onPress={() => acceptRequest(profileUserId)} disabled={accepting} className="bg-green-500 p-4 rounded-lg items-center">
          <Text className="text-white font-bold">Aceptar Solicitud</Text>
        </TouchableOpacity>
      );
    default: // 'NOT_FRIENDS' o cualquier otro caso
      return (
        <TouchableOpacity onPress={() => sendRequest(profileUserId)} disabled={sending} className="bg-accent p-4 rounded-lg items-center">
          <Text className="text-background font-bold">Añadir Amigo</Text>
        </TouchableOpacity>
      );
  }
}