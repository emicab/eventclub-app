import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ticket } from '@/src/types'; // Asegúrate de que tu tipo Ticket esté definido

export default function TicketItem({ ticket }: { ticket: Ticket }) {
  const router = useRouter();
  const event = ticket.ticketType.event;

  // Formateamos la fecha para que sea más legible
  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={() => router.push(`/ticket/${ticket.id}`)}
      className="bg-card rounded-lg overflow-hidden flex-row mb-4 shadow-md"
    >
      <Image
        source={{ uri: event.imageUrls?.[0] || 'https://placehold.co/200x200' }}
        className="w-24 h-full"
        resizeMode="cover"
        resizeMethod='resize'
      />
      <View className="p-4 flex-1">
        <Text
          className="text-dark uppercase font-bold text-lg"
          style={{ fontFamily: 'Inter_700Bold' }}
        >
          {event.title}
        </Text>
        <Text className="text-secondary uppercase text-md mt-1">
          {ticket.ticketType.name}
        </Text>
        <Text className="text-secondary text-md mt-1">
          {eventDate}
        </Text>
      </View>
    </TouchableOpacity>
  );
}