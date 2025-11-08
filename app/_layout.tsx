import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { queryClient } from '../src/lib/queryClient';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import '../global.css';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { useInitializeCurrency } from '@/src/hooks/useInitializeCurrency';
import { SocketProvider } from '@/src/context/SocketContext';
import { useSocketListeners } from '@/src/hooks/useSocketListener'; // 👈 importá tu hook aquí


export default function RootLayout() {
  const router = useRouter();
  const { _hasHydrated, isAuthenticated } = useAuthStore();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  useInitializeCurrency();

  useEffect(() => {
    if (!fontsLoaded || fontError || !_hasHydrated) return;

    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }

    SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, _hasHydrated, isAuthenticated, router]);

  if (!fontsLoaded || fontError || !_hasHydrated) {
    return null;
  }

  return (
    <ActionSheetProvider>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          {/* 🧠 Aquí es donde montamos los listeners globales */}
          <SocketListenersWrapper />
          <Stack screenOptions={{ headerShown: false }} />
        </SocketProvider>
      </QueryClientProvider>
    </ActionSheetProvider>
  );
}


// 📦 Pequeño wrapper que usa el hook una sola vez
function SocketListenersWrapper() {
  useEffect(() => {
    console.log('🔌 SocketListeners montado');
  }, []);
  
  useSocketListeners(); // activa todos los eventos
  return null;
}
