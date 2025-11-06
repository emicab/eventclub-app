// En app/verification-success.tsx
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function VerificationSuccessScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center bg-background p-6">
      <Ionicons name="checkmark-circle" size={80} color="green" />
      <Text className="text-primary text-2xl font-bold mt-4">¡Correo Verificado!</Text>
      <Text className="text-secondary text-center mt-2">
        Tu cuenta ha sido verificada con éxito. Ya puedes disfrutar de todas las funcionalidades.
      </Text>
      <Button title="Volver al Inicio" onPress={() => router.replace('/(tabs)/community')} />
    </View>
  );
}