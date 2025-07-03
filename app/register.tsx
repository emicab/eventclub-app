import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, Pressable, Alert, ImageBackground } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import apiClient from '../src/lib/axios';
import { RegisterCredentials } from '../src/types';
import Colors from '../src/constants/Colors';

const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop';

const registerUser = async (credentials: RegisterCredentials) => {
  const { data } = await apiClient.post('/api/auth/register', credentials);
  return data;
};

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const { mutate: register, isPending: isLoading, error } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      Alert.alert('Registro Exitoso', 'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.');
      router.replace('/login');
    }
  });

  const handleRegister = () => {
    if (!firstName || !email || !password) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }
    const credentials: RegisterCredentials = { firstName, lastName, email, password };
    register(credentials);
  };

  const registerError = error ? (error as any).response?.data?.message || error.message : null;

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE_URL }}
      className="flex-1"
      blurRadius={10}
    >
      <SafeAreaView className="flex-1 bg-black/60">
        <View className="flex-1 justify-center items-center p-6">

          <View className="w-full rounded-2xl overflow-hidden">
            <BlurView
              intensity={90}
              tint="dark"
              style={{
                borderColor: Colors.glass.border,
                backgroundColor: Colors.glass.background,
                borderWidth: 1,
              }}
              className="p-6"
            >
              <Text className="text-primary text-3xl text-center font-bold mb-6" style={{ fontFamily: 'Inter_700Bold' }}>
                Crear Cuenta
              </Text>

              <View className=' flex-row gap-2 items-center'>
                <TextInput
                  className="flex-1 bg-black/20 text-primary text-lg rounded-lg p-4  mb-4 border border-transparent focus:border-accent"
                  placeholder="Nombre"
                  placeholderTextColor={Colors.text.secondary}
                  value={firstName}
                  onChangeText={setFirstName}
                  style={{ fontFamily: 'Inter_400Regular' }}
                />
                <TextInput
                  className="flex-1 bg-black/20 text-primary text-lg rounded-lg p-4  mb-4 border border-transparent focus:border-accent"
                  placeholder="Apellido"
                  placeholderTextColor={Colors.text.secondary}
                  value={lastName}
                  onChangeText={setLastName}
                  style={{ fontFamily: 'Inter_400Regular' }}
                />
              </View>

              <TextInput
                className="bg-black/20 text-primary text-lg rounded-lg p-4 w-full mb-4 border border-transparent focus:border-accent"
                placeholder="Email"
                placeholderTextColor={Colors.text.secondary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                style={{ fontFamily: 'Inter_400Regular' }}
              />
              <TextInput
                className="bg-black/20 text-primary text-lg rounded-lg p-4 w-full mb-6 border border-transparent focus:border-accent"
                placeholder="Contraseña"
                placeholderTextColor={Colors.text.secondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ fontFamily: 'Inter_400Regular' }}
              />

              {registerError && <Text className="text-error mb-4 text-center">{registerError}</Text>}

              <TouchableOpacity
                className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40"
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text className="text-background text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                    Registrarse
                  </Text>
                )}
              </TouchableOpacity>
            </BlurView>
          </View>

          <View className="flex-row mt-6">
            <Text className="text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              ¿Ya tienes una cuenta?{' '}
            </Text>
            <Link href="/login" asChild>
              <Pressable>
                <Text className="text-accent font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                  Inicia sesión
                </Text>
              </Pressable>
            </Link>
          </View>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
