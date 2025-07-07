// En app/profile/friends.tsx
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as api from '@/src/api/friends';
import { useState } from 'react';
import { Stack } from 'expo-router';
import FriendListItem from '@/src/components/friends/FriendListItem';
import FriendRequestItem from '@/src/components/friends/FriendRequestItem';

function FriendsList() {
  const { data: friends, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: api.getFriends,
  });

  if (isLoading) return <ActivityIndicator className="mt-8" />;
  return (
    <FlatList
      data={friends}
      renderItem={({ item }) => <FriendListItem friend={item} />}
      keyExtractor={(item) => item.id}
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListEmptyComponent={<Text className="text-secondary text-center mt-8">Aún no tienes amigos. ¡Sal a escanear códigos QR!</Text>}
    />
  );
}

function RequestsList() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['pendingRequests'],
    queryFn: api.getPendingRequests,
  });

  if (isLoading) return <ActivityIndicator className="mt-8" />;
  return (
    <FlatList
      data={requests}
      renderItem={({ item }) => <FriendRequestItem request={item} />}
      keyExtractor={(item) => item.requesterId}
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListEmptyComponent={<Text className="text-secondary text-center mt-8">No tienes solicitudes pendientes.</Text>}
    />
  );
}

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  return (
    <View className="flex-1 bg-background pt-10 my-safe px-6  ">
      <Stack.Screen options={{ title: 'Amigos' }} />
      {/* Selector de Pestañas */}
      <View className="flex-row mb-4 bg-card rounded-lg p-1">
        <TouchableOpacity 
            onPress={() => setActiveTab('friends')}
            className={`flex-1 p-2 rounded-md ${activeTab === 'friends' ? 'bg-accent' : ''}`}
        >
          <Text className={`text-center font-bold ${activeTab === 'friends' ? 'text-background' : 'text-primary'}`}>Mis Amigos</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            onPress={() => setActiveTab('requests')}
            className={`flex-1 p-2 rounded-md ${activeTab === 'requests' ? 'bg-accent' : ''}`}
        >
          <Text className={`text-center font-bold ${activeTab === 'requests' ? 'text-background' : 'text-primary'}`}>Solicitudes</Text>
        </TouchableOpacity>
      </View>
      
      {activeTab === 'friends' ? <FriendsList /> : <RequestsList />}
    </View>
  );
}