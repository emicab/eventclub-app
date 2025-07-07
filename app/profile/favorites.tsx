// En app/profile/favorites.tsx
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getMyFavoriteEvents } from '../../src/api/events';
import EventListItem from '@/src/components/events/EventListItem';
import { useCurrencyStore } from '@/src/store/useCurrencyStore';

export default function FavoriteEventsScreen() {
  // Usamos useQuery para obtener la lista de eventos favoritos
  const { displayCurrency, exchangeRate } = useCurrencyStore();

  const { data: favoriteEvents, isLoading, error } = useQuery({
    queryKey: ['favoriteEvents'], // ¡Esta es la clave que nuestro hook invalida!
    queryFn: getMyFavoriteEvents,
  });

  console.log("fav event:: ", favoriteEvents);

  if (isLoading) {
    return <ActivityIndicator size="large" className="mt-10" />;
  }

  if (error) {
    return <Text className="text-center text-red-500 mt-10">Error al cargar tus favoritos.</Text>;
  }

  return (
    <View className="flex-1 bg-background p-10 my-safe px-6">
      <Text className="text-white text-2xl font-bold mb-8">Mis Eventos Favoritos</Text>
      <FlatList
        data={favoriteEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventListItem event={item} displayCurrency={displayCurrency} exchangeRate={exchangeRate} />}
        ListEmptyComponent={<Text className="text-gray-400 text-center mt-20">Cuando guardes un evento, aparecerá aquí.</Text>}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
}