// --- app/profile/edit.tsx (Solución Completa y Final) ---
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
  Switch,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import Colors from '@/src/constants/Colors';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '@/src/types';
import { useAuthStore } from '@/src/store/useAuthStore'; // Importamos el store

// --- Tipos y Funciones de API ---
type EditableProfileData = {
  firstName?: string;
  lastName?: string;
  nickname?: string;
  bio?: string;
  city?: string;
  hometown?: string;
  dateOfBirth?: string;
  showInfo?: boolean;
  skills?: string[];
  jobSeeking?: string;
};

const fetchMyProfile = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get('/api/users/me');
  return data;
};

const updateMyProfile = async (profileData: EditableProfileData) => {
  const { data } = await apiClient.put('/api/users/me', profileData);
  return data;
};

const uploadAvatar = async (file: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();
    // @ts-ignore
    formData.append('avatar', {
        uri: file.uri,
        name: file.fileName || 'avatar.jpg',
        type: file.mimeType || 'image/jpeg',
    });
    const { data } = await apiClient.post('/api/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

// --- Helper para formatear la fecha sin problemas de timezone ---
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  // Obtenemos la función de login (que usamos para actualizar el store) de Zustand
  const { login: updateUserInStore } = useAuthStore();

  // --- Estados del Formulario ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [hometown, setHometown] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [skills, setSkills] = useState('');
  const [jobSeeking, setJobSeeking] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // --- Lógica de Datos ---
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
  });

  // EFECTO PARA RELLENAR EL FORMULARIO
  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || '');
      setLastName(profileData.lastName || '');
      setNickname(profileData.profile?.nickname || '');
      setBio(profileData.profile?.bio || '');
      setCity(profileData.profile?.city || '');
      setHometown(profileData.profile?.hometown || '');
      if (profileData.profile?.dateOfBirth) {
        // CORRECCIÓN: Creamos la fecha compensando la zona horaria para que se muestre correctamente.
        const utcDate = new Date(profileData.profile.dateOfBirth);
        const localDate = new Date(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate());
        setDateOfBirth(localDate);
      }
      setShowInfo(profileData.profile?.showInfo ?? true);
      setSkills(profileData.profile?.skills?.join(', ') || '');
      setJobSeeking(profileData.profile?.jobSeeking || '');
      setAvatarUri(profileData.profile?.avatarUrl || null);
    }
  }, [profileData]);

  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      // --- CORRECCIÓN AQUÍ ---
      // En lugar de pasar 'data', pasamos 'data.profile', que es el objeto UserProfile correcto.
      // En el backend, la respuesta es { message: '...', profile: UserProfile }
      updateUserInStore(useAuthStore.getState().token!, data.profile);
      Alert.alert('Éxito', 'Tu perfil ha sido actualizado.');
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      router.back();
    },
    onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'No se pudo actualizar.'),
  });
  
  const { mutate: uploadNewAvatar, isPending: isUploading } = useMutation({
      mutationFn: uploadAvatar,
      onSuccess: (data) => {
          setAvatarUri(data.profile.avatarUrl);
          // Actualizamos el store también después de cambiar el avatar
          updateUserInStore(useAuthStore.getState().token!, data.profile);
          queryClient.invalidateQueries({ queryKey: ['myProfile'] });
          Alert.alert('Éxito', 'Tu avatar ha sido actualizado.');
      },
      onError: (error: any) => Alert.alert('Error', error.response?.data?.message || 'No se pudo subir la imagen.'),
  });

  const handleSave = () => {
    const profileDataToSave: EditableProfileData = {
      firstName, lastName, nickname, bio, city, hometown,
      // CORRECCIÓN: Usamos nuestro helper para enviar la fecha en formato magickwoods-MM-DD
      dateOfBirth: dateOfBirth ? formatDateForAPI(dateOfBirth) : undefined,
      showInfo,
      skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      jobSeeking,
    };
    updateProfile(profileDataToSave);
  };
  
  // --- LÓGICA DE IMAGEN Y FECHA ---
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) uploadNewAvatar(result.assets[0]);
  };

  const handleConfirmDate = (date: Date) => {
    setDatePickerVisibility(false);
    setDateOfBirth(date);
  };

  if (isLoadingProfile) {
    return <ActivityIndicator size="large" color={Colors.accent} className="flex-1 bg-background" />;
  }

  return (
    <SafeAreaView className="flex-1 mt-safe bg-background pt-6">
      <Stack.Screen options={{ title: "Editar Perfil", headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
      <ScrollView>
        <View className="px-6 space-y-6">
          
          <View className="items-center">
            <TouchableOpacity onPress={handlePickImage} disabled={isUploading}>
              <Image source={{ uri: avatarUri || 'https://placehold.co/200' }} className="w-32 h-32 rounded-full" />
              <View className="absolute bottom-0 right-0 bg-accent p-2 rounded-full border-2 border-background">
                {isUploading ? <ActivityIndicator size="small" color={Colors.background} /> : <Ionicons name="camera-outline" size={24} color={Colors.background} />}
              </View>
            </TouchableOpacity>
          </View>
          
          <View>
            <Text className="text-primary text-lg mt-6 mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Información Personal</Text>
            <TextInput className="bg-card text-dark font-semibold text-base rounded-lg p-4 w-full border border-glass-border focus:border-accent" placeholder="Nombre" value={firstName} onChangeText={setFirstName} />
            <TextInput className="bg-card text-dark font-semibold text-base rounded-lg p-4 w-full border border-glass-border focus:border-accent mt-3" placeholder="Apellido" value={lastName} onChangeText={setLastName} />
            <TextInput className="bg-card text-dark font-semibold text-base rounded-lg p-4 w-full border border-glass-border focus:border-accent mt-3" placeholder="Apodo" value={nickname} onChangeText={setNickname} />
            <TouchableOpacity onPress={() => setDatePickerVisibility(true)} className="bg-card rounded-lg p-4 w-full mt-3">
              <Text className={dateOfBirth ? 'text-dark font-semibold' : 'text-secondary'}>{dateOfBirth ? dateOfBirth.toLocaleDateString('es-ES') : 'Fecha de Nacimiento'}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisibility(false)}
              date={dateOfBirth || new Date()}
              confirmTextIOS="Confirmar"
              cancelTextIOS="Cancelar"
            />
          </View>
          
          <View>
            <Text className="text-primary text-lg mt-6 mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Sobre mí</Text>
            <TextInput className="bg-card text-dark font-semibold rounded-lg px-4 w-full h-24 border border-glass-border focus:border-accent" multiline placeholder="Bio" value={bio} onChangeText={setBio} />
            <TextInput className="bg-card text-dark font-semibold text-base rounded-lg p-4 w-full border border-glass-border focus:border-accent mt-3" placeholder="Ciudad Actual" value={city} onChangeText={setCity} />
            <TextInput className="bg-card text-dark font-semibold text-base rounded-lg p-4 w-full border border-glass-border focus:border-accent mt-3" placeholder="Ciudad de Origen" value={hometown} onChangeText={setHometown} />
            <View className="flex-row justify-between items-center bg-card p-4 rounded-lg mt-3">
              <Text className="text-dark font-semibold">Mostrar mi información (edad, ciudad)</Text>
              <Switch value={showInfo} onValueChange={setShowInfo} trackColor={{ false: '#333', true: Colors.accent }} thumbColor={Colors.text.primary} />
            </View>
          </View>

          <View>
            <Text className="text-primary text-lg mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Perfil Laboral (Privado)</Text>
             <TextInput className="bg-card text-dark font-semibold text-base rounded-lg p-4 w-full border border-glass-border focus:border-accent" placeholder="Rubro de búsqueda (ej: IT, Diseño)" value={jobSeeking} onChangeText={setJobSeeking} />
            <TextInput className="bg-card text-dark font-semibold text-base rounded-lg p-4 w-full border border-glass-border focus:border-accent mt-3" placeholder="Habilidades (separadas por coma)" value={skills} onChangeText={setSkills} />
          </View>

          <TouchableOpacity
            className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40 mt-4"
            onPress={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? <ActivityIndicator color={Colors.background} /> : (
              <Text className="text-background text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
