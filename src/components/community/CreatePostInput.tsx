import { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { Channel } from '@/src/types';
import * as ImagePicker from 'expo-image-picker';

const createPost = async (formData: FormData) => {
  const { data } = await apiClient.post('/api/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export default function CreatePostInput({ channel }: { channel: Channel }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', channel.slug] });
      setPostContent('');
      setImages([]); // CORRECCIÓN: Usar un array vacío en lugar de null
      // Alert.alert('Éxito', 'Tu publicación ha sido creada.');
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'No se pudo crear.'),
  });

  const handlePickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Límite alcanzado', 'Puedes subir un máximo de 4 imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // CORRECCIÓN: Usar el enum
      selectionLimit: 4 - images.length,
      allowsEditing: false, // Es mejor deshabilitar la edición para la selección múltiple
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const handlePost = () => {
    if (!postContent.trim()) return;
    const formData = new FormData();
    formData.append('content', postContent);
    formData.append('channelId', channel.id);
    
    images.forEach((image) => {
      // @ts-ignore
      formData.append('images', {
        uri: image.uri,
        name: image.fileName || `image.jpg`,
        type: image.mimeType || 'image/jpeg',
      });
    });
    mutate(formData);
  };

  return (
    <View className="bg-card p-4 rounded-lg border border-glass-border">
      <View className="flex-row">
        <Image source={{ uri: user?.profile?.avatarUrl || 'https://placehold.co/100' }} className="w-10 h-10 rounded-full" />
        <TextInput
          placeholder={`Compartiendo en #${channel.name}...`}
          placeholderTextColor={Colors.text.secondary}
          className="flex-1 ml-3 text-dark font-medium" // CORRECCIÓN: Usar 'text-primary' en lugar de 'text-dark'
          style={{ textAlignVertical: 'top', fontFamily: 'Inter_400Regular' }}
          multiline
          value={postContent}
          onChangeText={setPostContent}
        />
      </View>

      {images.length > 0 && (
        <View className="mt-4 flex-row flex-wrap">
          {images.map((img, index) => (
            <View key={index} className="w-1/4 p-1 relative">
              <Image source={{ uri: img.uri }} className="w-full aspect-square rounded-md" />
              <TouchableOpacity
                onPress={() => setImages(images.filter((_, i) => i !== index))}
                className="absolute top-0 right-0 bg-black/60 p-1 rounded-full"
              >
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row justify-between items-center mt-4 pt-2 border-t border-glass-border">
        <TouchableOpacity onPress={handlePickImage} className="flex-row items-center p-2">
          <Ionicons name="image-outline" size={24} color={Colors.text.secondary} />
          <Text className='ml-2 text-secondary'>Fotos/Videos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePost}
          disabled={!postContent || isPending}
          className={`py-2 px-4 rounded-full ${!postContent || isPending ? 'bg-accent/40' : 'bg-accent'}`}
        >
          {isPending ? <ActivityIndicator size="small" color={Colors.background} /> : <Text className="text-background font-bold">Publicar</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}