import {
    SafeAreaView,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/src/lib/axios';
import { useState } from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Colors from '@/src/constants/Colors';
import { Event, TicketType } from '@/src/types';
import { Ionicons } from '@expo/vector-icons';
import { useCurrencyStore } from '@/src/store/useCurrencyStore';

const fetchEventDetails = async (eventId: string): Promise<Event> => {
    const { data } = await apiClient.get(`/api/events/${eventId}`);
    return data;
};

// Función que llama a nuestro endpoint de órdenes
const createOrder = async (data: {
    ticketTypeId: string;
    quantity: number;
}) => {
    const { data: responseData } = await apiClient.post('/api/orders', data);
    return responseData;
};

export default function CheckoutScreen() {
    const { eventId } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { selectedCurrency, rates } = useCurrencyStore();

    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [quantity, setQuantity] = useState(1);

    const { data: event, isLoading: isLoadingEvent } = useQuery({
        queryKey: ['eventDetails', eventId],
        queryFn: () => fetchEventDetails(eventId as string),
        enabled: !!eventId,
    });

    const { mutate: handlePurchase, isPending } = useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            Alert.alert(
                '¡Éxito!',
                'Tus entradas han sido generadas. Puedes verlas en tu perfil.',
                [
                    {
                        text: 'Ver mis entradas',
                        onPress: () => router.replace('/(tabs)/profile'),
                    },
                    { text: 'Aceptar', style: 'cancel', onPress: () => router.back() },
                ]
            );
            queryClient.invalidateQueries({ queryKey: ['eventDetails', eventId] });
            queryClient.invalidateQueries({ queryKey: ['myTickets'] });
        },
        onError: (error: any) =>
            Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo completar la compra.'
            ),
    });

    const handleConfirmPurchase = () => {
        if (!selectedTicket) {
            Alert.alert('Error', 'Por favor, selecciona un tipo de entrada.');
            return;
        }
        handlePurchase({ ticketTypeId: selectedTicket.id, quantity });
    };

    const total = selectedTicket
        ? (selectedTicket.priceInCents / 100) * quantity
        : 0;
    const exchangeRate = rates[selectedCurrency] || 1;
    const convertedTotal = total * exchangeRate;

    const formattedTotal = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: selectedCurrency,
    }).format(convertedTotal);

    if (isLoadingEvent) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color={Colors.text.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Finalizar Compra',
                    headerStyle: { backgroundColor: '#F9FAFB' },
                    headerTintColor: Colors.text.primary,
                    headerBackTitle: 'Evento',
                }}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="p-6">
                    <Text className="text-text-secondary mb-4">{event?.title}</Text>
                    <Text className="text-text-primary text-2xl font-bold mb-4">
                        Selecciona tus Entradas
                    </Text>

                    {/* Lista de Tipos de Entrada */}
                    <View className="gap-4">
                        {/* @ts-ignore */}
                        {event?.tickets?.map((ticket) => (
                            <TouchableOpacity
                                key={ticket.id}
                                onPress={() => {
                                    setSelectedTicket(ticket);
                                    setQuantity(1);
                                }}
                                className={`p-4 rounded-lg border-2 ${selectedTicket?.id === ticket.id
                                        ? 'border-primary bg-blue-50'
                                        : 'border-border-color bg-white'
                                    }`}
                            >
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-text-primary font-bold">
                                        {ticket.name}
                                    </Text>
                                    <Text className="text-text-primary font-bold">
                                        US$ {(ticket.priceInCents / 100).toFixed(2)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Selector de Cantidad */}
                    {selectedTicket && (
                        <View className="flex-row justify-between items-center mt-8 bg-white p-4 rounded-lg border border-border-color">
                            <Text className="text-text-primary text-lg font-bold">
                                Cantidad
                            </Text>
                            <View className="flex-row items-center gap-4">
                                <TouchableOpacity
                                    onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                                >
                                    <Ionicons
                                        name="remove-circle-outline"
                                        size={32}
                                        color={Colors.text.secondary}
                                    />
                                </TouchableOpacity>
                                <Text className="text-text-primary text-2xl font-bold w-8 text-center">
                                    {quantity}
                                </Text>
                                <TouchableOpacity onPress={() => setQuantity((q) => q + 1)}>
                                    <Ionicons
                                        name="add-circle"
                                        size={32}
                                        color={Colors.text.primary}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Footer de Pago */}
            {selectedTicket && (
                <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-border-color">
                    <TouchableOpacity
                        onPress={handleConfirmPurchase}
                        disabled={isPending}
                        className={`w-full rounded-lg p-4 items-center ${isPending ? 'bg-gray-400' : 'bg-primary'
                            }`}
                    >
                        {isPending ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white font-bold text-base">
                                Confirmar Compra por {formattedTotal}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
