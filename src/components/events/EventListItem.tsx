import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/src/constants/Colors';
import { Event } from '@/src/types'; // Ajustá el tipo si tenés una interfaz distinta

export default function EventListItem({ event }: { event: Event }) {
  const router = useRouter();

  const imageUrl = event.imageUrls?.[0] || 'https://placehold.co/200';
  const companyName = event.company.name || 'Empresa desconocida';
  const city = event.city || 'Ciudad desconocida';
  const address = event.address || 'Dirección desconocida';
  const price = event.price !== undefined ? `US$ ${event.price.toFixed(2)}` : 'Precio no disponible';

  return (
    <TouchableOpacity
      onPress={() => router.push(`/event/${event.id}`)}
      className="flex-row items-start mb-4"
    >
      <Image
        source={{ uri: imageUrl }}
        className="w-24 h-24 rounded-lg bg-gray-200"
        resizeMode="cover"
      />
      <View className="flex-1 ml-4 ">
        <Text className="text-primary font-bold text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
          {event.title}
        </Text>
        <Text className="text-secondary font-medium text-md mt-1">
          {event.place}
        </Text>
        <Text className="text-secondary text-sm mt-1">
          {address}, {city}
        </Text>
        <Text className="text-secondary text-sm mt-1">
          Desde {price}
        </Text>
        
      </View>
      <TouchableOpacity className="p-2">
        <Ionicons name="heart-outline" size={24} color={Colors.text.secondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
