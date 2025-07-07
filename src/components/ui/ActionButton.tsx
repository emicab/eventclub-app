import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/Colors";


const ActionButton = ({ icon, text, href }: { icon: keyof typeof Ionicons.glyphMap, text: string, href: string }) => {
    const router = useRouter();
    return (
        <TouchableOpacity
            onPress={() => router.push(href as any)}
            className="flex-1 bg-background border-2 border-accent p-3 rounded-lg items-center justify-center min-w-[48%]"
        >
            <Ionicons name={icon} size={28} color={Colors.accent} />
            <Text className="text-primary mt-1.5 font-semibold text-xs">{text}</Text>
        </TouchableOpacity>
    );
};

export default ActionButton