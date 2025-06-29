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

// Definimos los tipos para un post, coincidiendo con tu API
export type UserInfo = {
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
  imageUrl?: string;
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

export default function PostCard({ post }: PostCardProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const authorName = `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim();
  const avatarUrl = post.author.profile?.avatarUrl || 'https://placehold.co/100';

  const { mutate: handleLike } = useMutation({
    mutationFn: () => toggleLike(post.id),
    onSuccess: () => {
      // Invalidamos la query para que se refresque inmediatamente
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  console.log('post:: ', post)
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
              className="w-10 h-10 rounded-full"
            />
            <View className="ml-3">
              <Text className="text-primary" style={{ fontFamily: 'Inter_700Bold' }}>
                {authorName}
              </Text>
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

        {/* --- Imagen del Post (si existe) --- */}
        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            className="w-full h-56 rounded-lg mb-3"
          />
        )}

        {/* --- Pie de Post (Likes, Comentarios y Acciones) --- */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={() => handleLike()} className="flex-row items-center">
              <Ionicons name={post.likedByCurrentUser ? "heart" : "heart-outline"} size={24} color={post.likedByCurrentUser ? Colors.error : Colors.text.primary} />
              <Text className="text-secondary ml-1.5" style={{ fontFamily: 'Inter_400Regular' }}>{post._count.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push(`/post/${post.id}`)} className="flex-row items-center">
              <Ionicons name="chatbubble-outline" size={22} color={Colors.text.secondary} />
              <Text className="text-secondary ml-1.5" style={{ fontFamily: 'Inter_400Regular' }}>{post._count.comments}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity>
            <Ionicons name="arrow-redo-outline" size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
        {/* --- SECCIÓN DEL ÚLTIMO COMENTARIO --- */}
      </BlurView>
        {post.lastComment && (
          <View className=" bg-dark py-3 border-t border-glass-border/50 opacity-40">
            <TouchableOpacity onPress={() => router.push(`/post/${post.id}`)} className="flex-row ml-6">
              <Text className="text-secondary" style={{ fontFamily: 'Inter_700Bold' }}>
                {post.lastComment.author.firstName} {post.lastComment.author.lastName}: {' '}
              </Text>
              <Text className="text-secondary flex-1" numberOfLines={1}>
                {post.lastComment.text}
              </Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
}
