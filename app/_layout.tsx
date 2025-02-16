import { Stack } from "expo-router";
import { CartProvider } from "./CartContext"; // Import CartProvider
import { View } from "react-native"; // ensuring all components are properly wrapped
export default function RootLayout() {
  return (
    <View style={{ flex: 1 }}> 
    <CartProvider>  
       {/* Ensure root component is a View */}
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="user" options={{ headerShown: false }} />
          <Stack.Screen name="farmer" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="receipt" options={{ headerShown: false }} />
        </Stack>
    </CartProvider>
    </View>
  );
}
