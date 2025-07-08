// En app/chat/index.tsx
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '@/src/api/chat';
import { useRouter, Stack } from 'expo-router';
import { useAuthStore } from '@/src/store/useAuthStore';

// Componente para cada item de la lista
const ConversationListItem = ({ item }) => {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
    
    // El backend nos devuelve ambos participantes, filtramos para quedarnos con el otro
    const otherParticipant = item.participants.find(p => p.id !== currentUser?.id);

    return (
        <TouchableOpacity onPress={() => router.push(`/chat/${item.id}`)} className="flex-row items-center p-3">
            <Image source={{ uri: otherParticipant?.profile?.avatarUrl || 'https://placehold.co/100' }} className="w-14 h-14 rounded-full" />
            <View className="ml-4 flex-1">
                <Text className="text-primary font-bold text-lg">{otherParticipant?.firstName}</Text>
                <Text className="text-secondary mt-1" numberOfLines={1}>{item.messages?.[0]?.text || 'Inicia la conversación...'}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default function ConversationsScreen() {
    const { data: conversations, isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: getConversations,
    });

    if (isLoading) return <ActivityIndicator />;

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ title: 'Mensajes' }} />
            <FlatList
                data={conversations}
                renderItem={({ item }) => <ConversationListItem item={item} />}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View className="h-px bg-glass-border ml-20" />}
            />
        </View>
    );
}