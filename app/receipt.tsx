import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ReceiptScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/cart")}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Order Receipt</Text>

      <Text style={styles.message}>
        Your order has been successfully placed! You will receive details upon confirmation.
      </Text>

      <TouchableOpacity style={styles.confirmButton} onPress={() => router.replace("/user")}>
        <Text style={styles.confirmButtonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles matching CheckoutScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4C8", // Matches the CheckoutScreen background
    padding: 20,
    alignItems: "center",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 50,
    left: 20,
  },
  backButtonText: {
    fontSize: 18,
    marginLeft: 5,
    color: "black",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 120, // Spacing for back button
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: "center",
    color: "#555",
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    marginTop: 20,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

