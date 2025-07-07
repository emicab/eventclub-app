// En app/profile/scan-qr.tsx
import { View, Text, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { useRouter, Stack } from 'expo-router';

export default function ScanQrScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Pedimos permiso para usar la cámara al cargar la pantalla
    requestPermission();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    if (scanned) return; // Evitamos escanear múltiples veces
    setScanned(true);

    try {
      const qrData = JSON.parse(data);
      // Verificamos si es un QR de nuestra app y para la acción correcta
      if (qrData.action === 'viewProfile' && qrData.userId) {
        // Navegamos a la pantalla de perfil del usuario escaneado
        router.replace({ pathname: '/user/[id]', params: { id: qrData.userId } });
      } else {
        Alert.alert('Código QR no válido', 'Este código no parece ser de EventClub.');
        setTimeout(() => setScanned(false), 2000); // Permitir volver a escanear
      }
      // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      Alert.alert('Error', 'No se pudo leer el código QR.');
      setTimeout(() => setScanned(false), 2000);
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <Text className="text-primary text-center">Necesitamos tu permiso para usar la cámara.</Text>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        style={StyleSheet.absoluteFillObject}
      />
      {/* Puedes añadir una superposición o un overlay aquí para guiar al usuario */}
    </View>
  );
}