import {
    SafeAreaView, Text, View, Image, ScrollView,
    TouchableOpacity, ActivityIndicator, Share, Alert
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { Event, TicketType } from '@/src/types';
import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { useState } from 'react';

const fetchEventDetails = async (eventId: string): Promise<Event> => {
    const { data } = await apiClient.get(`/api/events/${eventId}`);
    return data;
};

const createOrder = async (data: { ticketTypeId: string; quantity: number }) => {
    const { data: responseData } = await apiClient.post('/api/orders', data);
    return responseData;
};



export default function EventDetailScreen() {
    const { id: eventId } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [quantity, setQuantity] = useState(1);

    const { data: event, isLoading } = useQuery({
        queryKey: ['eventDetails', eventId],
        queryFn: () => fetchEventDetails(eventId as string),
        enabled: !!eventId,
    });

    const { mutate: handlePurchase, isPending } = useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
          Alert.alert(
            '¡Compra Exitosa!',
            'Tus entradas ya están disponibles en tu perfil.',
            [
              { text: 'Ver mis entradas', onPress: () => router.replace('/profile/tickets') },
              { text: 'Aceptar', style: 'cancel', onPress: () => router.back() },
            ]
          );
          queryClient.invalidateQueries({ queryKey: ['eventDetails', eventId] });
          queryClient.invalidateQueries({ queryKey: ['myTickets'] });
        },
        onError: (error: any) => Alert.alert("Error", error.response?.data?.message || "No se pudo completar la compra."),
      });

    const handleConfirmPurchase = () => {
        if (!selectedTicket) return;
        handlePurchase({ ticketTypeId: selectedTicket.id, quantity });
    };


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

    const total = selectedTicket ? (selectedTicket.priceInCents / 100) * quantity : 0;

    const fullName = `${event.organizer?.firstName || ''} ${event.organizer?.lastName || ''}`;
    const avatarUrl = event.company?.logoUrl;
    const phone = event.organizer?.profile?.phone;

    return (
        <View className="flex-1 bg-background pt-6 my-safe">
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

                {/* --- NUEVA SECCIÓN DE ENTRADAS --- */}
                <View className="mt-8 px-4">
                    <Text className="text-primary text-xl mb-4" style={{ fontFamily: 'Inter_700Bold' }}>Entradas</Text>
                    <View className="gap-4">
                        {/* @ts-ignore */}
                        {event.tickets?.map(ticket => (
                            <TouchableOpacity
                                key={ticket.id}
                                onPress={() => {
                                    setSelectedTicket(ticket);
                                    setQuantity(1); // Resetea la cantidad al seleccionar un nuevo tipo
                                }}
                                className={`p-4 rounded-lg  border-2 ${selectedTicket?.id === ticket.id ? 'border-accent bg-accent/10' : 'border-glass-border bg-card'}`}
                            >
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-accent font-bold flex-1">{ticket.name}</Text>
                                    <Text className="text-accent font-bold">US$ {(ticket.priceInCents / 100).toFixed(2)}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
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
            {selectedTicket && (
                <View className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 border-t border-glass-border">
                    {/* Selector de Cantidad */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-primary text-lg font-bold">Cantidad</Text>
                        <View className="flex-row items-center gap-4">
                            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))}>
                                <Ionicons name="remove-circle-outline" size={32} color={Colors.text.primary} />
                            </TouchableOpacity>
                            <Text className="text-primary text-2xl font-bold w-8 text-center">{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(q => q + 1)}>
                                <Ionicons name="add-circle" size={32} color={Colors.accent} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Botón de Pago */}
                    <TouchableOpacity
                        onPress={handleConfirmPurchase}
                        disabled={isPending}
                        className="bg-accent px-8 py-4 rounded-full flex-row justify-between items-center"
                    >
                        {isPending ? <ActivityIndicator color={Colors.background} /> : (
                            <>
                                <Text className="text-background font-bold text-base">Pagar</Text>
                                <Text className="text-background font-bold text-base">US$ {total.toFixed(2)}</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
