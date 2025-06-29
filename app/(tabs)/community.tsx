// --- app/(tabs)/community.tsx (Corregido y Funcional) ---
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
  RefreshControl,
} from 'react-native';
import PostCard, { Post } from '@/src/components/shared/PostCard';
import CreatePostInput from '@/src/components/community/CreatePostInput';
import {  useState } from 'react';
import Colors from '@/src/constants/Colors';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { useSocketListeners } from '@/src/hooks/useSocketListener';

const channels = [
  { id: 'general', title: 'Argentos' },
  { id: 'marketplace', title: 'Clasificados' },
  { id: 'meetups', title: 'Juntadas' },
  { id: 'help', title: 'Preguntas' },
];

const fetchPosts = async (): Promise<Post[]> => {
  // En el futuro, podríamos pasar el `selectedChannel` aquí
  const { data } = await apiClient.get('/api/posts');
  return data;
};


export default function CommunityScreen() {
  useSocketListeners();
  const [selectedChannel, setSelectedChannel] = useState('general');

  const {
    data: posts,
    isLoading,
    isError,
    error,
    refetch, // Función para recargar manualmente (pull-to-refresh)
  } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetchPosts(),
    refetchOnWindowFocus: true
  });

  

  const renderHeader = () => (
    <View className="p-6 pb-0">
      <Text className="text-primary text-3xl" style={{ fontFamily: 'Inter_700Bold' }}>
        Comunidad
      </Text>
      <Text className="text-secondary mt-1 mb-6" style={{ fontFamily: 'Inter_400Regular' }}>
        Conéctate, comparte y descubre.
      </Text>
      <CreatePostInput />
      <View className="my-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {channels.map((channel) => (
            <TouchableOpacity
              key={channel.id}
              onPress={() => setSelectedChannel(channel.id)}
              className={`py-2 px-4 rounded-full mr-3 border ${
                selectedChannel === channel.id
                  ? 'bg-accent border-accent'
                  : 'bg-card border-glass-border'
              }`}
            >
              <Text className={`font-bold ${
                selectedChannel === channel.id ? 'text-background' : 'text-dark'
              }`}>{channel.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderContent = () => {
    // @ts-ignore
    if (isLoading && (!posts || posts.length === 0)) {
        return <ActivityIndicator size="large" color={Colors.accent} className="mt-16" />;
    }
    if (isError) {
        return <Text className="text-error text-center mt-16">Error al cargar el feed: {(error as any).message}</Text>;
    }
    // El mensaje de "no hay posts" se maneja con ListEmptyComponent en FlatList

    // Por ahora, solo mostramos contenido en el canal general
    if (selectedChannel !== 'general') {
        const channelInfo = channels.find(c => c.id === selectedChannel);
        return (
            <View className="flex-1 justify-center items-center py-20">
                <Text className="text-secondary text-center">
                    Contenido para el canal "{channelInfo?.title}" aparecerá aquí.
                </Text>
            </View>
        );
    }

    return (
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 24 }} />}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        ListEmptyComponent={() => (
            <Text className="text-secondary text-center mt-16">No hay publicaciones todavía. ¡Sé el primero!</Text>
        )}
        refreshControl={
            <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor={Colors.accent}
            />
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background mt-safe pt-6">
      {renderHeader()}
      <View className="flex-1 mt-4">
        {renderContent()}
      </View>
    </SafeAreaView>
  );
}
