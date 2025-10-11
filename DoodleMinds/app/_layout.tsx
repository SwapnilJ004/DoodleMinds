import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)/index" options={{ title: 'Landing' }} />
        <Stack.Screen name="(tabs)/juniorPlayback" options={{ title: 'Home' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
