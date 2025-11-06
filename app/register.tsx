// En register.tsx

import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, Pressable, Alert, ImageBackground, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import apiClient from '../src/lib/axios';
import { RegisterCredentials } from '../src/types';
import Colors from '../src/constants/Colors';

// --- INICIO DE LA MEJORA ---
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// 1. Definimos el esquema de validación con Zod
const RegisterSchema = z.object({
  firstName: z.string({ error: 'El nombre es requerido' }).min(2, 'El nombre es muy corto'),
  lastName: z.string({ error: 'El apellido es requerido' }).min(2, 'El apellido es muy corto'),
  email: z.string({ error: 'El email es requerido' }).email('El formato del email no es válido'),
  password: z.string({ error: 'La contraseña es requerida' }).min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type RegisterFormData = z.infer<typeof RegisterSchema>;
// --- FIN DE LA MEJORA ---


const registerUser = async (credentials: RegisterCredentials) => {
  const { data } = await apiClient.post('/api/auth/register', credentials);
  return data;
};

export default function RegisterScreen() {
  const router = useRouter();

  // --- INICIO DE LA MEJORA ---
  // 2. Usamos el hook useForm, conectándolo con nuestro esquema de Zod
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '' }
  });
  // --- FIN DE LA MEJORA ---


  const { mutate: register, isPending: isLoading } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      Alert.alert('Registro Exitoso', 'Hemos enviado un enlace a tu correo para verificar tu cuenta.');
      router.replace('/login');
    },
    // El error ahora se puede manejar aquí si quieres, o mostrarlo desde formState
  });
  
  // La función onSubmit ahora recibe los datos validados del formulario
  const onSubmit = (data: RegisterFormData) => {
    register(data);
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070&auto=format&fit=crop' }}
      className="flex-1"
      blurRadius={10}
    >
      <SafeAreaView className="flex-1 bg-black/60">
        <View className="flex-1 justify-center items-center p-6">

          <View className="w-full rounded-2xl overflow-hidden">
            <BlurView intensity={90} tint="dark" style={styles.blurContainer} className="p-6">
              <Text className="text-primary text-3xl text-center font-bold mb-6">Crear Cuenta</Text>

              {/* --- INICIO DE LA MEJORA --- */}
              <View className='flex-row gap-2 items-start'>
                <View className="flex-1">
                  <Controller control={control} name="firstName" render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-black/20 text-primary text-lg rounded-lg p-4 w-full border ${errors.firstName ? 'border-error' : 'border-transparent'} focus:border-accent`}
                      placeholder="Nombre" placeholderTextColor={Colors.text.secondary}
                      onBlur={onBlur} onChangeText={onChange} value={value}
                    />
                  )} />
                  {errors.firstName && <Text className="text-error mt-1 ml-2">{errors.firstName.message}</Text>}
                </View>
                <View className="flex-1">
                  <Controller control={control} name="lastName" render={({ field: { onChange, onBlur, value } }) => (
                     <TextInput
                      className={`bg-black/20 text-primary text-lg rounded-lg p-4 w-full border ${errors.lastName ? 'border-error' : 'border-transparent'} focus:border-accent`}
                      placeholder="Apellido" placeholderTextColor={Colors.text.secondary}
                      onBlur={onBlur} onChangeText={onChange} value={value}
                    />
                  )} />
                   {errors.lastName && <Text className="text-error mt-1 ml-2">{errors.lastName.message}</Text>}
                </View>
              </View>

              <Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-black/20 text-primary text-lg rounded-lg p-4 w-full mt-4 border ${errors.email ? 'border-error' : 'border-transparent'} focus:border-accent`}
                  placeholder="Email" placeholderTextColor={Colors.text.secondary}
                  keyboardType="email-address" autoCapitalize="none"
                  onBlur={onBlur} onChangeText={onChange} value={value}
                />
              )} />
              {errors.email && <Text className="text-error mt-1 ml-2">{errors.email.message}</Text>}

              <Controller control={control} name="password" render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-black/20 text-primary text-lg rounded-lg p-4 w-full mt-4 border ${errors.password ? 'border-error' : 'border-transparent'} focus:border-accent`}
                  placeholder="Contraseña" placeholderTextColor={Colors.text.secondary}
                  secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value}
                />
              )} />
              {errors.password && <Text className="text-error mt-1 ml-2 mb-2">{errors.password.message}</Text>}

              {/* El botón ahora llama a handleSubmit, que valida antes de llamar a onSubmit */}
              <TouchableOpacity
                className="w-full bg-accent rounded-lg p-4 items-center"
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color={Colors.background} /> : <Text className="text-background text-base font-bold">Registrarse</Text>}
              </TouchableOpacity>
              {/* --- FIN DE LA MEJORA --- */}

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

const styles = StyleSheet.create({
  blurContainer: {
    borderColor: Colors.glass.border,
    backgroundColor: Colors.glass.background,
    borderWidth: 1,
  }
});