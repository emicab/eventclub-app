// En app/(tabs)/profile.tsx

import {
    SafeAreaView, Text, View, Image, TouchableOpacity,
    ScrollView, ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/useAuthStore";
import apiClient from "@/src/lib/axios";
import { UserProfile } from "@/src/types";
import Colors from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import ActionButton from "@/src/components/ui/ActionButton";
import InfoChip from "@/src/components/profile/InfoChip";


const fetchMyProfile = async (): Promise<UserProfile> => {
    const { data } = await apiClient.get("/api/users/me");
    return data;
};

const getAge = (dateString?: string | Date) => {
    if (!dateString) return null;
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
};

export default function ProfileScreen() {
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();

    const { data: user, isLoading, isError } = useQuery({
        queryKey: ["myProfile"],
        queryFn: fetchMyProfile,
        refetchOnWindowFocus: true,
    });

    const handleLogout = () => {
        logout();
        router.replace('/login'); // Redirige a la pantalla de login
    };

    if (isLoading) return <SafeAreaView className='flex-1 bg-background justify-center'><ActivityIndicator size='large' /></SafeAreaView>;
    if (isError) return <SafeAreaView className='flex-1 bg-background justify-center'><Text className='text-error'>Error al cargar el perfil.</Text></SafeAreaView>;

    const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
    const age = getAge(user?.profile?.dateOfBirth);

    return (
        <SafeAreaView className='flex-1 bg-background my-safe'>
            <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                <View className='p-6'>
                    {/* --- Cabecera --- */}
                    <View className='flex-row items-center justify-between'>
                        <View className='flex-row items-center flex-1'>
                            <Image
                                source={{ uri: user?.profile?.avatarUrl || "https://placehold.co/100" }}
                                className='w-20 h-20 rounded-full'
                            />
                            <View className='ml-4'>
                                <Text className='text-primary text-2xl font-bold'>{fullName}</Text>
                                <Text className='text-secondary text-lg'>@{user?.profile?.nickname}</Text>
                                <Text className='text-accent mt-1'>✨ {user?.points || 0} Puntos</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => router.push("/profile/edit")}>
                            <Ionicons name='create-outline' size={28} color={Colors.text.secondary} />
                        </TouchableOpacity>
                    </View>

                    {/* --- Panel de Acciones Rápidas --- */}
                    <View className="mt-8">
                        <View className="flex-row gap-3 mb-3">
                           <ActionButton icon="qr-code" text="Mi QR" href="/profile/my-qr" />
                           <ActionButton icon="camera" text="Escanear" href="/profile/scan-qr" />
                        </View>
                        <View className="flex-row gap-3">
                           <ActionButton icon="people-outline" text="Amigos" href="/profile/friends" />
                           <ActionButton icon="heart-outline" text="Favoritos" href="/profile/favorites" />
                        </View>
                        <View className="flex-row gap-3">
                           <ActionButton icon="ticket-outline" text="Mis Entradas" href="/profile/tickets" />
                           <ActionButton icon="pricetag-outline" text="Beneficios Usados" href="/profile/benefits-history" />
                        </View>
                    </View>

                    {/* --- Sobre mí --- */}
                    <View className='mt-6 p-4 bg-background rounded-2xl border-2 border-accent'>
                        <Text className='text-primary text-lg font-bold mb-2'>Sobre mí</Text>
                        <Text className='text-secondary'>{user?.profile?.bio || "Añade una descripción sobre ti para que otros puedan conocerte mejor."}</Text>
                        <View className='flex-row flex-wrap mt-4'>
                            {user?.profile?.city && <InfoChip icon='location-outline' text={`Vive en ${user.profile.city}`} />}
                            {user?.profile?.hometown && <InfoChip icon='flag-outline' text={`De ${user.profile.hometown}`} />}
                            {age && <InfoChip icon='calendar-outline' text={`${age} años`} />}
                        </View>
                    </View>

                    <View className='mt-6 p-4 bg-background rounded-2xl border-2 border-accent'>
                        <Text className='text-primary text-lg font-bold mb-2'>CV Express</Text>
                        <Text className='text-secondary'>{user?.profile?.bio || "Añade una descripción sobre ti para que otros puedan conocerte mejor."}</Text>
                        <View className='flex-row flex-wrap mt-4'>
                            {user?.profile?.skills && user.profile.skills.map((skill: string, index: number) => (
                                <InfoChip key={index} icon='checkmark' text={skill} />
                            ))}
                            
                        </View>
                    </View>
                    
                    {/* --- Botón de Cerrar Sesión --- */}
                    <TouchableOpacity className='w-full mt-8 p-4 items-center' onPress={handleLogout}>
                        <Text className='text-primary font-bold'>Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}