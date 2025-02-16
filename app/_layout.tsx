import { Stack } from "expo-router";
import { CartProvider } from "./CartContext"; // Import CartProvider
import { View } from "react-native"; // Ensure all components are properly wrapped

export default function RootLayout() {
  return (
    <CartProvider>  
      <View style={{ flex: 1 }}>  {/* Ensure root component is a View */}
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="user" options={{ headerShown: false }} />
          <Stack.Screen name="farmer" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
        </Stack>
      </View>
    </CartProvider>
  );
}
