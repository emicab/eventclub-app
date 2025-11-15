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


const formatLocalDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseLocalDate = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const fetchEvents = async (date?: string): Promise<Event[]> => {
  const { data } = await apiClient.get(`/api/events`);
  if (!date) return data;
  // Filtrado en cliente por la fecha local para evitar problemas de zona horaria
  return data.filter((event: Event) => {
    const evDate = new Date(event.date);
    return formatLocalDate(evDate) === date;
  });
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

  const selectedDateLabel = selectedDate
    ? parseLocalDate(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
    : undefined;

  return (
    <SafeAreaView className="flex-1 bg-background pt-10 mt-safe">
      <View className='px-6 mb-4 flex-row justify-between items-center'>
        <View>
          <Text className="text-primary text-3xl" style={{ fontFamily: 'Inter_700Bold' }}>Eventos</Text>
          <Text className="text-secondary mt-1" style={{ fontFamily: 'Inter_400Regular' }}>Mirá todos los eventos{'\n'}que están disponibles</Text>
          {selectedDateLabel && (
            <View className='my-4'>
              <Text className="text-secondary text-base font-medium" style={{ fontFamily: 'Inter_400Regular' }}>Fecha seleccionada</Text>
              <Text className="text-secondary text-base font-bold" style={{ fontFamily: 'Inter_700Bold' }}>{selectedDateLabel}</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-center">
          {selectedDate && (
            <TouchableOpacity onPress={() => setSelectedDate(undefined)} className="mr-3">
              <Ionicons name="close-circle-outline" size={24} color={Colors.accent} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setModalVisible(true)} className="mr-4">
            <Ionicons name="calendar-outline" size={24} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      <CalendarModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
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