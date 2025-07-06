import { QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { queryClient } from '../src/lib/queryClient';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/useAuthStore';
import '../global.css'
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';


export default function RootLayout() {
  // usePushNotifications();
  const router = useRouter();
  const { _hasHydrated, isAuthenticated } = useAuthStore();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  useEffect(() => {
    // Si las fuentes o el estado de la store no están listos, no hacemos nada todavía.
    if (!fontsLoaded || fontError || !_hasHydrated) {
      return;
    }

    // Una vez que todo está cargado, decidimos a dónde ir.
    if (!isAuthenticated) {
      // Si el usuario está autenticado, lo enviamos a las pestañas principales.
      router.replace('/(tabs)');
    } else {
      // Si no, lo enviamos al login.
      router.replace('/login');
    }

    SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, _hasHydrated, isAuthenticated, router]);

  // Mientras no esté todo listo, no mostramos nada para evitar parpadeos.
  if (!fontsLoaded || fontError || !_hasHydrated) {
    return null;
  }

  return (
    <ActionSheetProvider>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </ActionSheetProvider>
  );
}