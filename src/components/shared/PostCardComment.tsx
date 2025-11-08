// --- src/components/shared/PostCard.tsx (Actualizado) ---
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns'; // <-- 1. Importar la función
import { es } from 'date-fns/locale';      // <-- 2. Importar el idioma español
import Colors from '@/src/constants/Colors';
import apiClient from '@/src/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import VerifyCheckIcon from '../ui/VerifyCheckIcon';
import { useState } from 'react';
import ImageView from "react-native-image-viewing";
import React from 'react';

// Definimos los tipos para un post, coincidiendo con tu API
export type UserInfo = {
  isVerified: any;
  firstName: string;
  lastName: string;
  profile: {
    avatarUrl?: string;
  };
};

export type Post = {
  likedByCurrentUser: any;
  lastComment: any;
  id: string;
  author: UserInfo;
  content: string;
  imageUrls?: string;
  _count: {
    likes: number;
    comments: number;
  };
  createdAt: string; // Recibimos la fecha como un string ISO
};

type PostCardProps = {
  post: Post;
};

// Función auxiliar para formatear la fecha
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
};

const toggleLike = async (postId: string) => {
  const { data } = await apiClient.post(`/api/posts/${postId}/like`);
  return data;
};

export default function PostCardComment({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visible, setIsVisible] = useState(false);

  const imagesForViewer = post.imageUrls?.map(url => ({ uri: url })) || [];

  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setIsVisible(true);
  };

  const authorName = `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim();
  const avatarUrl = post.author.profile?.avatarUrl || 'https://placehold.co/100';

  const { mutate: handleLike } = useMutation({
    mutationFn: () => toggleLike(post.id),
    onSuccess: () => {
      // Invalidamos la query para que se refresque inmediatamente
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
    },
    
  });

  return (
    <View className="w-full rounded-2xl overflow-hidden">
      <BlurView
        intensity={80}
        tint="dark"
        style={{
          borderColor: Colors.glass.border,
          backgroundColor: Colors.glass.background,
          borderWidth: 1,
        }}
        className="p-4"
      >
        {/* --- Cabecera del Post --- */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Image
              source={{ uri: avatarUrl }}
              className="w-10 h-10 rounded-full mr-2"
            />
            <View className="flex items-start ml-2">
              <View className='flex-row justify-center'>
                <Text className="text-primary mr-2" style={{ fontFamily: 'Inter_700Bold' }}>
                  {authorName}
                </Text>
                <Text>
                  {
                    post.author?.isVerified && (
                      <VerifyCheckIcon className="w-2 h-2 ml-2" color={Colors.accent} />
                    )
                  }
                </Text>
              </View>
              <Text className="text-secondary text-xs" style={{ fontFamily: 'Inter_400Regular' }}>
                {/* 3. Usamos la nueva función para mostrar la fecha relativa */}
                {formatRelativeTime(post.createdAt)}
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* --- Contenido del Post --- */}
        <Text className="text-primary mb-3" style={{ fontFamily: 'Inter_400Regular', lineHeight: 22 }}>
          {post.content}
        </Text>

        {/* --- Galería de Imágenes --- */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <View className="mt-3 mb-2 -mx-1 flex-row flex-wrap">
            {post.imageUrls.slice(0, 4).map((url, index) => ( // Mostramos hasta 4 imágenes
              <TouchableOpacity
                key={index}
                className="w-1/2 p-1 relative"
                onPress={() => openImageViewer(index)}
              >
                <Image source={{ uri: url }} className="w-full aspect-square rounded-md" />
                {index === 3 && post.imageUrls.length > 4 && (
                  <View className="absolute inset-1 bg-black/60 rounded-md justify-center items-center">
                    <Text className="text-white text-2xl font-bold">+{post.imageUrls.length - 4}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* --- Pie de Post (Likes, Comentarios y Acciones) --- */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => handleLike()} className="flex-row items-center">
              <Ionicons name={post.likedByCurrentUser ? "heart" : "heart-outline"} size={24} color={post.likedByCurrentUser ? Colors.like : Colors.text.primary} />
              <Text className="text-secondary ml-1.5" style={{ fontFamily: 'Inter_400Regular' }}>{post._count.likes}</Text>
            </TouchableOpacity>
            <View className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={22} color={Colors.text.secondary} />
              <Text className="text-secondary ml-1.5" style={{ fontFamily: 'Inter_400Regular' }}>{post._count.comments}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="arrow-redo-outline" size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Visor de Imágenes Modal */}
        <ImageView
          images={imagesForViewer}
          imageIndex={currentImageIndex}
          visible={visible}
          onRequestClose={() => setIsVisible(false)}
          
        />

      </BlurView>
    </View>
  );
}
