import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/src/api/chat";
import ConversationListItem from "@/src/components/chat/ConversationListItem";
import { Stack } from "expo-router";

export default function ConversationsScreen() {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
  });

  if (isLoading) return <ActivityIndicator />;

  return (
    <View className="flex-1 bg-background my-safe px-6">
      <Stack.Screen options={{ headerShown: false }} />
      <Text className="text-primary font-bold px-4 my-6 text-2xl">
        Mis mensajes
      </Text>
      <FlatList
        data={conversations}
        renderItem={({ item }) => <ConversationListItem item={item} />}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <View className="h-px bg-glass-border ml-20" />
        )}
      />
    </View>
  );
}
