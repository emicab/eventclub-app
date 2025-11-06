// En login.tsx

import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, Pressable, ImageBackground, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useAuth } from '../src/hooks/useAuth';
import { LoginCredentials } from '../src/types';
import Colors from '../src/constants/Colors';

// --- INICIO DE LA MEJORA ---
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Esquema de validación para el login
const LoginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
// --- FIN DE LA MEJORA ---


export default function LoginScreen() {
  const { login, isLoading, error } = useAuth();

  // --- INICIO DE LA MEJORA ---
  // 2. Usamos el hook useForm
  const { control, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: '', password: '' }
  });

  // La función de login ahora recibe los datos validados
  const onLogin = (credentials: LoginCredentials) => {
    login(credentials);
  };
  // --- FIN DE LA MEJORA ---

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop' }}
      className="flex-1"
      blurRadius={10}
    >
      <SafeAreaView className="flex-1 mt-safe px-10 bg-black/60">
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-full rounded-2xl overflow-hidden">
            <BlurView intensity={90} tint="dark" style={styles.blurContainer} className="p-6">
              <Text className="text-primary text-3xl text-center font-bold mb-6">Bienvenido</Text>
              
              {/* --- INICIO DE LA MEJORA --- */}
              <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-black/20 text-primary text-lg rounded-lg p-4 w-full mb-4 border ${errors.email ? 'border-error' : 'border-transparent'} focus:border-accent`}
                  placeholder="Email" placeholderTextColor={Colors.text.secondary}
                  keyboardType="email-address" autoCapitalize="none"
                  onBlur={onBlur} onChangeText={onChange} value={value}
                />
              )} />
              {errors.email && <Text className="text-error mt-1 ml-2">{errors.email.message}</Text>}

              <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-black/20 text-primary text-lg rounded-lg p-4 w-full mb-6 border ${errors.password ? 'border-error' : 'border-transparent'} focus:border-accent`}
                  placeholder="Contraseña" placeholderTextColor={Colors.text.secondary}
                  secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value}
                />
              )} />
              {errors.password && <Text className="text-error mt-1 ml-2 mb-2">{errors.password.message}</Text>}

              {error && <Text className="text-error mb-4 text-center">{error}</Text>}

              <TouchableOpacity
                className="w-full bg-accent rounded-lg p-4 items-center"
                onPress={handleSubmit(onLogin)} // Usamos handleSubmit
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color={Colors.background} /> : <Text className="text-background text-base font-bold">Ingresar</Text>}
              </TouchableOpacity>
              {/* --- FIN DE LA MEJORA --- */}

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

const styles = StyleSheet.create({
    blurContainer: {
      borderColor: Colors.glass.border,
      backgroundColor: Colors.glass.background,
      borderWidth: 1,
    }
  });