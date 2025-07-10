import { useRouter, Stack } from "expo-router";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Ionicons } from "@expo/vector-icons";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Image, Text, TouchableOpacity, View } from "react-native";

const ConversationListItem = ({ item }) => {
    const router = useRouter();
    const { user: currentUser } = useAuthStore();
  
    // El backend nos devuelve ambos participantes, filtramos para quedarnos con el otro
    const otherParticipant = item.participants.find(
      (p) => p.id !== currentUser?.id
    );
  
    const handleDelete = () => {
      console.log("Delete conversation:", item.id);
    };
  
    function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
      const styleAnimation = useAnimatedStyle(() => {
      //   console.log("showRightProgress:", prog);
      //   console.log("appliedTranslation:", drag);
  
        return {
          transform: [{ translateX: drag.value + 100 }],
        };
      });
  
      return (
        <Reanimated.View
          style={styleAnimation}
          className={"flex-row items-center justify-center"}
        >
          <TouchableOpacity
            onPress={handleDelete}
            className="flex-row items-center justify-center p-5 bg-red-400"
          >
            <Ionicons name="trash" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className="flex-row items-center justify-center p-5 bg-amber-400"
          >
            <Ionicons name="archive" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </Reanimated.View>
      );
    }
  
    return (
      <GestureHandlerRootView>
        <ReanimatedSwipeable
          containerStyle={{ height: 70 }}
          friction={4}
          rightThreshold={10}
          renderRightActions={(prog, drag) => RightAction(prog, drag)}
        >
          <TouchableOpacity
            onPress={() => router.push(`/chat/${item.id}`)}
            className="flex-row items-center p-3"
          >
            <Image
              source={{
                uri:
                  otherParticipant?.profile?.avatarUrl ||
                  "https://placehold.co/100",
              }}
              className="w-14 h-14 bg-slate-200 rounded-full"
            />
            <View className="ml-4 flex-1">
              <Text className="text-primary font-bold text-lg">
                {otherParticipant?.firstName}
              </Text>
              <Text className="text-secondary mt-1" numberOfLines={1}>
                {item.messages?.[0]?.text || "Inicia la conversación..."}
              </Text>
            </View>
          </TouchableOpacity>
        </ReanimatedSwipeable>
      </GestureHandlerRootView>
    );
  };

  export default ConversationListItem;