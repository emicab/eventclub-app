// --- Crear este nuevo archivo: app/ticket/[id].tsx ---
import { SafeAreaView, Text, View, ActivityIndicator, Image, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { Stack, useLocalSearchParams } from 'expo-router';
import Colors from '@/src/constants/Colors';
import { TicketDetail } from '@/src/types'; // Asegúrate de que tu tipo TicketDetail esté definido
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';


const fetchTicketDetails = async (ticketId: string): Promise<TicketDetail> => {
  const { data } = await apiClient.get(`/api/tickets/${ticketId}`);
  return data;
};

export default function TicketDetailScreen() {
  const { id: ticketId } = useLocalSearchParams();

  const { data: ticket, isLoading, isError } = useQuery({
    queryKey: ['ticketDetails', ticketId],
    queryFn: () => fetchTicketDetails(ticketId as string),
    enabled: !!ticketId,
  });

  if (isLoading) {
    return <ActivityIndicator size="large" color={Colors.accent} className="flex-1 bg-background" />;
  }

  if (isError || !ticket) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-error text-center p-4">Error al cargar la entrada o no fue encontrada.</Text>
      </SafeAreaView>
    );
  }

  const event = ticket.ticketType.event;
  const user = ticket.order.user;
  const eventDate = new Date(event.date).toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const eventTime = new Date(event.date).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit'
  });

  const isUsed = ticket.status === 'USED';

  return (
    <SafeAreaView className="flex-1 bg-background pt-10 mt-safe">
      
      <ScrollView className='px-4'>
          <Text className="text-primary text-xl" style={{ fontFamily: 'Inter_700Bold' }}>Tu Entrada</Text><Stack.Screen options={{ title: 'Tu Entrada', headerTintColor: Colors.text.primary, headerStyle: { backgroundColor: Colors.background } }} />
          <View className="flex-1 items-center p-6">
            <View className="w-full max-w-md bg-card rounded-2xl shadow-lg overflow-hidden">
              {/* Cabecera con imagen del evento */}
              <Image source={{ uri: event.imageUrls?.[0] || 'https://placehold.co/400x200' }} className="w-full h-52" />
          
              {/* Contenido principal de la entrada */}
              <View className="p-6 items-center">
                <View className={`p-4 bg-white rounded-lg ${isUsed ? 'opacity-20' : ''}`}>
                  <QRCode
                    value={ticket.qrCode}
                    size={180}
                    backgroundColor="white"
                    color="black"
                  />
                </View>
          
                {/* Overlay si la entrada ya fue usada */}
                {isUsed && (
                  <View style={StyleSheet.absoluteFill} className="justify-center items-center">
                     <Ionicons name="checkmark-done-circle" size={100} color={Colors.success} />
                  </View>
                )}
                <Text className="text-dark uppercase text-2xl mt-6 text-center" style={{ fontFamily: 'Inter_700Bold' }}>{event.title}</Text>
                <Text className="text-secondary uppercase text-lg mt-1">{ticket.ticketType.name}</Text>
              </View>
              {/* Separador */}
              <View className="border-b border-dashed border-glass-border mx-6" />
              {/* Detalles adicionales */}
              <View className="p-4 gap-3 odd:bg-glass-border">
                <View className="flex-row justify-between">
                  <Text className="text-secondary">Titular:</Text>
                  <Text className="text-dark font-bold">{user.firstName} {user.lastName}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary">Fecha:</Text>
                  <Text className="text-dark font-bold">{eventDate}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary">Hora:</Text>
                  <Text className="text-dark font-bold">{eventTime} hs</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary">Lugar:</Text>
                  <Text className="text-dark font-bold">{event.place}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-secondary">Direccion:</Text>
                  <Text className="text-dark font-bold">{event.address}</Text>
                </View>
              </View>
          
              {/* Estado de la entrada */}
              <LinearGradient
                colors={isUsed ? ['#4B5563', '#1F2937'] : ['#A334FA', '#E040FB']}
                className="p-4 items-center"
              >
                <Text className="text-white font-bold text-lg">{isUsed ? 'ENTRADA UTILIZADA' : 'VÁLIDA PARA INGRESAR'}</Text>
              </LinearGradient>
            </View>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}
