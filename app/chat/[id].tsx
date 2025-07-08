// En app/chat/[id].tsx
import { useState, useEffect, useCallback } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getMessages } from '@/src/api/chat';
import { useAuthStore } from '@/src/store/useAuthStore';
import { ActivityIndicator, View } from 'react-native';
import { Message } from '@/src/types';
import { useSocketListeners } from '@/src/hooks/useSocketListener';

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

export default function ChatScreen() {
    const { id: conversationId } = useLocalSearchParams();
    const { user: currentUser } = useAuthStore();
    const socket = useSocketListeners(); // Un hook simple para obtener la instancia del socket

    const [messages, setMessages] = useState<IMessage[]>([]);

    // 1. Cargamos el historial de mensajes con useQuery
    const { data: initialMessages, isLoading } = useQuery({
        queryKey: ['messages', conversationId],
        queryFn: () => getMessages(conversationId as string),
        enabled: !!conversationId,
    });

    // 2. Efecto para manejar la conexión del socket y cargar mensajes iniciales
    useEffect(() => {
        // Cuando los mensajes iniciales cargan, los ponemos en el estado
        if (initialMessages) {
            setMessages(formatMessagesForGiftedChat(initialMessages));
        }

        if (socket && conversationId) {
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
        <View className='flex-1 bg-background my-safe'>
            <GiftedChat
                messages={messages}
                onSend={messages => onSend(messages)}
                user={{
                    _id: currentUser!.id,
                }}
                placeholder="Escribe un mensaje..."
                // Estilos para que coincida con tu tema oscuro
                messagesContainerStyle={{ backgroundColor: '#0d1117' }}
                textInputProps={{
                    placeholderTextColor: '#6e7681', // Color del placeholderTextColor}
                    style: { color: '#c9d1d9' }, // Color del texto del input
                }}
                renderUsernameOnMessage={true}
            />
        </View>
    );
}