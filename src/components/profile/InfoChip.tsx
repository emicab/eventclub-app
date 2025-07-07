import Colors from "@/src/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

const InfoChip = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap, text: string }) => (
    <View className='flex-row items-center bg-white/5 rounded-full px-3 py-1.5 mr-2 mb-2'>
        <Ionicons name={icon} size={14} color={Colors.text.secondary} />
        <Text className='text-secondary text-xs ml-1.5'>{text}</Text>
    </View>
);

export default InfoChip;