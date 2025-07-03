import {
    SafeAreaView, Text, View, Image, ScrollView,
    TouchableOpacity, ActivityIndicator, Share, Alert
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { Event } from '@/src/types';
import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';

const fetchEventDetails = async (eventId: string): Promise<Event> => {
    const { data } = await apiClient.get(`/api/events/${eventId}`);
    return data;
};

export default function EventDetailScreen() {
    const { id: eventId } = useLocalSearchParams();
    const router = useRouter();

    const { data: event, isLoading } = useQuery({
        queryKey: ['eventDetails', eventId],
        queryFn: () => fetchEventDetails(eventId as string),
        enabled: !!eventId,
    });


    const handleShare = async () => {
        try {
            await Share.share({
                message: `¡No te pierdas ${event?.title} en EventClub!`,
                url: `eventclub://event/${eventId}`
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="large" color={Colors.accent} className="flex-1 bg-background" />;
    }

    if (!event) {
        return <View><Text className="text-error text-center">Evento no encontrado.</Text></View>;
    }

    const formattedDate = new Date(event.date).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const fullName = `${event.organizer?.firstName || ''} ${event.organizer?.lastName || ''}`;
    const avatarUrl = event.company?.logoUrl;
    const phone = event.organizer?.profile?.phone;

    return (
        <View className="flex-1 bg-background pt-6 mt-safe">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* --- Imagen de Cabecera --- */}
                <View className="relative items-center">
                    <Image source={{ uri: event.imageUrls?.[0] || 'https://placehold.co/600x400' }} style={{ aspectRatio: 1 }} className="w-3/4 rounded-xl" />
                    <LinearGradient colors={['rgba(13, 17, 23, 0.8)', 'transparent']} className="absolute inset-0 h-24" />
                    <SafeAreaView className="absolute inset-0 flex-row justify-between items-start p-4">
                        <TouchableOpacity onPress={() => router.back()} className="bg-black/50 p-2 rounded-full">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleShare} className="bg-black/50 p-2 rounded-full">
                            <Ionicons name="share-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* --- Contenido del Evento --- */}
                <View className="p-6">
                    <Text className="text-primary text-3xl uppercase" style={{ fontFamily: 'Inter_700Bold' }}>{event.title}</Text>
                    <Text className="text-accent font-semibold text-lg mt-1 uppercase">{formattedDate}</Text>
                    <Text className="text-secondary text-lg font-semibold mt-1">{event.place}</Text>
                    <Text className="text-secondary text-md mt-1">{event.address}, {event.city}</Text>

                    {/* --- Sección de Descripción --- */}
                    <View className="mt-2 pt-6 border-t border-glass-border">
                        <Text className="text-primary text-xl mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Sobre el Evento</Text>
                        <Text className="text-secondary leading-6">{event.description}</Text>
                    </View>

                    {/* --- Sección de Organizador --- */}
                    <View className='border-t border-glass-border pt-6'>
                        <Text className='text-primary text-xl mb-3' style={{ fontFamily: 'Inter_700Bold' }} >Organizador</Text>
                        <View className="flex-row items-center gap-4">
                            {avatarUrl && (
                                <Image source={{ uri: avatarUrl }} className="w-16 h-16 rounded-full" />
                            )}
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-lg">{event.company?.name}</Text>
                                {phone && <Text className="text-secondary">Tel: {phone}</Text>}
                            </View>
                        </View>
                    </View>
                {event.latitude !== 0 && event.longitude !== 0 && (
                    <View className="mt-6 pt-6 border-t border-glass-border">
                        <Text className="text-primary text-xl mb-2" style={{ fontFamily: 'Inter_700Bold' }}>
                            Ubicación
                        </Text>
                        <View className='rounded-xl overflow-hidden'>
                            <MapView
                                style={{ width: '100%', height: 160, borderRadius: 24 }}
                                region={{
                                    latitude: event.latitude,
                                    longitude: event.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                pitchEnabled={false}
                                rotateEnabled={false}
                                pointerEvents="none"
                            >
                                <Marker
                                    coordinate={{ latitude: event.latitude, longitude: event.longitude }}
                                    title={event.title}
                                    description={event.address}
                                    pinColor={Colors.accent}
                                />
                            </MapView>
                        </View>
                    </View>
                )}
                </View>
            </ScrollView>

            {/* --- Footer de Compra --- */}
            <View className="absolute mb-safe bottom-0 left-0 right-0 p-4 bg-background/95 backdrop:blur-sm border-t border-glass-border">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-secondary text-sm">Desde</Text>
                        <Text className="text-accent text-2xl font-bold">US$ {event.price?.toFixed(2) || 'N/A'}</Text>
                    </View>
                    <TouchableOpacity
                        // onPress={() => router.push(`/checkout/${event.id}`)}
                        className="bg-accent px-8 py-4 rounded-full"
                    >
                        <Text className="text-background font-bold text-base">Comprar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
