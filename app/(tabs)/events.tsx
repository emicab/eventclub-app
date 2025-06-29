import EventCard, { Event } from '@/src/components/shared/EventCard';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

// Usamos el mismo array de ejemplo, pero en una implementación real
// podrías hacer una llamada a la API diferente aquí.
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
  },
  {
    id: '4',
    title: 'Festival de Folklore',
    location: 'Cosquín, Córdoba',
    imageUrl: 'https://images.unsplash.com/photo-1598387993441-a364f854c3e1?q=80&w=1954&auto=format&fit=crop'
  }
];

export default function EventsScreen() {
  return (
    <SafeAreaView className="flex-1 mt-safe bg-background pt-6">
      <ScrollView>
        <View className="p-6">
          <Text
            className="text-primary text-3xl"
            style={{ fontFamily: 'Inter_700Bold' }}
          >
            Agenda de Eventos
          </Text>
          <Text
            className="text-secondary mt-1 mb-8"
            style={{ fontFamily: 'Inter_400Regular' }}
          >
            Descubrí tu próxima noche.
          </Text>

          {/* Mapeamos el array de eventos y renderizamos una EventCard por cada uno */}
          <View className="space-y-6">
            {mockEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
