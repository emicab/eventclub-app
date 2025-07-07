import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import apiClient from '../lib/axios';
import { LoginCredentials } from '../types'; // Suponiendo que tienes un archivo de tipos

// 1. Separamos la lógica de la llamada a la API
const loginUser = async (credentials: LoginCredentials) => {
  const { data } = await apiClient.post('/api/auth/login', credentials);
  return data;
};

export const useAuth = () => {
  const router = useRouter();
  const { login: loginToStore, logout: logoutFromStore } = useAuthStore();

  // 2. Usamos useMutation para manejar el estado del servidor
  const { mutate: login, isPending: isLoading, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // 3. En caso de éxito, guardamos en el store y redirigimos
      const { user, token } = data;
      console.log(token) 
      /* 
       eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWNpaHdlY3QwMDAwYmd2Mjd4c2VtMWdpIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzUxODQyMzgzLCJleHAiOjE3NTI0NDcxODN9._neMnJ1NVZBjuf1UoApOEDU3k6tyqZO3qeeU9fpQWdI
     
      */ 
      loginToStore(token, user);
      router.replace('/(tabs)');
    },
    // onError es manejado automáticamente por la propiedad 'error' de useMutation
  });

  const logout = () => {
    logoutFromStore();
    router.replace('/login');
  };

  // El error de TanStack Query puede ser de tipo 'Error', así que lo casteamos
  const authError = error ? (error as any).response?.data?.message || error.message : null;

  return { login, logout, isLoading, error: authError };
};
