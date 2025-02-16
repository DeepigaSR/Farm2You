import { View, Text, StyleSheet } from "react-native";

export default function WeatherScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Weather Forecast</Text>
      <Text>Sunny, 75°F</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 24, fontWeight: "bold" }
});

