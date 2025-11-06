import {
    SafeAreaView,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    ScrollView,
    Image,
    Platform,
  } from 'react-native';
  import { useState } from 'react';
  import { Stack, useRouter } from 'expo-router';
  import { useMutation, useQueryClient } from '@tanstack/react-query';
  import apiClient from '@/src/lib/axios';
  import Colors from '@/src/constants/Colors';
  import * as ImagePicker from 'expo-image-picker';
  import { Ionicons } from '@expo/vector-icons';
  
  // API call para crear la compañía
  const createCompany = async (formData: FormData) => {
    const { data } = await apiClient.post('/api/admin/companies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  };
  
  export default function CreateCompanyScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
  
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [city, setCity] = useState('');
    const [logo, setLogo] = useState<ImagePicker.ImagePickerAsset | null>(null);
  
    const { mutate, isPending } = useMutation({
      mutationFn: createCompany,
      onSuccess: () => {
        Alert.alert('Éxito', 'La empresa ha sido creada.');
        queryClient.invalidateQueries({ queryKey: ['adminCompanies'] }); // Invalida la lista de compañías
        router.back();
      },
      onError: (error: any) =>
        Alert.alert('Error', error.response?.data?.message || 'No se pudo crear la empresa.'),
    });
  
    const handlePickImage = async () => {
      // No se necesitan permisos para la galería en web, pero sí en móvil
      if (Platform.OS !== 'web') {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
              Alert.alert('Permiso denegado', 'Necesitas dar permiso para acceder a tus fotos.');
              return;
          }
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1], // Logo cuadrado
        quality: 0.8,
      });
  
      if (!result.canceled) {
        setLogo(result.assets[0]);
      }
    };
  
    const handleCreate = () => {
      if (!name || !city) {
        Alert.alert('Error', 'El nombre y la ciudad son obligatorios.');
        return;
      }
  
      const formData = new FormData();
      formData.append('name', name);
      formData.append('city', city);
      if (description) formData.append('description', description);
  
      if (logo) {
        // @ts-ignore
        formData.append('logo', {
          uri: logo.uri,
          name: logo.fileName || 'logo.jpg',
          type: logo.mimeType || 'image/jpeg',
        });
      }
  
      mutate(formData);
    };
  
    return (
      <SafeAreaView className="flex-1 my-safe bg-background pt-6">
        <Stack.Screen options={{ title: "Crear Empresa", headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
        <ScrollView keyboardShouldPersistTaps="handled">
          <View className="p-6 space-y-4">
            <Text className="text-primary mb-4 text-2xl" style={{ fontFamily: 'Inter_700Bold' }}>
              Nueva Empresa Aliada
            </Text>
  
            <TouchableOpacity
              onPress={handlePickImage}
              className="w-32 h-32 bg-card border border-glass-border rounded-full justify-center items-center self-center"
            >
              {logo ? (
                <Image source={{ uri: logo.uri }} className="w-32 h-32 rounded-full" />
              ) : (
                <View className='items-center'>
                  <Ionicons name="camera" size={32} color={Colors.text.secondary} />
                  <Text className="text-secondary text-xs mt-1">Subir Logo</Text>
                </View>
              )}
            </TouchableOpacity>
  
            <TextInput
              className="bg-card my-1 text-dark font-bold text-lg rounded-lg p-4 w-full border border-glass-border focus:border-accent"
              placeholder="Nombre de la Empresa"
              placeholderTextColor={Colors.text.secondary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              className="bg-card my-1 text-dark text-lg rounded-lg p-4 w-full border border-glass-border focus:border-accent"
              placeholder="Ciudad"
              placeholderTextColor={Colors.text.secondary}
              value={city}
              onChangeText={setCity}
            />
            <TextInput
              className="bg-card my-1 text-dark text-lg rounded-lg p-4 w-full h-24 border border-glass-border focus:border-accent"
              placeholder="Descripción corta (opcional)"
              placeholderTextColor={Colors.text.secondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />
  
            <TouchableOpacity
              className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40 mt-8"
              onPress={handleCreate}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <Text className="text-background text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                  Crear Empresa
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }