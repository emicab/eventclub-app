// En app/chat/_layout.tsx
import { Stack } from 'expo-router';
import Colors from '@/src/constants/Colors';

export default function ChatLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text.primary,
      }}
    />
  );
}