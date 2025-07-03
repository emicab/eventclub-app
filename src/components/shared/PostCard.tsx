import { View, Text, Image, TouchableOpacity, Alert, ActionSheetIOS } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns'; // <-- 1. Importar la función
import { es } from 'date-fns/locale';      // <-- 2. Importar el idioma español
import Colors from '@/src/constants/Colors';
import apiClient from '@/src/lib/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import VerifyCheckIcon from '../ui/VerifyCheckIcon';
import { Post, UserInfo } from '@/src/types';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useActionSheet } from '@expo/react-native-action-sheet';


type PostCardProps = {
  post: Post;
};

// Función auxiliar para formatear la fecha
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
};

const deletePost = async (postId: string) => {
  await apiClient.delete(`/api/posts/${postId}`);
};

const toggleLike = async (postId: string) => {
  const { data } = await apiClient.post(`/api/posts/${postId}/like`);
  return data;
};

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { showActionSheetWithOptions } = useActionSheet();


  const authorName = `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim();
  const avatarUrl = post.author.profile?.avatarUrl || 'https://placehold.co/100';

  const { mutate: handleLike } = useMutation({
    mutationFn: () => toggleLike(post.id),
    onSuccess: () => {
      // Invalidamos la query para que se refresque inmediatamente
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  console.log('user:: ', user.role)

  const { mutate: handleDeletePost } = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      Alert.alert('Éxito', 'La publicación ha sido eliminada.');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar la publicación.');
    },
  });

  const showPostOptions = () => {
    const canDelete = user?.id === post.author.id || user?.role === 'ADMIN';

    const options = canDelete
      ? ['Eliminar Publicación', 'Cancelar', '——' ]
      : ['Denunciar Publicación', 'Cancelar', '——' ];

    const cancelButtonIndex = 1;
    const destructiveButtonIndex = canDelete ? 0 : undefined;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
        title: 'Opciones de publicación',
      },
      (buttonIndex) => {
        if (canDelete && buttonIndex === 0) {
          Alert.alert(
            'Eliminar Publicación',
            '¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Eliminar', style: 'destructive', onPress: () => handleDeletePost() },
            ]
          );
        } else if (!canDelete && buttonIndex === 0) {
          Alert.alert('Denunciar', 'La funcionalidad de denuncias estará disponible pronto.');
        }
      }
    );
  };

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
              <View className="flex-row items-center">
                <Text className="text-primary mr-2" style={{ fontFamily: 'Inter_700Bold' }}>
                  {authorName}
                </Text>
                <Text>
                  {
                    post?.author?.isVerified && (
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
          <TouchableOpacity onPress={() => showPostOptions()}>
            <Ionicons name="ellipsis-horizontal" size={24} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* --- Contenido del Post --- */}
        <Text className="text-primary mb-2" style={{ fontFamily: 'Inter_400Regular', lineHeight: 22 }}>
          {post.content}
        </Text>

        {/* --- Imagen del Post (si existe) --- */}
        {/* --- Vista Previa de la Imagen (si existe) --- */}
        {post.imageUrls && post.imageUrls.length > 0 && (
          <View className="mt-2 mb-3 rounded-lg overflow-hidden">
            <TouchableOpacity onPress={() => router.push(`/post/${post.id}`)}>
              <Image
                source={{ uri: post.imageUrls[0] }} // Solo mostramos la primera imagen
                className="  rounded-lg"
                style={{ aspectRatio: 1 }}
              />
            </TouchableOpacity>
          </View>
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

      </BlurView>
      {/* --- SECCIÓN DEL ÚLTIMO COMENTARIO --- */}
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
