import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constants/Colors';

// Definimos un tipo para los datos del evento
export type Event = {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
};

type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  return (
    // El contenedor principal tiene una altura fija (h-56) que es crucial
    // para que ImageBackground se renderice correctamente con una URL.
    <View className="h-56 w-full rounded-3xl overflow-hidden shadow-lg">
      <ImageBackground
        source={{ uri: event.imageUrl }}
        className="flex-1" // flex-1 asegura que ocupe todo el espacio del contenedor padre
        resizeMode="cover"
      >
        <View className="flex-1 justify-end">
          <BlurView
            intensity={80}
            tint="dark"
            className="p-4 flex-row items-center justify-between"
            style={{
              borderTopWidth: 1,
              borderColor: Colors.glass.border,
              backgroundColor: Colors.glass.background,
            }}
          >
            <View className="flex-1">
              <Text
                className="text-primary text-lg"
                style={{ fontFamily: 'Inter_700Bold' }}
                numberOfLines={1}
              >
                {event.title}
              </Text>
              <Text
                className="text-secondary"
                style={{ fontFamily: 'Inter_400Regular' }}
                numberOfLines={1}
              >
                {event.location}
              </Text>
            </View>
            <TouchableOpacity className="bg-accent p-3 rounded-full ml-4">
               <Ionicons name="arrow-forward" size={20} color={Colors.background} />
            </TouchableOpacity>
          </BlurView>
        </View>
      </ImageBackground>
    </View>
  );
}
