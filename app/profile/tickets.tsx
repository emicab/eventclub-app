import { SafeAreaView, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { Stack } from 'expo-router';
import Colors from '@/src/constants/Colors';
import { Ticket } from '@/src/types';
import TicketItem from '@/src/components/profile/TicketItem';

const fetchMyTickets = async (): Promise<Ticket[]> => {
  const { data } = await apiClient.get('/api/tickets/my-tickets');
  return data;
};

export default function MyTicketsScreen() {
  const { data: tickets, isLoading, isError } = useQuery({
    queryKey: ['myTickets'],
    queryFn: fetchMyTickets,
    refetchOnWindowFocus: true,
  });

  return (
    <SafeAreaView className="flex-1 bg-background pt-10 my-safe">
     <Text className="text-primary text-3xl px-4" style={{ fontFamily: 'Inter_700Bold' }}>Mis Entradas</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.accent} />
      ) : isError ? (
        <Text className="text-error text-center p-4">
          Error al cargar tus entradas.
        </Text>
      ) : (
        <FlatList
          data={tickets}
          renderItem={({ item }) => <TicketItem ticket={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24 }}
          ListEmptyComponent={
            <Text className="text-secondary text-center mt-16">
              Aún no tienes entradas para eventos.
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}