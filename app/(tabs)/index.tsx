import EventCard, { Event } from '@/src/components/shared/EventCard';
import apiClient from '@/src/lib/axios';
import { UserProfile } from '@/src/types';
import { useQuery } from '@tanstack/react-query';
import { Image, SafeAreaView, ScrollView, Text, View } from 'react-native';

// Creamos un array de datos de ejemplo para renderizar
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Bresh - La Fiesta Más Linda',
    location: 'Estadio GEBA, Buenos Aires',
    imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop',
  },
  {
    id: '2',
    title: 'Hernán Cattáneo en Forja',
    location: 'Forja, Córdoba',
    imageUrl: 'https://images.unsplash.com/photo-1582732293420-c89514696811?q=80&w=2070&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Noche de Electrónica',
    location: 'Mute, Mar del Plata',
    imageUrl: 'https://images.unsplash.com/photo-1561489396-888724a1543d?q=80&w=2070&auto=format&fit=crop',
  }
];
const fetchMyProfile = async (): Promise<UserProfile> => {
  // Este endpoint sí devuelve el perfil completo, incluyendo los datos anidados.
  const { data } = await apiClient.get('/api/users/me');
  return data;
};

const SizeImg = {
  width: 60,
  height: 60,
}


export default function FeedScreen() {

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ['myProfile'],
    queryFn: fetchMyProfile,
    refetchOnWindowFocus: true, // Vuelve a cargar los datos cuando la pantalla gana foco
  });

  return (
    <SafeAreaView className="flex-1 mt-safe-offset-0 bg-background pt-6 pb-24">
      <ScrollView>
        <View className="px-6">
          <View className='flex-row justify-between items-center mb-6'>
            <View>
              <Text
                className="text-primary text-3xl mb-2"
                style={{ fontFamily: 'Inter_700Bold' }}
              >
                Novedades
              </Text>
              <Text
                className="text-secondary"
                style={{ fontFamily: 'Inter_400Regular' }}
              >
                Lo último de la comunidad para vos.
              </Text>
            </View>
            <View className=" items-center justify-center">
                <Image source={{ uri: user?.profile?.avatarUrl || `https://placehold.co/60/FFFFFF/000000?text=${user?.firstName?.slice(0,1)}` }} className="w-10 h-10 mb-2 rounded-full" style={SizeImg} />
                <View className="">
                  <Text className="text-primary text-sm" style={{ fontFamily: 'Inter_700Bold' }}>¡Hola, {user?.firstName}!</Text>
                </View>
             </View>
          </View>

          {/* Mapeamos el array de eventos y renderizamos una EventCard por cada uno */}
          <View className="gap-4">
            {mockEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
