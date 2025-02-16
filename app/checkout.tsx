import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 

export default function CheckoutScreen() {
  const router = useRouter();

  // Generate upcoming two Saturdays and Sundays
  const getUpcomingWeekends = () => {
    let weekends = [];
    let today = new Date();

    while (weekends.length < 4) {
      today.setDate(today.getDate() + 1);
      if (today.getDay() === 6 || today.getDay() === 0) {
        weekends.push(new Date(today)); // clone date to prevent mutation
      }
    }
    return weekends;
  };

  const upcomingWeekends = getUpcomingWeekends();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Store order in AsyncStorage and navigate to Receipt screen
  const confirmOrder = async () => {
    if (!selectedDate) {
      Alert.alert("Error", "Please select a delivery date.");
      return;
    }

    try {
      router.replace("/receipt"); // Navigate to receipt screen
    } catch (error) {
      Alert.alert("Error", "Failed to save order details.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace("/cart")}>
        <Ionicons name="arrow-back" size={24} color="black" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Select Delivery Date</Text>
      {upcomingWeekends.map((date, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.dateButton,
            selectedDate?.toDateString() === date.toDateString() && styles.selectedDate,
          ]}
          onPress={() => setSelectedDate(date)}
        >
          <Text style={styles.dateText}>{date.toDateString()}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.confirmButton} onPress={confirmOrder}>
        <Text style={styles.confirmButtonText}>Confirm Order</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F4C8",
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 100, // Adjusted for back button space
  },
  dateButton: {
    backgroundColor: "#FFA500",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  selectedDate: {
    backgroundColor: "#FF6347", // Changes color when selected
  },
  dateText: {
    color: "white",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    marginTop: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});