// En app/profile/my-qr.tsx
import { View, Text } from 'react-native';
import { useAuthStore } from '@/src/store/useAuthStore';
import QRCode from 'react-native-qrcode-svg';
import Colors from '@/src/constants/Colors';
import { Stack } from 'expo-router';

export default function MyQrScreen() {
  // Obtenemos los datos del usuario actual del store de Zustand
  const { user } = useAuthStore();

  if (!user) {
    return <Text>Cargando tu información...</Text>;
  }

  console.log(user)

  // Creamos el contenido del QR. Usar un objeto JSON es una buena práctica
  // para poder añadir más acciones en el futuro.
  const qrContent = JSON.stringify({
    action: 'viewProfile',
    userId: user.id,
  });

  return (
    <View className="flex-1 bg-background justify-center my-safe items-center gap-8 p-4">
      <Stack.Screen options={{ title: 'Mi Código QR', headerTintColor: Colors.text.primary }} />
      <Text className="text-primary text-3xl font-bold">Mi Código QR</Text>
      <View className="bg-white p-6 rounded-2xl">
        <QRCode
          value={qrContent}
          size={250}
          backgroundColor="white"
          color="black"
        />
      </View>
      <View className="items-center">
        <Text className="text-primary text-2xl font-bold">{user.firstName} {user.lastName}</Text>
        {user.username && (
          <Text className="text-secondary text-lg">@{user.username}</Text>
        )}
        <Text className="text-secondary text-center mt-4 max-w-xs">
          Pídele a tu amigo que escanee este código para conectar en EventClub.
        </Text>
      </View>
    </View>
  );
}