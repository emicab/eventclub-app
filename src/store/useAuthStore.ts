import { create } from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware'; // Para guardar en AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '../lib/queryClient';

interface AuthState {
  token: string | null;
  user: any | null; // Reemplazar 'any' con tu tipo de usuario
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

/**
 * @returns {AuthState} Estado de autenticación con token y usuario
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      _hasHydrated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
        queryClient.clear(); // Limpiar el cache de QueryClient
      },
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Esta función se ejecuta cuando la carga del storage termina
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
