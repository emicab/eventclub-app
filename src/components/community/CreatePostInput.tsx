import { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal, FlatList } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { Channel, Event } from '@/src/types'; // Assuming Event type is here
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

const createPost = async (formData: FormData) => {
  const { data } = await apiClient.post('/api/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const fetchEvents = async () => {
  const { data } = await apiClient.get('/api/events'); // Assuming this endpoint exists
  return data;
};

export default function CreatePostInput({ channel }: { channel: Channel }) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [postContent, setPostContent] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isEventModalVisible, setEventModalVisible] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', channel.slug] });
      setPostContent('');
      setImages([]);
      setSelectedEventId(null);
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'No se pudo crear.'),
  });

  const { data: events = [], isLoading: isLoadingEvents } = useQuery<Event[]>({ // Specify type Event[]
    queryKey: ['events-for-post-selector'],
    queryFn: fetchEvents,
  });

  const eventToLink = events?.find(e => e.id === selectedEventId);

  const handlePickImage = async () => {
    if (images.length >= 4) {
      Alert.alert('Límite alcanzado', 'Puedes subir un máximo de 4 imágenes.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      selectionLimit: 4 - images.length,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets]);
    }
  };

  const handlePost = () => {
    if (!postContent.trim() && !selectedEventId) return; // Allow posting with only an event link
    const formData = new FormData();
    if (postContent.trim()) {
      formData.append('content', postContent);
    }
    formData.append('channelId', channel.id);
    
    if (selectedEventId) {
      formData.append('eventId', selectedEventId);
    }

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
          className="flex-1 ml-3 text-dark font-medium"
          style={{ textAlignVertical: 'top', fontFamily: 'Inter_400Regular' }}
          multiline
          value={postContent}
          onChangeText={setPostContent}
        />
      </View>

      {eventToLink && (
        <View className="mt-2 p-2 bg-accent/20 rounded-lg flex-row items-center justify-between">
          <Text className="text-dark text-sm flex-1">
            Evento: <Text className="font-bold">{eventToLink.title}</Text>
            {eventToLink.date && ` (${new Date(eventToLink.date).toLocaleDateString()})`}
          </Text>
          <TouchableOpacity onPress={() => setSelectedEventId(null)} className="ml-2">
            <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
      )}

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
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={handlePickImage} className="flex-row items-center p-2">
            <Ionicons name="image-outline" size={24} color={Colors.text.secondary} />
            <Text className='ml-2 text-secondary'>Fotos</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEventModalVisible(true)} className="flex-row items-center p-2">
            <Ionicons name="calendar-outline" size={24} color={Colors.text.secondary} />
            <Text className='ml-2 text-secondary'>Evento</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={handlePost}
          disabled={(!postContent.trim() && !selectedEventId) || isPending}
          className={`py-2 px-4 rounded-full ${(!postContent.trim() && !selectedEventId) || isPending ? 'bg-accent/40' : 'bg-accent'}`}
        >
          {isPending ? <ActivityIndicator size="small" color={Colors.background} /> : <Text className="text-background font-bold">Publicar</Text>}
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={isEventModalVisible}
        onRequestClose={() => setEventModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background pt-10">
          <View className="p-4 flex-row justify-between items-center">
            <Text className="text-primary text-xl font-bold">Seleccionar Evento</Text>
            <TouchableOpacity onPress={() => setEventModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          {isLoadingEvents ? (
            <ActivityIndicator size="large" color={Colors.accent} className="mt-10" />
          ) : (
            <FlatList
              data={events}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`p-4 flex-row border-b border-glass-border ${selectedEventId === item.id ? 'bg-accent/20' : ''}`}
                  onPress={() => {
                    setSelectedEventId(item.id);
                    setEventModalVisible(false);
                  }}
                >
                  <Image source={{ uri: item.imageUrls[0] }} className="w-10 h-10 mr-6" />
                  <View>
                  <Text className="text-accent font-bold">{item.title}</Text>
                  {item.date && (
                    <Text className="text-secondary text-sm">Fecha: {new Date(item.date).toLocaleDateString()}</Text>
                  )}

                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="p-4 items-center">
                  <Text className="text-secondary">No hay eventos disponibles para seleccionar.</Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}