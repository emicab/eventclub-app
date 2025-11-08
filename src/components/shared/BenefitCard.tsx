import { View, Text, Image, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Benefit } from '@/src/types';
import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { useAuthStore } from '@/src/store/useAuthStore';

type BenefitCardProps = {
  benefit: Benefit & { isLocked?: boolean }; // Añadimos la propiedad isLocked
  userPoints?: number | undefined;

};

const deleteBenefit = async (id: string) => {
  await apiClient.delete(`/api/admin/benefits/${id}`);
};

const formatExpirationDate = (dateString?: string | null): string | null => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    // Formato ejemplo: "30 de Octubre"
    return format(date, "d 'de' MMMM", { locale: es }); 
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha inválida"; // O devolver null
  }
};

export default function BenefitCard({ benefit, userPoints}: BenefitCardProps ) {
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const needsMorePoints = !!benefit.pointCost && (userPoints ?? 0) < benefit.pointCost;
  const isLocked = !!(benefit.isLocked || needsMorePoints);
  
  // @ts-ignore
  const expirationText = formatExpirationDate(benefit.expiresAt);
  
  const { mutate: performDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteBenefit,
    onSuccess: () => {
      Alert.alert('Éxito', 'El beneficio ha sido eliminado.');
      queryClient.invalidateQueries({ queryKey: ['benefits'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo eliminar el beneficio.');
    },
  });

  // --- Lógica del Menú de Opciones ---
  const showAdminOptions = () => {
    // Confirmación simple antes de eliminar
    const confirmDelete = () => {
      Alert.alert(
        'Eliminar Beneficio',
        `¿Estás seguro de que quieres eliminar "${benefit.title}"? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: () => performDelete(benefit.id) },
        ]
      );
    };

    // Usamos ActionSheet en iOS y un Alert simple en Android
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Editar Beneficio', 'Eliminar Beneficio'],
          destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            router.push(`/benefits/edit/${benefit.id}`); // Navegar a la pantalla de edición
          } else if (buttonIndex === 2) {
            confirmDelete();
          }
        }
      );
    } else {
      Alert.alert(
        'Opciones de Administrador',
        `¿Qué deseas hacer con "${benefit.title}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Editar', onPress: () => router.push(`/benefits/edit/${benefit.id}`) },
          { text: 'Eliminar', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/benefits/${benefit.id}`)} 
      disabled={isLocked} // Deshabilitamos el toque si está bloqueado
      className={`w-full bg-white/5 border border-white/20 rounded-full py-4 px-6 my-2 relative`}
    >
      <View className={`flex-row items-center justify-between ${isLocked ? 'opacity-30' : ''} ${user?.role === 'ADMIN' ? 'mr-10' : ''}`}>
        <View className="ml-4">
          {benefit.company.logoUrl ? (
            <Image
              source={{ uri: benefit.company.logoUrl }}
              className=""
              
              width={100}
              height={80}
            />
          ) : (
            <Text className="text-primary text-lg" style={{ fontFamily: 'Inter_700Bold' }}>{benefit.company.name}</Text>
          )}
        </View>
        <View className="h-12 w-px bg-white/20 mx-4" />
        <View className="items-center">
          <Text className="text-primary font-medium text-sm mb-2">{benefit.title}</Text>
          <View className="bg-accent rounded-full px-4 py-2 mx-4">
            <Text className="text-white font-medium text-sm" style={{ fontFamily: 'Inter_700Bold' }}>
              {benefit.pointCost ? `Canjear ${benefit.pointCost} Pts` : `Canjear gratis`}
            </Text>
          </View>
          {expirationText && <Text className="text-secondary text-xs mt-2">Valido hasta el {expirationText}</Text>}
        </View>
      </View>

      {user?.role === 'ADMIN' && (
        <TouchableOpacity
          onPress={showAdminOptions}
          className="absolute top-8 right-4 p-2 bg-black/30 rounded-full"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.text.primary} />
        </TouchableOpacity>
      )}

      {/* --- OVERLAY DE BLOQUEO CON BLUR --- */}
      {isLocked && (
        <View className="absolute inset-0 rounded-3xl">
            <BlurView
              intensity={10}
              tint="dark"
              className="absolute rounded-2xl inset-0 flex-col justify-center items-center p-2"
            >
              <Ionicons name="lock-closed" size={24} color={Colors.text.secondary} />
              <Text className="text-secondary text-center font-bold mt-1">
                {needsMorePoints ? `Necesitas ${benefit.pointCost} puntos` : 'Gana más puntos para desbloquear'}
              </Text>
            </BlurView>
        </View>
      )}
    </TouchableOpacity>
  );
}
