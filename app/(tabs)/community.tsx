// --- app/(tabs)/community.tsx (Lógica Final) ---
import { fetchChannels, fetchPostsByChannel } from '@/src/api/community';
import CreatePostInput from '@/src/components/community/CreatePostInput';
import PostCard from '@/src/components/shared/PostCard';
import Colors from '@/src/constants/Colors';
import { useSocketListeners } from '@/src/hooks/useSocketListener';
import { Channel } from '@/src/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function CommunityScreen() {
  useSocketListeners();
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>();

  // 1. Query para obtener la lista de canales desde la API
  const { data: channels, isLoading: isLoadingChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: fetchChannels,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        // Reordenar: poner el canal "Todos" primero
        const sortedChannels = [
          ...data.filter(c => c.slug === 'Todos'),
          ...data.filter(c => c.slug !== 'Todos'),
        ];
    
        // Seleccionar el canal "Todos" o el primero disponible
        setSelectedChannel((prev) => prev ?? sortedChannels[0]);
      }
    },
  });

  console.log("channels ::", selectedChannel)

  useEffect(() => {
    if (!selectedChannel && channels?.length) {
      const sorted = [
        ...channels.filter(c => c.slug === 'Todos'),
        ...channels.filter(c => c.slug !== 'Todos'),
      ];
      setSelectedChannel(sorted[0]);
    }
  }, [channels]);

  const orderedChannels = channels
  ? [
      ...channels.filter((c) => c.slug === 'Todos'),
      ...channels.filter((c) => c.slug !== 'Todos'),
    ]
  : [];

  // 2. Query para obtener los posts del canal seleccionado
  const { data: posts, isLoading: isLoadingPosts, refetch } = useQuery({
    queryKey: ['posts', selectedChannel?.slug],
    queryFn: () => fetchPostsByChannel(selectedChannel!.slug),
    enabled: !!selectedChannel, // La query se ejecuta en cuanto `selectedChannel` tiene un valor.
  });

  const ListHeader = () => (
    <View className="px-6 mb-6">
      <Text className="text-primary text-3xl" style={{ fontFamily: 'Inter_700Bold' }}>Comunidad</Text>
      <Text className="text-secondary mt-1 mb-6" style={{ fontFamily: 'Inter_400Regular' }}>Conéctate, comparte y descubre.</Text>

      {/* El input de posteo ahora se muestra siempre que haya un canal seleccionado. */}
      {selectedChannel ? (
        <CreatePostInput channel={selectedChannel} />
      ) : (
        <ActivityIndicator color={Colors.accent} />
      )}

      {/* Selector de Canales */}
      <View className="mt-8">
        {isLoadingChannels ? <ActivityIndicator color={Colors.accent} /> : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {orderedChannels?.map((channel) => (
              <TouchableOpacity
                key={channel.id}
                onPress={() => setSelectedChannel(channel)}
                className={`py-2 px-4 rounded-full mr-3 border ${selectedChannel?.id === channel.id ? 'bg-accent border-accent' : 'bg-card border-glass-border'}`}
              >
                <Text className={`font-bold ${selectedChannel?.id === channel.id ? 'text-background' : 'text-dark'}`}>{channel.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background pt-10 mt-safe">
      <FlatList
        data={posts}
        renderItem={({ item }) => <View className="px-6"><PostCard post={item} /></View>}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoadingPosts ? <ActivityIndicator size="large" color={Colors.accent} className="mt-16" /> : (
            <Text className="text-secondary text-center mt-16">No hay publicaciones en este canal.</Text>
          )
        }
        ItemSeparatorComponent={() => <View className="h-4" />}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isLoadingPosts} onRefresh={refetch} tintColor={Colors.accent} />}
      />
    </SafeAreaView>
  );
}
