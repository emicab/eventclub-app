import CalendarModal from '@/src/components/events/CalendarModal';
import EventListItem from '@/src/components/events/EventListItem';
import Colors from '@/src/constants/Colors';
import apiClient from '@/src/lib/axios';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useCurrencyStore } from '@/src/store/useCurrencyStore';
import { Event, UserProfile } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';


const fetchEvents = async (date?: string): Promise<Event[]> => {
  const dateFilter = date ? `?date=${date}` : '';
  const { data } = await apiClient.get(`/api/events${dateFilter}`);
  return data;
};

// Función para agrupar eventos por día
const groupEventsByDay = (events: Event[]) => {
  return events.reduce((acc, event) => {
    const eventDate = new Date(event.date).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[eventDate]) {
      acc[eventDate] = [];
    }
    acc[eventDate].push(event);
    return acc;
  }, {} as Record<string, Event[]>);
};

const fetchMyProfile = async (): Promise<UserProfile> => {
  const { data } = await apiClient.get('/api/users/me');
  return data;
};

export default function EventsScreen() {
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  
  const { data: currentUser } = useQuery({
      queryKey: ['myProfile'],
      queryFn: fetchMyProfile,
    });

  //@ts-ignore 
  const { selectedCurrency, rates } = useCurrencyStore();
    

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', selectedDate],
    queryFn: () => fetchEvents(selectedDate),
    refetchOnWindowFocus: true
  });

  const groupedEvents = events ? groupEventsByDay(events) : {};
  const sections = Object.keys(groupedEvents).map(date => ({
    title: date,
    data: groupedEvents[date],
  }));

  return (
    <SafeAreaView className="flex-1 bg-background pt-10 mt-safe">
      <View className='px-6 mb-4 flex-row justify-between items-center'>
        <View>
          <Text className="text-primary text-3xl" style={{ fontFamily: 'Inter_700Bold' }}>Eventos</Text>
          <Text className="text-secondary mt-1" style={{ fontFamily: 'Inter_400Regular' }}>Mirá todos los eventos que están disponibles</Text>
        </View>
        <TouchableOpacity onPress={() => setModalVisible(true)} className="mr-4">
          <Ionicons name="calendar-outline" size={24} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      <CalendarModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectDate={setSelectedDate}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.accent} className="mt-8" />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.title}
          renderItem={({ item }) => (
            <View className="px-6 mt-6">
              <Text className="text-primary text-xl capitalize" style={{ fontFamily: 'Inter_700Bold' }}>{item.title}</Text>
              <View className="mt-4">
                {item.data.map(event => 
                  <EventListItem 
                    key={event.id} 
                    event={event}
                    // @ts-ignore
                    displayCurrency={selectedCurrency}
                    exchangeRate={rates[selectedCurrency]}
                  />
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={<Text className="text-secondary text-center mt-16">No hay eventos para esta fecha.</Text>}
        />
      )}
      {/* --- BOTÓN FLOTANTE PARA ADMINS --- */}
      {currentUser?.role === 'ADMIN' && (
        <TouchableOpacity
          onPress={() => router.push('/event/create')}
          className="absolute bottom-32 right-6 bg-accent w-16 h-16 rounded-full justify-center items-center shadow-lg shadow-accent/40"
        >
          <Ionicons name="add" size={32} color={Colors.background} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}