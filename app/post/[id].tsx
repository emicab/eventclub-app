// --- app/post/[id].tsx (Implementación Completa) ---
import {
    SafeAreaView, Text, View, FlatList, TextInput, TouchableOpacity,
    KeyboardAvoidingView, Platform, ActivityIndicator, Image
  } from 'react-native';
  import { useLocalSearchParams, Stack } from 'expo-router';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { useState, useEffect } from 'react';
  import apiClient from '@/src/lib/axios';
  import PostCardComment, { Post } from '@/src/components/shared/PostCardComment';
  import Colors from '@/src/constants/Colors';
  import { Ionicons } from '@expo/vector-icons';
  import { formatDistanceToNow } from 'date-fns';
  import { es } from 'date-fns/locale';
  import { useSocketListeners } from '@/src/hooks/useSocketListener';
  
  // --- Tipos de Datos ---
  type Comment = {
    id: string;
    text: string;
    createdAt: string;
    author: {
        lastName: string; firstName: string; profile?: { avatarUrl?: string } 
};
    _count: { likes: number };
    likedByCurrentUser: boolean;
    postId: string;
  };
  
  // --- Funciones de API ---
  const fetchPostDetails = async (postId: string): Promise<Post> => {
      const { data } = await apiClient.get(`/api/posts/${postId}`);
      return data;
  };
  const fetchComments = async (postId: string): Promise<Comment[]> => {
    const { data } = await apiClient.get(`/api/posts/${postId}/comments`);
    return data;
  };
  const addComment = async ({ postId, text }: { postId: string, text: string }) => {
      const { data } = await apiClient.post(`/api/posts/${postId}/comments`, { text });
      return data;
  };
  const toggleCommentLike = async (commentId: string) => {
    await apiClient.post(`/api/comments/${commentId}/like`);
  };
  
  // --- Componente para cada Comentario ---
  const CommentItem = ({ item }: { item: Comment }) => {
    const queryClient = useQueryClient();
    const { mutate: handleLike } = useMutation({
      mutationFn: () => toggleCommentLike(item.id),
      onSuccess: () => {
        // Invalidamos la query de comentarios de este post para que se actualice
        queryClient.invalidateQueries({ queryKey: ['comments', item.postId] });
      },
    });
    return (
      <View className="px-6 py-3 mt-2 flex-row justify-between items-start">
        <Image source={{ uri: item.author.profile?.avatarUrl || 'https://placehold.co/100' }} className="w-10 h-10 rounded-full mr-3" />
        <View className="flex-1">
          <View className="bg-card p-3 rounded-xl">
            <Text className="text-dark font-bold">{item.author.firstName} {item.author.lastName}</Text>
            <Text className="text-dark mt-1">{item.text}</Text>
          </View>
          <Text className="text-secondary text-xs mt-1 ml-2">
            {formatDistanceToNow(new Date(item.createdAt), { locale: es })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleLike()} className="flex-col items-center ml-2 pt-2">
          <Ionicons
            name={item.likedByCurrentUser ? 'heart' : 'heart-outline'}
            size={20}
            color={item.likedByCurrentUser ? Colors.error : Colors.text.secondary}
          />
          {item._count.likes > 0 && (
            <Text className="text-secondary text-xs">{item._count.likes}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  // --- Componente Principal de la Pantalla ---
  export default function PostDetailScreen() {
    const { id: postId } = useLocalSearchParams();
    const [commentText, setCommentText] = useState('');
    const queryClient = useQueryClient();
    useSocketListeners(); // Activa los listeners para actualizaciones en tiempo real
  
    const { data: post, isLoading: isLoadingPost } = useQuery({
      queryKey: ['postDetails', postId],
      queryFn: () => fetchPostDetails(postId as string),
      enabled: !!postId,
    });
  
    const { data: comments, isLoading: isLoadingComments } = useQuery({
      queryKey: ['comments', postId],
      queryFn: () => fetchComments(postId as string),
      enabled: !!postId,
    });
  
    const { mutate: handleAddComment, isPending: isPostingComment } = useMutation({
      mutationFn: () => addComment({ postId: postId as string, text: commentText }),
      onSuccess: () => {
        setCommentText('');
        queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      }
    });
  
    return (
      <SafeAreaView className="flex-1 bg-background pt-6 my-safe">
        <Stack.Screen options={{ title: 'Publicación', headerTintColor: Colors.text.primary, headerStyle:{backgroundColor: Colors.background} }} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          className="flex-1"
          keyboardVerticalOffset={20}
        >
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              isLoadingPost ? <ActivityIndicator className="my-4" /> : (
                post ? <View className="p-4 border-b border-glass-border"><PostCardComment post={post} /></View> : null
              )
            }
            renderItem={({ item }) => <CommentItem item={item} />}
            ListEmptyComponent={
              !isLoadingComments ? <Text className="text-secondary text-center p-4">Sé el primero en comentar.</Text> : null
            }
            ItemSeparatorComponent={() => <View className="h-1"/>}
            contentContainerStyle={{ paddingBottom: 10 }}
          />
          
          {/* --- Input para Nuevo Comentario --- */}
          <View className="p-4 border-t border-glass-border bg-background">
            <View className="flex-row items-center bg-card p-2 rounded-full">
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Escribe un comentario..."
                placeholderTextColor={Colors.text.secondary}
                className="flex-1 text-dark px-4"
              />
              <TouchableOpacity
                onPress={() => handleAddComment()}
                disabled={isPostingComment || !commentText}
                className={`p-2 rounded-full ${isPostingComment || !commentText ? 'opacity-50' : ''}`}
              >
                <Ionicons name="send" size={24} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  