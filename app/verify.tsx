import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../src/lib/axios';
import Colors from '../src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

// Pantalla para verificar la cuenta mediante un código (6 dígitos)
export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams() as { email?: string };

  const [code, setCode] = useState('');

  // Mutación para enviar el código al backend
  const { mutate: verifyCode, isLoading: verifying } = useMutation({
    mutationFn: async (payload: { email?: string; code: string }) => {
      const { data } = await apiClient.post('/api/auth/verify', payload);
      return data;
    },
    onSuccess: () => {
      // Al verificar correctamente, redirigimos a la pantalla de éxito
      router.replace('/verification-success');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Error al verificar el código. Intenta de nuevo.';
      Alert.alert('Error de verificación', message);
    }
  });

  // Mutación para reenviar el código (si contamos con email)
  const { mutate: resendCode, isLoading: resending } = useMutation({
    mutationFn: async (payload: { email: string }) => {
      const { data } = await apiClient.post('/api/auth/resend-verification', payload);
      return data;
    },
    onSuccess: () => {
      Alert.alert('Enviado', 'Hemos reenviado el código a tu correo. Revisa la bandeja de entrada y también la carpeta de spam.');
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'No se pudo reenviar el código. Intenta más tarde.';
      Alert.alert('Error', message);
    }
  });

  const handleSubmit = () => {
    if (!code || code.trim().length < 4) {
      Alert.alert('Código inválido', 'Ingresa el código que recibiste por correo.');
      return;
    }
    verifyCode({ email, code: code.trim() });
  };

  const handleResend = () => {
    if (!email) {
      Alert.alert('Email no disponible', 'No podemos reenviar el código porque no se proporcionó el email.');
      return;
    }
    resendCode({ email });
  };

  return (
    <SafeAreaView className="flex-1 bg-background pt-10 px-6">
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-6">
          <Ionicons name="mail-open" size={64} color={Colors.accent} />
          <Text className="text-primary text-2xl font-bold mt-4">Verificación por código</Text>
          <Text className="text-secondary text-center mt-2">Ingresa el código que te enviamos por correo para activar tu cuenta.</Text>
          {email && <Text className="text-secondary text-center mt-2">Código enviado a: {email}</Text>}
        </View>

        <View>
          <Text className="text-secondary mb-2">Código</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Ingresa el código"
            placeholderTextColor={Colors.text.secondary}
            keyboardType="numbers-and-punctuation"
            maxLength={6}
            className="bg-black/10 text-primary rounded-lg p-4 text-lg border border-transparent focus:border-accent"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="w-full bg-accent rounded-lg p-4 items-center mt-4"
            disabled={verifying || code.trim().length < 4}
          >
            {verifying ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <Text className="text-background text-base font-bold">Verificar</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-between items-center mt-4">
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text className="text-secondary">Volver al inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text className="text-accent">{resending ? 'Reenviando...' : 'Reenviar código'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
