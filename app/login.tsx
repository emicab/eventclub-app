import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, Pressable, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useAuth } from '../src/hooks/useAuth';
import { LoginCredentials } from '../src/types';
import Colors from '../src/constants/Colors';

const BACKGROUND_IMAGE_URL = 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleLogin = () => {
    const credentials: LoginCredentials = { email, password };
    login(credentials);
  };

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGE_URL }}
      className="flex-1"
      blurRadius={10}
    >
      <SafeAreaView className="flex-1 mt-safe px-10 bg-black/60">
        <View className="flex-1 justify-center items-center p-6">

          {/* Contenedor de la tarjeta de vidrio */}
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
                Bienvenido
              </Text>

              {/* Campos de entrada */}
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

              {error && <Text className="text-error mb-4 text-center">{error}</Text>}

              {/* Botón Principal */}
              <TouchableOpacity
                className="w-full bg-accent rounded-lg p-4 items-center shadow-lg shadow-accent/40"
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text className="text-background text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                    Ingresar
                  </Text>
                )}
              </TouchableOpacity>
            </BlurView>
          </View>

           {/* Link para registrarse */}
          <View className="flex-row mt-6">
            <Text className="text-secondary" style={{ fontFamily: 'Inter_400Regular' }}>
              ¿No tienes una cuenta?{' '}
            </Text>
            <Link href="/register" asChild>
              <Pressable>
                <Text className="text-accent font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                  Regístrate
                </Text>
              </Pressable>
            </Link>
          </View>

        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}
