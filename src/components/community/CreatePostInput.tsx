import { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';

// Función que llama a la API para crear un post
const createPost = async (content: string) => {
  const { data } = await apiClient.post('/api/posts', { content });
  return data;
};

export default function CreatePostInput() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isFocused, setIsFocused] = useState(false);
  const [postContent, setPostContent] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Cuando el post se crea con éxito:
      // 1. Invalidamos la query de 'posts' para que el feed se actualice automáticamente.
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // 2. Reseteamos el input.
      setPostContent('');
      setIsFocused(false);
      //Alert.alert('Éxito', 'Tu publicación ha sido creada.');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo crear la publicación.');
    },
  });

  const handlePost = () => {
    if (!postContent.trim()) return;
    mutate(postContent);
  };

  // Vista colapsada
  if (!isFocused) {
    return (
      <TouchableOpacity
        onPress={() => setIsFocused(true)}
        className="flex-row items-center bg-card p-3 rounded-lg border border-glass-border"
      >
        <Image
          source={{ uri: user?.profile?.avatarUrl || 'https://placehold.co/100' }}
          className="w-10 h-10 rounded-full"
        />
        <Text className="text-secondary ml-3">¿En qué estás pensando, {user?.firstName}?</Text>
      </TouchableOpacity>
    );
  }

  // Vista expandida
  return (
    <View className="bg-card p-4 rounded-lg border border-glass-border">
      <TextInput
        placeholder={`¿Qué quieres compartir, ${user?.firstName}?`}
        placeholderTextColor={Colors.text.secondary}
        className="text-dark h-24"
        style={{ textAlignVertical: 'top' }}
        multiline
        autoFocus={true}
        value={postContent}
        onChangeText={setPostContent}
      />
      <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-glass-border">
        <TouchableOpacity className="flex-row items-center p-2">
          <Ionicons name="image-outline" size={24} color={Colors.text.secondary} />
          <Text className="text-secondary ml-2">Foto/Video</Text>
        </TouchableOpacity>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => setIsFocused(false)} className="p-2">
            <Text className="text-secondary">Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePost}
            disabled={!postContent || isPending}
            className={`py-2 px-4 rounded-full ml-2 ${!postContent || isPending ? 'bg-accent/40' : 'bg-accent'}`}
          >
            {isPending ? <ActivityIndicator size="small" color={Colors.background} /> : <Text className="text-background font-bold">Publicar</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}