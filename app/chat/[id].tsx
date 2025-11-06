import { useState, useEffect, useCallback } from 'react';
import { Bubble, GiftedChat, IMessage, InputToolbar, Send } from 'react-native-gifted-chat';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/src/api/chat';
import { useAuthStore } from '@/src/store/useAuthStore';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { Message } from '@/src/types';
import { useSocketListeners } from '@/src/hooks/useSocketListener';
import { useSocket } from '@/src/context/SocketContext';
import Colors from '@/src/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/src/lib/axios';

// Función para adaptar nuestros mensajes al formato de GiftedChat
const formatMessagesForGiftedChat = (messages: Message[]): IMessage[] => {
    return messages.map(msg => ({
        _id: msg.id,
        text: msg.text,
        createdAt: new Date(msg.createdAt),
        user: {
            _id: msg.sender.id,
            name: msg.sender.firstName,
            avatar: msg.sender.profile?.avatarUrl,
        },
    }));
};

const fetchConversationDetails = async (conversationId: string) => {
    const { data } = await apiClient.get(`/api/conversations/${conversationId}`);
    return data;
};

export default function ChatScreen() {
    const { id: conversationId } = useLocalSearchParams();
    const { user: currentUser } = useAuthStore();
    const router = useRouter();
    const socket = useSocket();

    const [messages, setMessages] = useState<IMessage[]>([]);

    // 1. Cargamos el historial de mensajes con useQuery
    const { data: initialMessages, isLoading } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: () => getMessages(conversationId as string),
        enabled: !!conversationId,
        refetchOnWindowFocus: true
    });

    const { data: conversationDetails } = useQuery({
        queryKey: ['conversationDetails', conversationId],
        queryFn: () => fetchConversationDetails(conversationId as string),
        enabled: !!conversationId,
    });

    const otherParticipant = conversationDetails?.participants[0];


    // 2. Efecto para manejar la conexión del socket y cargar mensajes iniciales
    useEffect(() => {
        // Cuando los mensajes iniciales cargan, los ponemos en el estado
        if (initialMessages) {
            setMessages(formatMessagesForGiftedChat(initialMessages));
        }

        if (socket && conversationId) {
            console.log("✅ Socket listo. Uniéndome a la conversación:", conversationId);
            // Nos unimos a la sala de la conversación
            socket.emit('join_conversation', conversationId);

            // Escuchamos por nuevos mensajes
            const handleReceiveMessage = (newMessage: Message) => {
                const formattedMessage = formatMessagesForGiftedChat([newMessage])[0];
                setMessages(previousMessages => GiftedChat.append(previousMessages, [formattedMessage]));
            };

            socket.on('receive_message', handleReceiveMessage);

            // Al salir de la pantalla, nos vamos de la sala y limpiamos el listener
            return () => {
                socket.emit('leave_conversation', conversationId);
                socket.off('receive_message', handleReceiveMessage);
            };
        }
    }, [socket, conversationId, initialMessages]);


    // 3. Función que se ejecuta cuando el usuario envía un mensaje
    const onSend = useCallback((newMessages: IMessage[] = []) => {
        const text = newMessages[0].text;
        if (socket && conversationId) {
            // Emitimos el mensaje al backend vía Socket.IO
            socket.emit('send_message', { conversationId, text });
        }
    }, [socket, conversationId]);


    if (isLoading) {
        return <ActivityIndicator />;
    }

    return (
        <View className='flex-1 bg-background mt-safe pb-safe'>
            <View className='flex-row items-center justify-start ml-4'>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back-sharp" size={26} color={Colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push(`/user/${otherParticipant.id}`)}
                    className="flex-row items-center px-6 mt-6 mb-4"
                >
                    <Image
                        source={{ uri: otherParticipant?.profile?.avatarUrl || 'https://placehold.co/100' }}
                        className="w-12 h-12 rounded-full mr-3"
                    />
                    <Text className="text-primary font-bold text-2xl">
                        {otherParticipant?.firstName}
                    </Text>
                </TouchableOpacity>
            </View>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: currentUser!.id,
                }}
                placeholder="Escribe un mensaje..."
                alwaysShowSend
                // --- INICIO DE LA PERSONALIZACIÓN ---

                renderInputToolbar={(props) => (
                    <InputToolbar
                        {...props}

                        containerStyle={{
                            backgroundColor: '#161B22',
                            borderTopColor: Colors.glass.border,
                            borderTopWidth: 1,
                            paddingVertical: 8,
                            paddingHorizontal: 12,

                        }}
                    // primaryStyle={{ alignItems: 'center' }}
                    />
                )}
                // Estilo para el campo de texto en sí
                // @ts-ignore
                textInputStyle={{
                    // backgroundColor: '#21262D',
                    // borderRadius: 20,
                    // paddingHorizontal: 12,
                    // paddingVertical: 10,
                    color: Colors.text.primary, // ¡La corrección clave! Color del texto que escribes
                    marginRight: 8,
                }}
                placeholderTextColor={Colors.text.secondary}

                // 2. Reemplaza el botón de "Enviar" por un icono
                renderSend={(props) => (
                    <Send {...props} containerStyle={{ justifyContent: 'center' }}>
                        <Ionicons name="arrow-up-circle" size={36} color={Colors.accent} />
                    </Send>
                )}

                // 3. Estiliza las burbujas de los mensajes
                renderBubble={(props) => (
                    <Bubble
                        {...props}
                        textStyle={{
                            right: {
                                color: Colors.text.primary,
                                paddingHorizontal: 10,
                                textAlign: 'right'
                            }, // Texto del usuario actual
                            left: {
                                color: Colors.text.primary,
                                paddingHorizontal: 10,
                                textAlign: 'right'
                            }, // Texto del otro usuario
                        }}
                        wrapperStyle={{
                            right: {
                                backgroundColor: Colors.accent, // Burbuja del usuario actual
                                marginRight: 5,
                            },
                            left: {
                                backgroundColor: '#21262D', // Burbuja del otro usuario
                                marginLeft: 5, // Alinea con el avatar
                            },
                        }}
                        // @ts-ignore
                        timeTextStyle={{
                            right: { color: 'rgba(13, 17, 23, 0.7)' },
                            left: { color: Colors.text.secondary },
                        }}
                    />
                )}

                // 4. Pequeños retoques adicionales
                renderAvatar={null}
                showUserAvatar={false}
                messagesContainerStyle={{ paddingBottom: 20, backgroundColor: '#0d1117' }}
            />
        </View>
    );
}