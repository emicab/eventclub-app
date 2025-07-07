// En src/components/friends/FriendRequestItem.tsx
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useAcceptFriendRequest, useRemoveFriendship } from '@/src/hooks/useFriends';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';

export default function FriendRequestItem({ request }: { request: any }) {
  const { mutate: acceptRequest, isPending: isAccepting } = useAcceptFriendRequest();
  const { mutate: rejectRequest, isPending: isRejecting } = useRemoveFriendship();
  
  const requester = request.requester;

  return (
    <View className="flex-row items-center p-3 bg-card rounded-lg">
      <Image
        source={{ uri: requester.profile?.avatarUrl || 'https://placehold.co/100' }}
        className="w-12 h-12 rounded-full"
      />
      <View className="flex-1 ml-4">
        <Text className="text-primary font-bold">{requester.firstName} {requester.lastName}</Text>
        <Text className="text-secondary">quiere ser tu amigo.</Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity onPress={() => rejectRequest(requester.id)} disabled={isRejecting || isAccepting}>
            <Ionicons name="close-circle" size={32} color={Colors.error} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => acceptRequest(requester.id)} disabled={isAccepting || isRejecting}>
            <Ionicons name="checkmark-circle" size={32} color={Colors.success} />
        </TouchableOpacity>
      </View>
    </View>
  );
}