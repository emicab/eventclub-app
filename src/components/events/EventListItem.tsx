// En src/components/events/EventListItem.tsx

import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";
import { Event } from "@/src/types";
import { useToggleFavorite } from "@/src/hooks/useFavorites";
import { useCurrencyStore } from "@/src/store/useCurrencyStore";
import React from "react";

// La prop 'event' ahora es la única necesaria, el resto viene del store.
interface Props {
    event: Event;
}

export default function EventListItem({ event }: Props) {
    const router = useRouter();
    const { mutate: toggleFavorite, isPending } = useToggleFavorite();

    // Obtenemos la moneda de VISUALIZACIÓN y las tasas de cambio del store de Zustand.
    const { displayCurrency, rates } = useCurrencyStore();

    const handleFavoritePress = () => {
        if (isPending) return;
        toggleFavorite(event.id);
    };

    // --- LÓGICA DE CONVERSIÓN DE PRECIOS ---

    // 1. Extraemos los datos del ticket de forma segura.
    const ticket = event.tickets?.[0];
    const priceInCents = ticket?.priceInCents ?? 0;
    const nativeCurrency = ticket?.currency ?? 'USD'; // Moneda en la que se vende el evento.

    // 2. Convertimos el precio nativo a una moneda base (USD).
    // Si el precio es 30,000 ARS, y la tasa es 1250 ARS/USD, el precio en USD será 24.
    const priceInUSD = (priceInCents / 100) / (rates[nativeCurrency] ?? 1);

    // 3. Convertimos el precio en USD a la moneda de visualización del usuario.
    // Si la moneda de visualización es ARS, el precio será 24 * 1250 = 30,000.
    const displayPrice = (priceInUSD * (rates[displayCurrency] ?? 1)).toFixed(2);
    
    const imageUrl = event.imageUrls?.[0] || "https://placehold.co/200";

    return (
        <TouchableOpacity
            onPress={() => router.push(`/event/${event.id}`)}
            className='flex-row items-start mb-4'
        >
            <Image
                source={{ uri: imageUrl }}
                className='w-24 h-24 rounded-lg bg-gray-200'
                resizeMode='cover'
            />
            <View className='flex-1 ml-4'>
                <Text className='text-primary font-bold text-lg' style={{ fontFamily: "Inter_700Bold" }}>{event.title}</Text>
                <Text className='text-secondary font-medium text-md mt-1'>{event.place}</Text>
                <Text className='text-secondary text-sm mt-1'>{event.address}, {event.city}</Text>
                <Text className='text-secondary text-sm mt-1'>
      {priceInCents > 0
        // ? `Desde ${nativeCurrency} ${displayPrice}`
        // Opcional: Mostrar también el precio nativo
        ? `DESDE APROX: ${displayCurrency} ${displayPrice} (${nativeCurrency} ${priceInCents / 100})`
        : "Gratis"
      }
    </Text>

            </View>
            <TouchableOpacity onPress={handleFavoritePress} disabled={isPending}>
                <Ionicons
                    name={event.isFavoritedByCurrentUser ? "heart" : "heart-outline"}
                    size={24}
                    color={event.isFavoritedByCurrentUser ? Colors.error : Colors.text.primary}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );
}